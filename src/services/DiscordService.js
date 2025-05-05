// Discord authentication and API integration service

// Replace with your actual Discord application credentials from the Discord Developer Portal
const DISCORD_CLIENT_ID = '1367687677092167770'; // Updated to match main.jsx
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';

class DiscordService {
  constructor() {
    this.currentUser = null;
    this.token = localStorage.getItem('discord_token');
    this.sdk = null;
    this.isActivity = false;
    this.participants = [];
    this.activityState = 'idle'; // idle, starting, active, ended
    this.voiceChannelId = null;
    this.voiceParticipants = [];
    this.isSpeaking = {};
    
    // Check if we have a token in localStorage
    if (this.token) {
      this.fetchUserDetails();
    }
  }
  
  // Initialize Discord SDK for Activities
  async initializeActivitySDK() {
    try {
      // Check if SDK is available
      if (!window.DiscordSDK) {
        console.warn('Discord SDK not available for Activity initialization');
        return false;
      }
      
      this.sdk = new window.DiscordSDK(DISCORD_CLIENT_ID);
      
      // Wait for SDK to be ready with timeout
      const readyPromise = this.sdk.ready();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Discord SDK ready timeout')), 5000)
      );
      
      await Promise.race([readyPromise, timeoutPromise]);
      
      // Attempt authorization
      try {
        const { code } = await this.sdk.commands.authorize({
          client_id: DISCORD_CLIENT_ID,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify', 'guilds', 'activities.write'],
        });

        await this.sdk.commands.authenticate({ code });
        console.log('✅ Discord SDK authenticated successfully');
        
        // Register activity
        await this.registerActivity();
        
        return true;
      } catch (authErr) {
        console.warn('Discord authentication skipped:', authErr.message);
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Discord Activity SDK:', error);
      return false;
    }
  }
  
  // Register this application as a Discord Activity
  async registerActivity() {
    if (!this.sdk) {
      return false;
    }
    
    try {
      // Register the activity
      await this.sdk.activities.registerActivity({
        name: 'Trivia Game',
        type: 'PLAYING', // PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM
        joinable: true,
        spectatable: true,
        max_participants: 8,
        supported_platforms: ['web'],
      });
      
      this.isActivity = true;
      
      // Set up activity event listeners
      this.setupActivityListeners();
      
      console.log('✅ Activity registered successfully');
      return true;
    } catch (error) {
      console.error('Failed to register activity:', error);
      return false;
    }
  }
  
  // Set up activity event listeners
  setupActivityListeners() {
    if (!this.sdk) return;
    
    // Listen for participant changes
    this.sdk.activities.onParticipantsChange(participants => {
      this.participants = participants;
      console.log('Participants updated:', participants);
      
      // Dispatch an event that components can listen for
      window.dispatchEvent(new CustomEvent('discord:participants-changed', {
        detail: { participants }
      }));
    });
    
    // Listen for activity join requests
    this.sdk.activities.onActivityJoinRequest(request => {
      // Auto-accept join requests
      this.sdk.activities.acceptActivityJoinRequest(request.user.id)
        .then(() => console.log(`Accepted join request from ${request.user.username}`))
        .catch(err => console.error('Failed to accept join request:', err));
    });
    
    // Listen for activity state changes
    this.sdk.activities.onActivityStateChange(state => {
      this.activityState = state;
      console.log('Activity state changed:', state);
      
      window.dispatchEvent(new CustomEvent('discord:activity-state-changed', {
        detail: { state }
      }));
    });
    
    // Listen for voice channel changes
    if (this.sdk.voice) {
      // Get current voice channel
      this.sdk.voice.getVoiceChannel()
        .then(channelId => {
          this.voiceChannelId = channelId;
          console.log('Current voice channel:', channelId);
        })
        .catch(err => console.error('Failed to get voice channel:', err));
      
      // Listen for voice channel participants
      this.sdk.voice.onVoiceChannelParticipantsChange(participants => {
        this.voiceParticipants = participants;
        console.log('Voice participants updated:', participants);
        
        window.dispatchEvent(new CustomEvent('discord:voice-participants-changed', {
          detail: { participants }
        }));
      });
      
      // Listen for speaking state changes
      this.sdk.voice.onSpeakingChange(speakingState => {
        this.isSpeaking = speakingState;
        
        window.dispatchEvent(new CustomEvent('discord:speaking-changed', {
          detail: { speakingState }
        }));
      });
    }
  }
  
  // Get all current participants
  getParticipants() {
    return this.participants;
  }
  
