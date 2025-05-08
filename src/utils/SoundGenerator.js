/**
 * Sound Generator Utility
 * Creates programmatically generated sound effects
 */

// Generate and export sound files as data URLs
export const generateSoundEffects = (isInDiscord) => {
  // Check if running in Discord if not explicitly provided
  if (isInDiscord === undefined) {
    isInDiscord = typeof window !== 'undefined' && (
      window.location.href.includes('discord') || 
      navigator.userAgent.includes('Discord') ||
      window.innerWidth <= 600
    );
  }
  
  // Use simpler sounds in Discord
  return {
    // Basic UI sounds
    buttonClick: generateButtonClickSound(isInDiscord),
    buttonHover: generateButtonHoverSound(isInDiscord),
    primaryButton: generatePrimaryButtonSound(isInDiscord),
    secondaryButton: generateSecondaryButtonSound(isInDiscord),
    closeButton: generateCloseButtonSound(isInDiscord),
    socialButton: generateSocialButtonSound(isInDiscord),
    
    // Game-specific sounds
    success: generateSuccessSound(isInDiscord),
    error: generateErrorSound(isInDiscord),
    notification: generateNotificationSound(isInDiscord),
    cardFlip: generateCardFlipSound(isInDiscord),
    gameStart: generateGameStartSound(isInDiscord),
    gameEnd: generateGameEndSound(isInDiscord),
    
    // Trivia-specific sounds
    optionSelect: generateOptionSelectSound(isInDiscord),   // When selecting an option
    correctAnswer: generateCorrectAnswerSound(isInDiscord), // When answer is correct
    wrongAnswer: generateWrongAnswerSound(isInDiscord),     // When answer is wrong
    nextQuestion: generateNextQuestionSound(isInDiscord),   // When clicking Next Question
    
    // Book-specific sounds
    pageFlip: generatePageFlipSound(isInDiscord),           // When turning a page in the book
    bookOpen: generateBookOpenSound(isInDiscord),           // When opening the book
    bookClose: generateBookCloseSound(isInDiscord),         // When closing the book
    pageRustle: generatePageRustleSound(isInDiscord)        // When hovering over a page
  };
};

// Generate a standard button click sound (short, crisp click)
const generateButtonClickSound = (isInDiscord = false) => {
  return generateTone({
    frequency: 800,
    type: 'sine',
    duration: isInDiscord ? 0.08 : 0.1,
    attack: 0.001,
    decay: isInDiscord ? 0.08 : 0.1,
    volume: isInDiscord ? 0.2 : 0.3
  });
};

// Generate a button hover sound (softer, higher pitched)
const generateButtonHoverSound = (isInDiscord = false) => {
  return generateTone({
    frequency: 1200,
    type: 'sine',
    duration: isInDiscord ? 0.05 : 0.08,
    attack: 0.001,
    decay: isInDiscord ? 0.05 : 0.08,
    volume: isInDiscord ? 0.1 : 0.15
  });
};

// Generate a success sound (ascending notes)
const generateSuccessSound = (isInDiscord = false) => {
  return generateSequence([
    { frequency: 523.25, duration: 0.1, type: 'sine' },
    { frequency: 659.25, duration: 0.1, type: 'sine' },
    { frequency: 783.99, duration: 0.2, type: 'sine' }
  ], 0.05, isInDiscord ? 0.2 : 0.3);
};

// Generate an error sound (descending notes)
const generateErrorSound = (isInDiscord = false) => {
  return generateSequence([
    { frequency: 400, duration: 0.1, type: 'square' },
    { frequency: 350, duration: 0.2, type: 'square' }
  ], 0.05, 0.2);
};

// Generate a notification sound (bell-like)
const generateNotificationSound = () => {
  return generateTone({
    frequency: 1046.5,
    type: 'sine',
    duration: 0.3,
    attack: 0.001,
    decay: 0.3,
    volume: 0.25
  });
};

// Generate a card flip sound (soft, pleasant tone)
const generateCardFlipSound = (isInDiscord = false) => {
  return generateSequence([
    { frequency: 440, duration: isInDiscord ? 0.03 : 0.05, type: 'sine' },
    { frequency: 587.33, duration: isInDiscord ? 0.06 : 0.1, type: 'sine' }
  ], 0.01, isInDiscord ? 0.1 : 0.15);
};

// Generate a game start sound (fanfare)
const generateGameStartSound = () => {
  return generateSequence([
    { frequency: 523.25, duration: 0.1, type: 'sine' },
    { frequency: 659.25, duration: 0.1, type: 'sine' },
    { frequency: 783.99, duration: 0.1, type: 'sine' },
    { frequency: 1046.5, duration: 0.3, type: 'sine' }
  ], 0.05, 0.3);
};

