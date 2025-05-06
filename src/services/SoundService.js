/**
 * Sound Service for managing game sounds
 * Handles loading, playing, and controlling sound effects
 */
import { generateSoundEffects } from '../utils/SoundGenerator';

class SoundService {
  constructor() {
    this.isMuted = false;
    this.volume = 0.3; // Default volume at 30%
    this.initialized = false;
    this.audioContext = null;
    this.sounds = {};
    this.isInDiscord = false;
    this.preloadedSounds = new Map(); // Store preloaded sounds
    
    // Try to create audio context right away
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Could not create AudioContext:', error);
    }
    
    // Load saved preferences
    this.loadPreferences();
    
    console.log('SoundService constructor called');
  }

  /**
   * Load user preferences from localStorage
   */
  loadPreferences() {
    try {
      const savedVolume = localStorage.getItem('soundVolume');
      const savedMuted = localStorage.getItem('soundMuted');
      
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }
      
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
    } catch (error) {
      console.warn('Error loading sound preferences:', error);
    }
  }

  /**
   * Save user preferences to localStorage
   */
  savePreferences() {
    try {
      localStorage.setItem('soundVolume', this.volume.toString());
      localStorage.setItem('soundMuted', this.isMuted.toString());
    } catch (error) {
      console.warn('Error saving sound preferences:', error);
    }
  }

  /**
   * Initialize the sound service
   * @param {boolean} isInDiscord - Whether the app is running in Discord
   */
  init(isInDiscord = false) {
    if (this.initialized) {
      return true;
    }
    
    this.isInDiscord = isInDiscord;
    
    try {
      // Apply Discord class to body if in Discord
      if (isInDiscord) {
        document.body.classList.add('in-discord');
      }
      
      // Generate sound effects based on environment
      this.sounds = generateSoundEffects(isInDiscord);
      
      // Preload common sounds
      this.preloadCommonSounds();
      
      this.initialized = true;
      console.log(`Sound service initialized (Discord: ${isInDiscord})`);
      return true;
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
      return false;
    }
  }

  /**
   * Preload commonly used sounds
   */
  async preloadCommonSounds() {
    const commonSounds = [
      'buttonClick', 
      'optionSelect', 
      'correctAnswer', 
      'wrongAnswer', 
      'nextQuestion'
    ];
    
    return Promise.all(commonSounds.map(sound => this.preload(sound)));
  }

  /**
   * Preload a sound for faster playback
   * @param {string} soundName - Name of the sound to preload
   * @returns {Promise} A promise that resolves when the sound is preloaded
   */
  async preload(soundName) {
    if (!this.audioContext || !this.sounds[soundName]) {
      return Promise.reject(new Error(`Cannot preload sound '${soundName}'`));
    }

    // If already preloaded, return the existing promise
    if (this.preloadedSounds.has(soundName)) {
      return this.preloadedSounds.get(soundName);
    }

    try {
      const soundData = this.sounds[soundName];
      
      // For complex sounds (arrays of notes), we'll precompute the oscillator parameters
      if (Array.isArray(soundData)) {
        // Store the precomputed parameters
        const preloadPromise = Promise.resolve({
          type: 'complex',
          notes: soundData
        });
        this.preloadedSounds.set(soundName, preloadPromise);
        return preloadPromise;
      } 
      // For simple sounds, we'll just store the parameters
      else {
        const preloadPromise = Promise.resolve({
          type: 'simple',
          frequency: soundData.frequency || 440,
          duration: soundData.duration || 0.1,
          waveType: soundData.type || 'sine'
        });
        this.preloadedSounds.set(soundName, preloadPromise);
        return preloadPromise;
      }
    } catch (error) {
      console.error(`Error preloading sound '${soundName}':`, error);
      return Promise.reject(error);
    }
  }

  /**
   * Play a sound by name
   * @param {string} soundName - Name of the sound to play
   */
  async play(soundName) {
    if (this.isMuted || !this.audioContext) {
      return;
    }
    
    try {
      // Skip some sounds in Discord for better performance
      if (this.isInDiscord) {
        // Skip less important sounds in Discord
        if (['buttonHover', 'socialButton'].includes(soundName)) {
          return;
        }
      }
      
      // Check if the sound is preloaded
      if (this.preloadedSounds.has(soundName)) {
        const preloadedSound = await this.preloadedSounds.get(soundName);
        
        if (preloadedSound.type === 'complex') {
          this.playComplexSound(preloadedSound.notes);
          return;
        } else {
          // Play the preloaded simple sound
          this.playSimpleSound(
            preloadedSound.frequency,
            preloadedSound.duration,
            preloadedSound.waveType
          );
          return;
        }
      }
      
      // If not preloaded, play directly
      const soundData = this.sounds[soundName];
      
      if (soundData) {
        // For complex sounds (arrays of notes)
        if (Array.isArray(soundData)) {
          this.playComplexSound(soundData);
          return;
        } else {
          // For simple sounds (single oscillator)
          this.playSimpleSound(
            soundData.frequency || 440,
            soundData.duration || 0.1,
            soundData.type || 'sine'
          );
          return;
        }
      } else {
        console.warn(`Sound '${soundName}' not found, using default sound`);
        this.playSimpleSound(440, 0.1, 'sine');
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }
  
  /**
   * Play a simple sound with a single oscillator
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {string} type - Oscillator type (sine, square, etc.)
   */
  playSimpleSound(frequency, duration, type) {
    if (this.isMuted || !this.audioContext) {
      return;
    }
    
    try {
      const currentTime = this.audioContext.currentTime;
      
      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Configure oscillator
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      // Configure gain (volume)
      gainNode.gain.value = this.volume;
      gainNode.gain.setValueAtTime(this.volume, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play sound
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
    } catch (error) {
      console.error('Error playing simple sound:', error);
    }
  }
  
  /**
   * Play a complex sound (multiple notes)
   * @param {Array} notes - Array of note objects with frequency, duration, and type
   */
  playComplexSound(notes) {
    if (this.isMuted || !this.audioContext || !notes || !notes.length) {
      return;
    }
    
    try {
      const currentTime = this.audioContext.currentTime;
      let noteStartTime = currentTime;
      
      // Play each note in sequence
      notes.forEach(note => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Configure oscillator
        oscillator.type = note.type || 'sine';
        oscillator.frequency.value = note.frequency || 440;
        
        // Configure gain with attack and release
        const noteDuration = note.duration || 0.1;
        const attackTime = Math.min(0.01, noteDuration * 0.1);
        const releaseTime = Math.min(0.05, noteDuration * 0.5);
        
        gainNode.gain.setValueAtTime(0.001, noteStartTime);
        gainNode.gain.exponentialRampToValueAtTime(this.volume, noteStartTime + attackTime);
        gainNode.gain.setValueAtTime(this.volume, noteStartTime + noteDuration - releaseTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, noteStartTime + noteDuration);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Play note
        oscillator.start(noteStartTime);
        oscillator.stop(noteStartTime + noteDuration);
        
        // Update start time for next note
        noteStartTime += noteDuration;
      });
    } catch (error) {
      console.error('Error playing complex sound:', error);
    }
  }

  /**
   * Set the volume level for sound effects
   * @param {number} level - Volume level from 0.0 to 1.0
   */
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    this.savePreferences();
  }

  /**
   * Set muted state for sound effects
   * @param {boolean} muted - Whether sound effects should be muted
   */
  setMuted(muted) {
    this.isMuted = muted;
    this.savePreferences();
  }

  /**
   * Toggle muted state for sound effects
   * @returns {boolean} New muted state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.savePreferences();
    return this.isMuted;
  }
}

// Create a singleton instance
const soundService = new SoundService();

export default soundService;
