/**
 * Sound Service for managing game sounds
 * Handles loading, playing, and controlling sound effects
 */
import { generateSoundEffects } from '../utils/SoundGenerator';

class SoundService {
  constructor() {
    this.isMuted = false;
    this.volume = 0.4; // Default volume (0.0 to 1.0)
    this.initialized = false;
    this.audioContext = null;
    this.sounds = {};
    this.isInDiscord = false;
    
    // Try to create audio context right away
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Could not create AudioContext:', error);
    }
    
    console.log('SoundService constructor called');
  }

  /**
   * Initialize the sound service
   * @param {boolean} isInDiscord - Whether the app is running in Discord
   */
  async initialize(isInDiscord = false) {
    if (this.initialized) {
      return Promise.resolve();
    }
    
    this.isInDiscord = isInDiscord;
    
    try {
      // Apply Discord class to body if in Discord
      if (isInDiscord) {
        document.body.classList.add('in-discord');
      }
      
      // Generate sound effects based on environment
      this.sounds = generateSoundEffects(isInDiscord);
      
      // Lower volume in Discord by default
      if (isInDiscord) {
        this.volume = 0.3;
      }
      
      this.initialized = true;
      console.log(`Sound service initialized (Discord: ${isInDiscord})`);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Play a sound by name
   * @param {string} soundName - Name of the sound to play
   */
  play(soundName) {
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
      
      // Create sound on-demand instead of storing references
      const currentTime = this.audioContext.currentTime;
      
      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Set sound parameters based on sound name
      let frequency = 440; // Default A4 note
      let duration = 0.1; // Default duration in seconds
      let type = 'sine'; // Default waveform
      
      // Use predefined sounds if available
      if (this.sounds[soundName]) {
        const soundData = this.sounds[soundName];
        
        if (Array.isArray(soundData)) {
          // For complex sounds (arrays of notes)
          this.playComplexSound(soundData);
          return;
        } else {
          // For simple sounds (single oscillator)
          frequency = soundData.frequency || frequency;
          duration = soundData.duration || duration;
          type = soundData.type || type;
        }
      } else {
        console.warn(`Sound '${soundName}' not found, using default sound`);
      }
      
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
      console.error('Error playing sound:', error);
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
   * Set the volume level
   * @param {number} level - Volume level from 0.0 to 1.0
   */
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
  }

  /**
   * Set muted state
   * @param {boolean} muted - Whether sound should be muted
   */
  setMuted(muted) {
    this.isMuted = muted;
  }

  /**
   * Toggle muted state
   * @returns {boolean} New muted state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

// Create a singleton instance
const soundService = new SoundService();
export default soundService;