// Generate a game end sound (descending fanfare)
const generateGameEndSound = () => {
  return generateSequence([
    { frequency: 783.99, duration: 0.1, type: 'sine' },
    { frequency: 659.25, duration: 0.1, type: 'sine' },
    { frequency: 523.25, duration: 0.1, type: 'sine' },
    { frequency: 440.00, duration: 0.3, type: 'sine' }
  ], 0.05, 0.3);
};

// Generate a tone with the specified parameters
const generateTone = ({ frequency, type, duration, attack, decay, volume }) => {
  try {
    const sampleRate = 44100;
    const numSamples = Math.floor(duration * sampleRate);
    const attackSamples = Math.floor(attack * sampleRate);
    const decaySamples = Math.floor(decay * sampleRate);
    
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
  
  // Generate waveform
  for (let i = 0; i < numSamples; i++) {
    // Calculate amplitude based on attack/decay envelope
    let amplitude = volume;
    if (i < attackSamples) {
      amplitude = (i / attackSamples) * volume;
    } else if (i > numSamples - decaySamples) {
      amplitude = ((numSamples - i) / decaySamples) * volume;
    }
    
    // Generate waveform based on type
    const t = i / sampleRate;
    switch (type) {
      case 'sine':
        data[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude;
        break;
      case 'square':
        data[i] = (Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1) * amplitude;
        break;
      case 'sawtooth':
        data[i] = ((t * frequency) % 1) * 2 - 1 * amplitude;
        break;
      case 'triangle':
        data[i] = Math.abs(((t * frequency) % 1) * 2 - 1) * 2 - 1 * amplitude;
        break;
      default:
        data[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    }
  }
  
    // Convert to WAV format and return as data URL
    return bufferToWav(buffer);
  } catch (error) {
    console.error('Error generating tone:', error);
    // Return a silent sound in case of error
    return 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  }
};

// Generate a sequence of tones
const generateSequence = (notes, gap, volume) => {
  try {
    const sampleRate = 44100;
    let totalDuration = notes.reduce((acc, note) => acc + note.duration + gap, 0) - gap;
    const numSamples = Math.floor(totalDuration * sampleRate);
    
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    let currentSample = 0;
    
    // Generate each note in sequence
    for (const note of notes) {
      const noteSamples = Math.floor(note.duration * sampleRate);
      
      // Generate waveform for this note
      for (let i = 0; i < noteSamples; i++) {
        const t = i / sampleRate;
        let sample = 0;
        
        switch (note.type) {
          case 'sine':
            sample = Math.sin(2 * Math.PI * note.frequency * t);
            break;
          case 'square':
            sample = Math.sin(2 * Math.PI * note.frequency * t) > 0 ? 1 : -1;
            break;
          case 'sawtooth':
            sample = ((t * note.frequency) % 1) * 2 - 1;
            break;
          case 'triangle':
            sample = Math.abs(((t * note.frequency) % 1) * 2 - 1) * 2 - 1;
            break;
          default:
            sample = Math.sin(2 * Math.PI * note.frequency * t);
        }
        
        // Apply envelope
        let amplitude = volume;
        const attack = Math.floor(0.01 * sampleRate);
        const decay = Math.floor(0.05 * sampleRate);
        
        if (i < attack) {
          amplitude = (i / attack) * volume;
        } else if (i > noteSamples - decay) {
          amplitude = ((noteSamples - i) / decay) * volume;
        }
        
        if (currentSample + i < numSamples) {
          data[currentSample + i] = sample * amplitude;
        }
      }
      
      currentSample += noteSamples + Math.floor(gap * sampleRate);
    }
    
    // Convert to WAV format and return as data URL
    return bufferToWav(buffer);
  } catch (error) {
    console.error('Error generating sequence:', error);
    // Return a silent sound in case of error
    return 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  }
};

// Generate noise with the specified parameters
const generateNoise = ({ duration, attack, decay, filter, volume }) => {
  try {
    const sampleRate = 44100;
    const numSamples = Math.floor(duration * sampleRate);
    const attackSamples = Math.floor(attack * sampleRate);
    const decaySamples = Math.floor(decay * sampleRate);
    
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Simple low-pass filter
    let lastOut = 0;
    const filterCoeff = Math.exp(-2 * Math.PI * filter / sampleRate);
    
    // Generate noise
    for (let i = 0; i < numSamples; i++) {
      // Calculate amplitude based on attack/decay envelope
      let amplitude = volume;
      if (i < attackSamples) {
        amplitude = (i / attackSamples) * volume;
      } else if (i > numSamples - decaySamples) {
        amplitude = ((numSamples - i) / decaySamples) * volume;
      }
      
      // Generate white noise and apply filter
      const noise = Math.random() * 2 - 1;
      lastOut = noise * (1 - filterCoeff) + lastOut * filterCoeff;
      data[i] = lastOut * amplitude;
    }
    
    // Convert to WAV format and return as data URL
    return bufferToWav(buffer);
  } catch (error) {
    console.error('Error generating noise:', error);
    // Return a silent sound in case of error
    return 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  }
};

// Convert an audio buffer to WAV format
const bufferToWav = (buffer) => {
  try {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const numSamples = buffer.length;
    const bytesPerSample = 2; // 16-bit
    
    // Create the WAV file header
    const headerBytes = 44;
    const dataBytes = numChannels * numSamples * bytesPerSample;
    const fileSize = headerBytes + dataBytes;
    
    const arrayBuffer = new ArrayBuffer(fileSize);
    const dataView = new DataView(arrayBuffer);
    
    // RIFF chunk descriptor
    writeString(dataView, 0, 'RIFF');
    dataView.setUint32(4, fileSize - 8, true);
    writeString(dataView, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(dataView, 12, 'fmt ');
    dataView.setUint32(16, 16, true); // fmt chunk size
    dataView.setUint16(20, 1, true); // audio format (PCM)
    dataView.setUint16(22, numChannels, true);
    dataView.setUint32(24, sampleRate, true);
    dataView.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // byte rate
    dataView.setUint16(32, numChannels * bytesPerSample, true); // block align
    dataView.setUint16(34, 8 * bytesPerSample, true); // bits per sample
    
    // data sub-chunk
    writeString(dataView, 36, 'data');
    dataView.setUint32(40, dataBytes, true);
    
    // Write the audio data
    let offset = 44;
    for (let i = 0; i < numChannels; i++) {
      const channelData = buffer.getChannelData(i);
      for (let j = 0; j < numSamples; j++) {
        const sample = Math.max(-1, Math.min(1, channelData[j]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        dataView.setInt16(offset, value, true);
        offset += bytesPerSample;
      }
    }
    
    // Convert to base64 data URL
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating WAV file:', error);
    // Return a silent sound in case of error
    return 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  }
};

// Helper to write a string to a DataView
const writeString = (dataView, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    dataView.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Generate a primary button sound (distinctive click)
const generatePrimaryButtonSound = (isInDiscord = false) => {
  return generateSequence([
    { frequency: 880, duration: isInDiscord ? 0.03 : 0.05, type: 'sine' },
    { frequency: 1320, duration: isInDiscord ? 0.04 : 0.07, type: 'sine' }
  ], 0.01, isInDiscord ? 0.15 : 0.2);
};

// Generate a secondary button sound (softer click)
const generateSecondaryButtonSound = (isInDiscord = false) => {
  return generateTone({
    frequency: 660,
    type: 'sine',
    duration: isInDiscord ? 0.06 : 0.08,
    attack: 0.001,
    decay: isInDiscord ? 0.05 : 0.07,
    volume: isInDiscord ? 0.12 : 0.18
  });
};

// Generate a close button sound (short, lower pitched)
const generateCloseButtonSound = (isInDiscord = false) => {
  return generateTone({
    frequency: 330,
    type: 'triangle',
    duration: isInDiscord ? 0.05 : 0.07,
    attack: 0.001,
    decay: isInDiscord ? 0.04 : 0.06,
    volume: isInDiscord ? 0.12 : 0.15
  });
};

// Generate a social button sound (distinctive, friendly)
const generateSocialButtonSound = (isInDiscord = false) => {
  return generateSequence([
    { frequency: 523.25, duration: isInDiscord ? 0.03 : 0.05, type: 'sine' },
    { frequency: 659.25, duration: isInDiscord ? 0.04 : 0.06, type: 'sine' }
  ], 0.01, isInDiscord ? 0.12 : 0.18);
};

// Generate sound for selecting an option in the trivia game
const generateOptionSelectSound = (isInDiscord = false) => {
  return generateSequence([
    { frequency: 440, duration: isInDiscord ? 0.03 : 0.05, type: 'sine' },
    { frequency: 523.25, duration: isInDiscord ? 0.04 : 0.06, type: 'sine' }
  ], 0.01, isInDiscord ? 0.15 : 0.25);
};

// Generate sound for correct answer
const generateCorrectAnswerSound = (isInDiscord = false) => {
  // More elaborate sound for correct answers
  return generateSequence([
    { frequency: 523.25, duration: isInDiscord ? 0.06 : 0.1, type: 'sine' },
    { frequency: 659.25, duration: isInDiscord ? 0.06 : 0.1, type: 'sine' },
    { frequency: 783.99, duration: isInDiscord ? 0.08 : 0.15, type: 'sine' }
  ], 0.01, isInDiscord ? 0.2 : 0.3);
};

// Generate sound for wrong answer
const generateWrongAnswerSound = (isInDiscord = false) => {
  // Distinctive sound for wrong answers
  return generateSequence([
    { frequency: 392.00, duration: isInDiscord ? 0.06 : 0.1, type: 'square' },
    { frequency: 349.23, duration: isInDiscord ? 0.08 : 0.12, type: 'square' }
  ], 0.01, isInDiscord ? 0.15 : 0.2);
};

// Generate sound for clicking the Next Question button
const generateNextQuestionSound = (isInDiscord = false) => {
  return generateSequence([
    { frequency: 587.33, duration: isInDiscord ? 0.04 : 0.06, type: 'sine' },
    { frequency: 659.25, duration: isInDiscord ? 0.04 : 0.06, type: 'sine' },
    { frequency: 783.99, duration: isInDiscord ? 0.05 : 0.08, type: 'sine' }
  ], 0.01, isInDiscord ? 0.12 : 0.18);
};

// Generate a page flip sound for the storybook
const generatePageFlipSound = (isInDiscord = false) => {
  // Create a sequence of sounds that mimic a page turning
  return generateSequence([
    { frequency: 800, duration: 0.03, type: 'triangle' },
    { frequency: 600, duration: 0.06, type: 'triangle' }
  ], 0.02, isInDiscord ? 0.15 : 0.2);
};

// Generate a book opening sound
const generateBookOpenSound = (isInDiscord = false) => {
  // Create a sequence that mimics the sound of a book cover opening
  return generateSequence([
    { frequency: 300, duration: 0.05, type: 'triangle' },
    { frequency: 200, duration: 0.1, type: 'triangle' },
    { frequency: 400, duration: 0.15, type: 'sine' }
  ], 0.03, isInDiscord ? 0.15 : 0.25);
};

// Generate a book closing sound
const generateBookCloseSound = (isInDiscord = false) => {
  // Create a sequence that mimics the sound of a book cover closing
  return generateSequence([
    { frequency: 400, duration: 0.05, type: 'triangle' },
    { frequency: 300, duration: 0.1, type: 'triangle' },
    { frequency: 200, duration: 0.15, type: 'sine' }
  ], 0.02, isInDiscord ? 0.15 : 0.25);
};

// Generate a page rustle sound for hovering over pages
const generatePageRustleSound = (isInDiscord = false) => {
  // Create a soft noise-based sound for page rustling
  const duration = isInDiscord ? 0.1 : 0.15;
  const volume = isInDiscord ? 0.05 : 0.1;
  
  return generateNoise({
    duration: duration,
    attack: 0.02,
    decay: duration - 0.02,
    filter: 3000, // High-pass filter to make it sound like paper
    volume: volume
  });
};

/**
 * Play a sequence of notes with specified parameters
 * @param {Array} notes - Array of note objects with frequency, duration, and type
 * @param {number} delay - Delay between notes in seconds
 * @param {number} volume - Volume level (0.0 to 1.0)
 * @returns {Function} Function that plays the sequence when called
 */
const playSequence = (notes, delay = 0.01, volume = 0.3) => {
  return () => {
    // Return a function that will be called when the sound is played
    if (typeof window === 'undefined' || !window.AudioContext) {
      return; // No audio context available
    }
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      let startTime = audioContext.currentTime;
      
      notes.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configure oscillator
        oscillator.type = note.type || 'sine';
        oscillator.frequency.value = note.frequency;
        
        // Configure gain with attack and release
        const duration = note.duration || 0.1;
        const attackTime = Math.min(0.01, duration * 0.1);
        const releaseTime = Math.min(0.05, duration * 0.5);
        
        gainNode.gain.setValueAtTime(0.001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(volume, startTime + attackTime);
        gainNode.gain.setValueAtTime(volume, startTime + duration - releaseTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play note
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        // Update start time for next note
        startTime += duration + delay;
      });
    } catch (error) {
      console.error('Error playing sound sequence:', error);
    }
  };
};
