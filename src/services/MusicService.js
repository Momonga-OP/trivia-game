/**
 * Music Service for managing background music
 * Uses pre-recorded audio files instead of procedural generation
 */

class MusicService {
  constructor() {
    this.isMuted = false;
    this.volume = 0.05; // Default volume at 5%
    this.initialized = false;
    this.isInDiscord = false;
    this.currentMusic = null;
    this.currentTheme = 'main';
    this.audioElement = null;
    this.isPlaying = false;
    this.currentTrackPath = null;
    this.musicTracks = {
      main: ['/assets/audio/music/Mystical Krosmoz.mp3', '/assets/audio/music/Mystical Krosmoz Journey.mp3'],
      game: ['/assets/audio/music/Trivia.mp3', '/assets/audio/music/Trivia of the Krosmoz.mp3'],
      results: ['/assets/audio/music/Mystical Krosmoz Journey.mp3']
    };
    this.currentTrackIndex = 0;
    this.lastThemeChangeTime = 0;
    
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
      
      // Add error handling for Discord environment
      this.audioElement.addEventListener('error', (e) => {
        console.warn('Audio playback error:', e);
        // Try to recover by playing a different track
        if (this.isInDiscord && !this.isMuted) {
          setTimeout(() => {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % 
              this.musicTracks[this.currentTheme].length;
            this.playBackgroundMusic(this.currentTheme);
          }, 1000);
        }
      });
      
      // Discord-specific optimizations
      if (isInDiscord) {
        // Add a class to the body for Discord-specific CSS
        document.body.classList.add('discord-audio-enabled');
        
        // Ensure audio is ready to play when user interacts
        document.addEventListener('click', this.handleUserInteraction.bind(this), { once: false });
        document.addEventListener('touchstart', this.handleUserInteraction.bind(this), { once: false });
      }
      
      this.initialized = true;
      console.log(`Music service initialized (Discord: ${isInDiscord})`);
      return true;
    } catch (error) {
      console.error('Failed to initialize music service:', error);
      return false;
    }
  }

  /**
   * Change the music theme without interrupting playback if possible
   * @param {string} theme - Current theme (main, game, or results)
   */
  changeTheme(theme = 'main') {
    if (!this.initialized) {
      return;
    }
    
    // Prevent rapid theme changes (debounce)
    const now = Date.now();
    if (now - this.lastThemeChangeTime < 500) {
      return;
    }
    this.lastThemeChangeTime = now;
    
    // If theme is the same, do nothing
    if (theme === this.currentTheme) {
      return;
    }
    
    this.currentTheme = theme;
    console.log(`Changed music theme to: ${theme}`);
    
    // If music is muted or not playing, just update the theme without starting playback
    if (this.isMuted || !this.isPlaying) {
      return;
    }
    
    // If the current track is in the new theme's track list, continue playing it
    const tracks = this.musicTracks[theme] || this.musicTracks.main;
    if (this.currentTrackPath && tracks.includes(this.currentTrackPath)) {
      console.log(`Current track is compatible with ${theme} theme, continuing playback`);
      return;
    }
    
    // Otherwise, fade out and start a new track from the new theme
    this.fadeOutAndPlay(theme);
  }
  
  /**
   * Fade out current track and play a track from the new theme
   * @param {string} theme - Theme to play
   */
  fadeOutAndPlay(theme) {
    if (!this.audioElement || !this.isPlaying) {
      this.playBackgroundMusic(theme);
      return;
    }
    
    // Save current position as percentage of total duration
    const currentPosition = this.audioElement.currentTime / this.audioElement.duration;
    
    // Fade out current track
    const originalVolume = this.audioElement.volume;
    const fadeInterval = setInterval(() => {
      if (this.audioElement.volume > 0.05) {
        this.audioElement.volume -= 0.05;
      } else {
        clearInterval(fadeInterval);
        this.playBackgroundMusic(theme);
        
        // If the track just started, try to position it at a similar point
        setTimeout(() => {
          if (this.audioElement && this.audioElement.duration && currentPosition > 0.1) {
            // Don't start exactly at the same position, but somewhere close
            const targetPosition = Math.min(0.1 + Math.random() * 0.2, 0.3);
            this.audioElement.currentTime = this.audioElement.duration * targetPosition;
          }
        }, 500);
      }
    }, 50);
  }
  
  /**
   * Play background music based on the current screen
   * @param {string} theme - Current theme (main, game, or results)
   */
  playBackgroundMusic(theme = 'main') {
    if (!this.initialized) {
      return;
    }
    
    // Update current theme
    this.currentTheme = theme;
    
    // If muted, just update the theme without playing
    if (this.isMuted) {
      return;
    }
    
    // Get tracks for the current theme
    const tracks = this.musicTracks[theme] || this.musicTracks.main;
    
    // If no tracks available, return
    if (!tracks || tracks.length === 0) {
      console.warn(`No music tracks available for theme: ${theme}`);
      return;
    }
    
    // If already playing this exact track, don't restart it
    const targetTrack = tracks[this.currentTrackIndex];
    if (this.isPlaying && this.currentTrackPath === targetTrack) {
      console.log(`Already playing ${targetTrack}, continuing playback`);
      return;
    }
    
    // Stop current music if playing
    this.stopBackgroundMusic();
    
    try {
      // Set up the audio element with the current track
      this.audioElement.src = targetTrack;
      this.currentTrackPath = targetTrack;
      this.audioElement.volume = this.volume;
      this.audioElement.loop = false; // We'll handle looping manually to switch between tracks
      
      // Start playing
      const playPromise = this.audioElement.play();
      this.isPlaying = true;
      
      // Handle play promise (may be rejected if user hasn't interacted with the page)
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
        }).catch(error => {
          console.warn('Music autoplay prevented:', error);
          this.isPlaying = false;
          // Store that we attempted to play, so we can try again after user interaction
          this.pendingAutoplay = true;
        });
      }
      
      console.log(`Playing ${theme} background music: ${targetTrack}`);
    } catch (error) {
      console.error('Error playing background music:', error);
      this.isPlaying = false;
    }
  }

  /**
   * Play the next track in the current theme
   */
  playNextTrack() {
    if (!this.initialized) {
      return;
    }
    
    // If muted, just update the track index without playing
    if (this.isMuted) {
      // Increment track index and wrap around if needed
      const tracks = this.musicTracks[this.currentTheme] || this.musicTracks.main;
      if (tracks && tracks.length > 0) {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % tracks.length;
      }
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
    const nextTrack = tracks[this.currentTrackIndex];
    
    try {
      // Set up the audio element with the next track
      this.audioElement.src = nextTrack;
      this.currentTrackPath = nextTrack;
      this.audioElement.volume = this.volume;
      
      // Start playing
      const playPromise = this.audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
        }).catch(error => {
          console.warn('Music autoplay prevented:', error);
          this.isPlaying = false;
        });
      }
      
      console.log(`Playing next track: ${nextTrack}`);
    } catch (error) {
      console.error('Error playing next track:', error);
      this.isPlaying = false;
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
        this.isPlaying = false;
        this.currentTrackPath = null;
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
      } else if (this.isMuted && !this.audioElement.paused) {
        // If muting while music is playing, just set volume to 0 but don't pause
        // This allows us to keep track of what's playing even when muted
        this.isPlaying = true;
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
  
  /**
   * Get current playback status
   * @returns {Object} Current music status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      currentTheme: this.currentTheme,
      currentTrack: this.currentTrackPath
    };
  }
}

// Create a singleton instance
const musicService = new MusicService();

export default musicService;
