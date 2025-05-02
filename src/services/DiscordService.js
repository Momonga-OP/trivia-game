// Discord authentication and API integration service

// Replace these with your actual Discord application credentials
// This is a sample client ID - you'll need to replace it with your own from the Discord Developer Portal
const DISCORD_CLIENT_ID = '1234567890123456789';
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';

class DiscordService {
  constructor() {
    this.currentUser = null;
    this.token = localStorage.getItem('discord_token');
    
    // Check if we have a token in localStorage
    if (this.token) {
      this.fetchUserDetails();
    }
  }
  
  // Generate the OAuth2 URL for Discord login
  getAuthUrl() {
    const scopes = ['identify', 'email'];
    
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
}

// Create a singleton instance
const discordService = new DiscordService();
export default discordService;
