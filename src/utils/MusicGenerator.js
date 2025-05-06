/**
 * MusicGenerator.js
 * Utility for generating background music for the Dofus Lore Trivia game
 * Uses Web Audio API to create procedural music
 */

// Constants for music generation
const NOTE_FREQUENCIES = {
  'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63,
  'F': 349.23, 'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00,
  'A#': 466.16, 'B': 493.88
};

// Dofus-themed scales
const DOFUS_SCALES = {
  main: ['C', 'D', 'E', 'G', 'A'], // Pentatonic scale for main theme
  game: ['D', 'E', 'F#', 'A', 'B'], // Pentatonic scale for game theme
  results: ['G', 'A', 'B', 'D', 'E'] // Pentatonic scale for results theme
};

/**
 * Generate a background music track
 * @param {AudioContext} audioContext - The Web Audio API context
 * @param {string} theme - The theme of music to generate ('main', 'game', or 'results')
 * @param {number} duration - Duration in seconds
 * @param {boolean} isInDiscord - Whether the app is running in Discord (simplified version)
 * @returns {AudioBuffer} The generated music as an AudioBuffer
 */
export function generateBackgroundMusic(audioContext, theme = 'main', duration = 60, isInDiscord = false) {
  // Use a simpler version for Discord to save resources
  if (isInDiscord) {
    return generateSimpleBackgroundMusic(audioContext, theme, duration);
  }
  
  // Sample rate and buffer setup
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);
  
  // Get left and right channel data
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  // Get the appropriate scale for the theme
  const scale = DOFUS_SCALES[theme] || DOFUS_SCALES.main;
  
  // Music structure parameters
  const bpm = theme === 'game' ? 95 : (theme === 'results' ? 85 : 75); // Different tempos for different themes
  const beatsPerMeasure = 4;
  const samplesPerBeat = (60 / bpm) * sampleRate;
  const samplesPerMeasure = samplesPerBeat * beatsPerMeasure;
  
  // Generate a melody pattern
  const melodyPattern = generateMelodyPattern(scale, theme);
  
  // Generate a bass pattern
  const bassPattern = generateBassPattern(scale, theme);
  
  // Fill the buffer with music data
  let currentSample = 0;
  
  while (currentSample < bufferSize) {
    // Calculate which measure and beat we're on
    const currentMeasure = Math.floor(currentSample / samplesPerMeasure);
    const currentBeat = Math.floor((currentSample % samplesPerMeasure) / samplesPerBeat);
    
    // Get the current melody note
    const melodyNoteIndex = (currentMeasure * beatsPerMeasure + currentBeat) % melodyPattern.length;
    const melodyNote = melodyPattern[melodyNoteIndex];
    
    // Get the current bass note
    const bassNoteIndex = (currentMeasure * beatsPerMeasure + currentBeat) % bassPattern.length;
    const bassNote = bassPattern[bassNoteIndex];
    
    // Generate one beat of audio
    for (let i = 0; i < samplesPerBeat && currentSample + i < bufferSize; i++) {
      // Calculate the sample value based on melody and bass notes
      const melodyValue = melodyNote ? Math.sin(2 * Math.PI * NOTE_FREQUENCIES[melodyNote] * (currentSample + i) / sampleRate) * 0.2 : 0;
      const bassValue = bassNote ? Math.sin(2 * Math.PI * NOTE_FREQUENCIES[bassNote] / 2 * (currentSample + i) / sampleRate) * 0.3 : 0;
      
      // Apply envelope to make it sound more natural
      const envelope = Math.min(1, (i / (samplesPerBeat * 0.1))) * Math.min(1, ((samplesPerBeat - i) / (samplesPerBeat * 0.5)));
      
      // Combine melody and bass with slight stereo effect
      leftChannel[currentSample + i] = (melodyValue * 1.1 + bassValue) * envelope * 0.5;
      rightChannel[currentSample + i] = (melodyValue + bassValue * 1.1) * envelope * 0.5;
    }
    
    currentSample += samplesPerBeat;
  }
  
  return buffer;
}

/**
 * Generate a simplified background music track for Discord
 * @param {AudioContext} audioContext - The Web Audio API context
 * @param {string} theme - The theme of music to generate
 * @param {number} duration - Duration in seconds
 * @returns {AudioBuffer} The generated music as an AudioBuffer
 */
