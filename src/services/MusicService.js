/**
 * Music Service for managing background music
 * Uses pre-recorded audio files instead of procedural generation
 */

class MusicService {
  constructor() {
    this.isMuted = false;
    this.volume = 0.15; // Default volume at 15%
    this.initialized = false;
    this.isInDiscord = false;
    this.currentMusic = null;
    this.currentTheme = 'main';
    this.audioElement = null;
    this.musicTracks = {
      main: ['/assets/audio/music/Mystical Krosmoz.mp3', '/assets/audio/music/Mystical Krosmoz Journey.mp3'],
      game: ['/assets/audio/music/Trivia.mp3', '/assets/audio/music/Trivia of the Krosmoz.mp3'],
      results: ['/assets/audio/music/Mystical Krosmoz Journey.mp3']
    };
    this.currentTrackIndex = 0;
    
    // Load saved preferences
    this.loadPreferences();
    
    console.log('MusicService constructor called');
  }

  /**
   * Load user preferences from localStorage
   */
  loadPreferences() {
    try {
      const savedMusicVolume = localStorage.getItem('musicVolume');
      const savedMusicMuted = localStorage.getItem('musicMuted');
      
      if (savedMusicVolume !== null) {
        this.volume = parseFloat(savedMusicVolume);
      }
      
      if (savedMusicMuted !== null) {
        this.isMuted = savedMusicMuted === 'true';
      }
    } catch (error) {
      console.warn('Error loading music preferences:', error);
    }
  }

  /**
   * Save user preferences to localStorage
   */
  savePreferences() {
    try {
      localStorage.setItem('musicVolume', this.volume.toString());
      localStorage.setItem('musicMuted', this.isMuted.toString());
    } catch (error) {
      console.warn('Error saving music preferences:', error);
    }
  }

  /**
   * Initialize the music service
   * @param {boolean} isInDiscord - Whether the app is running in Discord
   */
  init(isInDiscord = false) {
    if (this.initialized) {
      return true;
    }
    
    this.isInDiscord = isInDiscord;
    
    try {
      // Create audio element for music playback
      this.audioElement = new Audio();
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      
      // Set up event listener for when a track ends
      this.audioElement.addEventListener('ended', () => {
        this.playNextTrack();
      });
      
      this.initialized = true;
      console.log(`Music service initialized (Discord: ${isInDiscord})`);
      return true;
    } catch (error) {
      console.error('Failed to initialize music service:', error);
      return false;
    }
  }

  /**
   * Play background music based on the current screen
   * @param {string} theme - Current theme (main, game, or results)
   */
  playBackgroundMusic(theme = 'main') {
    if (!this.initialized || this.isMuted) {
      return;
    }
    
    // If theme changed, reset track index
    if (theme !== this.currentTheme) {
      this.currentTrackIndex = 0;
      this.currentTheme = theme;
    }
    
    // Get tracks for the current theme
    const tracks = this.musicTracks[theme] || this.musicTracks.main;
    
    // If no tracks available, return
    if (!tracks || tracks.length === 0) {
      console.warn(`No music tracks available for theme: ${theme}`);
      return;
    }
    
    // Stop current music if playing
    this.stopBackgroundMusic();
    
    try {
      // Set up the audio element with the current track
      this.audioElement.src = tracks[this.currentTrackIndex];
      this.audioElement.volume = this.volume;
      this.audioElement.loop = false; // We'll handle looping manually to switch between tracks
      
      // Start playing
      const playPromise = this.audioElement.play();
      
      // Handle play promise (may be rejected if user hasn't interacted with the page)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Music autoplay prevented:', error);
          // Store that we attempted to play, so we can try again after user interaction
          this.pendingAutoplay = true;
        });
      }
      
      console.log(`Playing ${theme} background music: ${tracks[this.currentTrackIndex]}`);
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  /**
   * Play the next track in the current theme
   */
  playNextTrack() {
    if (!this.initialized || this.isMuted) {
      return;
    }
    
    // Get tracks for the current theme
    const tracks = this.musicTracks[this.currentTheme] || this.musicTracks.main;
    
    // If no tracks available, return
    if (!tracks || tracks.length === 0) {
      return;
    }
    
    // Increment track index and wrap around if needed
    this.currentTrackIndex = (this.currentTrackIndex + 1) % tracks.length;
    
    try {
      // Set up the audio element with the next track
      this.audioElement.src = tracks[this.currentTrackIndex];
      this.audioElement.volume = this.volume;
      
      // Start playing
      this.audioElement.play().catch(error => {
        console.warn('Music autoplay prevented:', error);
      });
      
      console.log(`Playing next track: ${tracks[this.currentTrackIndex]}`);
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (error) {
        console.error('Error stopping background music:', error);
      }
    }
  }

  /**
   * Set the volume level for background music
   * @param {number} level - Volume level from 0.0 to 1.0
   */
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    
    this.savePreferences();
  }

  /**
   * Set muted state for background music
   * @param {boolean} muted - Whether background music should be muted
   */
  setMuted(muted) {
    this.isMuted = muted;
    
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      
      // If unmuting and no music is playing, start playing
      if (!this.isMuted && this.audioElement.paused && this.initialized) {
        this.playBackgroundMusic(this.currentTheme);
      }
    }
    
    this.savePreferences();
  }

  /**
   * Toggle muted state for background music
   * @returns {boolean} New muted state
   */
  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Handle user interaction to enable autoplay if needed
   */
  handleUserInteraction() {
    if (this.pendingAutoplay && this.initialized && !this.isMuted) {
      this.playBackgroundMusic(this.currentTheme);
      this.pendingAutoplay = false;
    }
  }
}

// Create a singleton instance
const musicService = new MusicService();

export default musicService;
