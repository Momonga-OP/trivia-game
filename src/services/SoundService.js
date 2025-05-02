/**
 * Sound Service for managing game sounds
 * Handles loading, playing, and controlling sound effects
 */

// Import sound generator utility
import { generateSoundEffects } from '../utils/SoundGenerator';

class SoundService {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
    this.volume = 0.7; // Default volume (0.0 to 1.0)
    this.initialized = false;
    
    // Debug
    console.log('SoundService constructor called');
  }

  /**
   * Initialize the sound service with all sound effects
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load all sound effects
      await this.loadSounds();
      this.initialized = true;
      console.log('Sound service initialized');
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
    }
  }

  /**
   * Load all sound effects
   */
  async loadSounds() {
    try {
      // Generate sound effects
      const soundEffects = generateSoundEffects();
      
      // Create audio objects for each sound
      for (const [name, src] of Object.entries(soundEffects)) {
        this.sounds[name] = new Audio(src);
        this.sounds[name].volume = this.volume;
      }
      
      // Add additional custom sounds for different button types
      // Primary buttons (like Play Now)
      this.sounds.primaryButton = new Audio(generateSoundEffects().buttonClick);
      this.sounds.primaryButton.volume = this.volume * 1.2; // Slightly louder
      
      // Secondary buttons (like Settings)
      this.sounds.secondaryButton = new Audio(generateSoundEffects().buttonHover);
      this.sounds.secondaryButton.volume = this.volume;
      
      // Close buttons
      this.sounds.closeButton = new Audio(generateSoundEffects().error);
      this.sounds.closeButton.volume = this.volume * 0.8; // Slightly quieter
      
      // Social buttons
      this.sounds.socialButton = new Audio(generateSoundEffects().notification);
      this.sounds.socialButton.volume = this.volume * 0.9;
      
      console.log('Sounds loaded successfully:', Object.keys(this.sounds));
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  /**
   * Play a sound by name
   * @param {string} soundName - Name of the sound to play
   */
  play(soundName) {
    if (this.isMuted) {
      console.log('Sound muted, not playing:', soundName);
      return;
    }
    
    if (!this.initialized) {
      console.log('Sound service not initialized yet, initializing now...');
      this.initialize().then(() => this.play(soundName));
      return;
    }
    
    const sound = this.sounds[soundName];
    if (sound) {
      console.log('Playing sound:', soundName);
      // Create a clone to allow overlapping sounds
      const soundClone = sound.cloneNode();
      soundClone.volume = this.volume;
      soundClone.play().catch(error => {
        // Handle autoplay restrictions
        console.error(`Could not play sound ${soundName}:`, error);
      });
    } else {
      console.warn(`Sound ${soundName} not found`);
    }
  }

  /**
   * Set the volume for all sounds
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all loaded sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  /**
   * Mute or unmute all sounds
   * @param {boolean} muted - Whether sounds should be muted
   */
  setMuted(muted) {
    this.isMuted = muted;
  }

  /**
   * Toggle mute state
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

// Create and export a singleton instance
const soundService = new SoundService();
export default soundService;