  // Update activity state for all participants
  async updateActivityState(gameState) {
    if (!this.sdk || !this.isActivity) return;
    
    try {
      await this.sdk.activities.updateActivity({
        state: gameState.state || 'Playing Trivia',
        details: gameState.details || 'Answering questions',
        current_participants: this.participants.length,
        max_participants: 8,
        start_time: gameState.startTime || Date.now(),
        party_id: gameState.partyId || 'default-party',
        metadata: gameState.metadata || {},
      });
    } catch (error) {
      console.error('Failed to update activity state:', error);
    }
  }
  
  // Start a new activity session
  async startActivity(gameType) {
    if (!this.sdk || !this.isActivity) return;
    
    try {
      this.activityState = 'starting';
      
      await this.updateActivityState({
        state: 'Starting Game',
        details: `${gameType} Trivia`,
        startTime: Date.now(),
        partyId: `trivia-${Date.now()}`,
        metadata: { gameType }
      });
      
      this.activityState = 'active';
      return true;
    } catch (error) {
      console.error('Failed to start activity:', error);
      return false;
    }
  }
  
  // End the current activity
  async endActivity(results) {
    if (!this.sdk || !this.isActivity) return;
    
    try {
      this.activityState = 'ended';
      
      await this.updateActivityState({
        state: 'Game Ended',
        details: `Final Score: ${results.score || 0}`,
        metadata: { results }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to end activity:', error);
      return false;
    }
  }
  
  // Generate the OAuth2 URL for Discord login
  getAuthUrl() {
    const scopes = ['identify', 'email', 'activities.write'];
    
    return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=token&scope=${scopes.join('%20')}`;
  }
  
  // Handle the login process
  login() {
    window.location.href = this.getAuthUrl();
  }
  
  // Handle the OAuth callback (token in URL fragment)
  handleCallback() {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const token = fragment.get('access_token');
    
    if (token) {
      localStorage.setItem('discord_token', token);
      this.token = token;
      return this.fetchUserDetails();
    }
    
    return Promise.reject('No token found in URL');
  }
  
  // Fetch user details from Discord API
  async fetchUserDetails() {
    if (!this.token) {
      return Promise.reject('Not authenticated');
    }
    
    try {
      const response = await fetch(`${DISCORD_API_ENDPOINT}/users/@me`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const userData = await response.json();
      this.currentUser = {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
        avatarUrl: this.getAvatarUrl(userData.id, userData.avatar)
      };
      
      return this.currentUser;
    } catch (error) {
      console.error('Error fetching user details:', error);
      this.logout();
      return Promise.reject(error);
    }
  }
  
  // Get the user's avatar URL
  getAvatarUrl(userId, avatarHash) {
    if (!avatarHash) {
      // Return default Discord avatar
      return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
    }
    
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
  }
  
  // Check if running as a Discord Activity
  isRunningAsActivity() {
    return this.isActivity;
  }
  
  // Get activity state
  getActivityState() {
    return this.activityState;
  }
  
  // Check if user is logged in
  isLoggedIn() {
    return !!this.token && !!this.currentUser;
  }
  
  // Get current user data
  getCurrentUser() {
    return this.currentUser;
  }
  
  // Logout the user
  logout() {
    localStorage.removeItem('discord_token');
    this.token = null;
    this.currentUser = null;
    window.location.href = '/';
  }
  
  // Get voice channel participants
  getVoiceParticipants() {
    return this.voiceParticipants;
  }
  
  // Check if a user is speaking
  isUserSpeaking(userId) {
    return this.isSpeaking[userId] || false;
  }
  
  // Create an invite link that others can use to join the activity
  async createInviteLink() {
    if (!this.sdk || !this.isActivity) return null;
    
    try {
      const invite = await this.sdk.activities.createInvite({
        type: 'activity',
        max_age: 86400, // 24 hours
        max_uses: 0, // Unlimited uses
        temporary: false
      });
      
      return invite.code;
    } catch (error) {
      console.error('Failed to create invite link:', error);
      return null;
    }
  }
  
  // Share the current game state with other participants
  async shareGameState(gameState) {
    if (!this.sdk || !this.isActivity) return;
    
    try {
      await this.sdk.activities.shareState({
        state: gameState
      });
      
      console.log('Game state shared with participants');
    } catch (error) {
      console.error('Failed to share game state:', error);
    }
  }
  
  // Listen for game state updates from other participants
  onGameStateUpdate(callback) {
    if (!this.sdk || !this.isActivity) return;
    
    this.sdk.activities.onStateChange(state => {
      console.log('Received game state update:', state);
      callback(state);
    });
  }
}

// Create a singleton instance
const discordService = new DiscordService();
export default discordService;