function generateSimpleBackgroundMusic(audioContext, theme, duration) {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const channel = buffer.getChannelData(0);
  
  // Get the appropriate scale for the theme
  const scale = DOFUS_SCALES[theme] || DOFUS_SCALES.main;
  
  // Simplified music parameters
  const bpm = 80;
  const samplesPerBeat = (60 / bpm) * sampleRate;
  
  // Generate a simple pattern
  const pattern = [];
  for (let i = 0; i < 8; i++) {
    pattern.push(scale[Math.floor(Math.random() * scale.length)]);
  }
  
  // Fill the buffer with simplified music data
  let currentSample = 0;
  
  while (currentSample < bufferSize) {
    const noteIndex = Math.floor((currentSample / samplesPerBeat) % pattern.length);
    const note = pattern[noteIndex];
    
    for (let i = 0; i < samplesPerBeat && currentSample + i < bufferSize; i++) {
      const value = Math.sin(2 * Math.PI * NOTE_FREQUENCIES[note] * (currentSample + i) / sampleRate) * 0.2;
      const envelope = Math.min(1, (i / (samplesPerBeat * 0.1))) * Math.min(1, ((samplesPerBeat - i) / (samplesPerBeat * 0.5)));
      
      channel[currentSample + i] = value * envelope * 0.5;
    }
    
    currentSample += samplesPerBeat;
  }
  
  return buffer;
}

/**
 * Generate a melody pattern based on the theme
 * @param {Array} scale - The musical scale to use
 * @param {string} theme - The theme of music to generate
 * @returns {Array} An array of notes for the melody
 */
function generateMelodyPattern(scale, theme) {
  const pattern = [];
  
  // Different patterns for different themes
  if (theme === 'main') {
    // Calm, mystical pattern for main menu
    pattern.push(scale[0], null, scale[2], null, scale[4], scale[2], scale[1], null);
    pattern.push(scale[2], null, scale[4], null, scale[3], scale[1], scale[0], null);
  } else if (theme === 'game') {
    // More energetic pattern for gameplay
    pattern.push(scale[1], scale[2], scale[4], null, scale[2], scale[4], scale[3], null);
    pattern.push(scale[4], scale[2], scale[1], null, scale[2], scale[1], scale[0], null);
  } else if (theme === 'results') {
    // Triumphant pattern for results screen
    pattern.push(scale[4], null, scale[3], scale[4], scale[2], null, scale[1], scale[0]);
    pattern.push(scale[2], null, scale[1], scale[2], scale[4], null, scale[3], null);
  }
  
  return pattern;
}

/**
 * Generate a bass pattern based on the theme
 * @param {Array} scale - The musical scale to use
 * @param {string} theme - The theme of music to generate
 * @returns {Array} An array of notes for the bass
 */
function generateBassPattern(scale, theme) {
  const pattern = [];
  
  // Different bass patterns for different themes
  if (theme === 'main') {
    // Simple bass for main menu
    pattern.push(scale[0], null, null, null, scale[2], null, null, null);
    pattern.push(scale[4], null, null, null, scale[2], null, scale[0], null);
  } else if (theme === 'game') {
    // More active bass for gameplay
    pattern.push(scale[0], null, scale[0], null, scale[2], null, scale[2], null);
    pattern.push(scale[4], null, scale[4], null, scale[2], null, scale[0], null);
  } else if (theme === 'results') {
    // Celebratory bass for results
    pattern.push(scale[0], null, scale[0], null, scale[2], null, scale[2], null);
    pattern.push(scale[4], null, scale[3], null, scale[2], null, scale[0], null);
  }
  
  return pattern;
}

/**
 * Export music to an audio file (for development purposes)
 * This would require additional libraries in a real implementation
 */
export function exportMusicToFile(audioBuffer, filename) {
  console.log(`Would export ${filename} if this was implemented`);
  // In a real implementation, this would convert the AudioBuffer to a WAV or MP3 file
  // and trigger a download, but that's beyond the scope of this example
}

export default {
  generateBackgroundMusic,
  exportMusicToFile
};
