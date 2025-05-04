/**
 * Sound Service for managing game sounds
 * Handles loading, playing, and controlling sound effects
 */

class SoundService {
  constructor() {
    this.isMuted = false;
    this.volume = 0.4; // Default volume (0.0 to 1.0)
    this.initialized = true; // Set to true immediately
    this.audioContext = null;
    this.isDiscordEnvironment = this.checkIfDiscordEnvironment();
    
    // Try to create audio context right away with fallbacks for Discord
    try {
      // Only create AudioContext if not in Discord or if Discord allows it
      if (!this.isDiscordEnvironment || (window.discord && window.discord.audio)) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
    } catch (error) {
      console.warn('Could not create AudioContext:', error);
    }
    
    console.log('SoundService constructor called');
  }
  
  /**
   * Check if we're running in a Discord environment
   * @returns {boolean} Whether we're in Discord
   */
  checkIfDiscordEnvironment() {
    return (
      window.discord || 
      window.__DISCORD__ || 
      window.location.hostname.includes('discord.com')
    );
  }

  /**
   * Initialize the sound service - now just a stub for compatibility
   */
  async initialize() {
    return Promise.resolve();
  }

  /**
   * Play a sound by name
   * @param {string} soundName - Name of the sound to play
   */
  play(soundName) {
    // If muted or we're in Discord without audio context, just return
    if (this.isMuted || (this.isDiscordEnvironment && !this.audioContext)) {
      return;
    }
    
    try {
      // If we're in Discord and have the Discord audio API, use it
      if (this.isDiscordEnvironment && window.discord && window.discord.audio) {
        this.playDiscordSound(soundName);
        return;
      }
      
      // Otherwise use Web Audio API if available
      if (!this.audioContext) {
        // Try to create audio context on-demand if it wasn't created earlier
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          // If we can't create it, just silently return
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
      
      // Configure sound based on name
      switch(soundName) {
        case 'buttonClick':
          frequency = 800;
          duration = 0.05;
          break;
        case 'buttonHover':
          frequency = 1200;
          duration = 0.03;
          break;
        case 'primaryButton':
          frequency = 880;
          duration = 0.06;
          break;
        case 'secondaryButton':
          frequency = 660;
          duration = 0.05;
          break;
        case 'success':
          frequency = 1046.5;
          duration = 0.1;
          break;
        case 'error':
          frequency = 400;
          duration = 0.1;
          type = 'square';
          break;
        case 'notification':
          frequency = 900;
          duration = 0.08;
          break;
        case 'cardFlip':
          frequency = 600;
          duration = 0.07;
          break;
        case 'gameStart':
          frequency = 523.25;
          duration = 0.15;
          break;
        case 'gameEnd':
          frequency = 493.88;
          duration = 0.15;
          break;
        case 'closeButton':
          frequency = 330;
          duration = 0.07;
          type = 'triangle';
          break;
        case 'socialButton':
          frequency = 700;
          duration = 0.07;
          break;
      }
      
      // Configure oscillator
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      // Configure gain (volume)
      const volume = this.volume * 0.3; // Keep volume low
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.005);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play sound
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
      
    } catch (error) {
      // Silently fail - don't log errors to avoid console spam
    }
  }

  /**
   * Set the volume for all sounds
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    // Volume is applied when sounds are played
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('soundVolume', this.volume.toString());
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Mute or unmute all sounds
   * @param {boolean} muted - Whether sounds should be muted
   */
  setMuted(muted) {
    this.isMuted = muted;
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('soundMuted', this.isMuted.toString());
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Toggle mute state
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('soundMuted', this.isMuted.toString());
    } catch (e) {
      // Ignore storage errors
    }
    
    return this.isMuted;
  }
  
  /**
   * Play a sound using Discord's audio API
   * @param {string} soundName - Name of the sound to play
   */
  playDiscordSound(soundName) {
    // Only proceed if Discord audio API is available
    if (!window.discord || !window.discord.audio) {
      return;
    }
    
    try {
      // Map our sound names to Discord's built-in sounds
      let discordSound = 'click'; // Default sound
      
      switch(soundName) {
        case 'buttonClick':
        case 'primaryButton':
        case 'secondaryButton':
          discordSound = 'click';
          break;
        case 'buttonHover':
          discordSound = 'hover';
          break;
        case 'success':
          discordSound = 'success';
          break;
        case 'error':
          discordSound = 'error';
          break;
        case 'notification':
          discordSound = 'notification';
          break;
        case 'gameStart':
        case 'gameEnd':
          discordSound = 'success';
          break;
        case 'closeButton':
          discordSound = 'click';
          break;
        case 'socialButton':
          discordSound = 'click';
          break;
      }
      
      // Play the sound with adjusted volume
      window.discord.audio.play(discordSound, { volume: this.volume });
    } catch (error) {
      // Silently fail
    }
  }
}

// Create and export a singleton instance
const soundService = new SoundService();
export default soundService;
