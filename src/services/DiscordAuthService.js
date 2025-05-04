/**
 * Discord Authentication Service
 * Handles Discord account linking and authentication for the Dofus Lore Trivia game
 */

class DiscordAuthService {
  constructor() {
    this.clientId = '1367687677092167770'; // Your Discord application ID
    this.redirectUri = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://127.0.0.1/callback'
      : `${window.location.origin}/callback`;
    this.scopes = ['identify', 'guilds', 'email'];
    this.isDiscordEnvironment = this.checkIfDiscordEnvironment();
    this.discordSdk = null;
    this.userProfile = null;
    this.initialized = false;
    this.authState = 'idle'; // idle, loading, authenticated, error
    this.authError = null;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.linkAccount = this.linkAccount.bind(this);
    this.handleCallback = this.handleCallback.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.logout = this.logout.bind(this);
    this.getProfile = this.getProfile.bind(this);
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
   * Initialize the Discord SDK
   * @returns {Promise} Promise that resolves when SDK is initialized
   */
  async initialize() {
    // If we're already initialized, just return
    if (this.initialized) {
      return Promise.resolve();
    }

    try {
      // If we're in a Discord environment and the Discord SDK is available
      if (this.isDiscordEnvironment && window.DiscordSDK) {
        console.log('Initializing Discord SDK...');
        this.discordSdk = new window.DiscordSDK(this.clientId);
        
        // Wait for SDK to be ready with timeout
        const readyPromise = this.discordSdk.ready();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Discord SDK ready timeout')), 5000)
        );
        
        await Promise.race([readyPromise, timeoutPromise]);
        console.log('Discord SDK initialized successfully');
        
        // Check if we have a stored token
        const token = localStorage.getItem('discord_access_token');
        if (token) {
          // Try to authenticate with the stored token
          try {
            await this.validateToken(token);
            this.authState = 'authenticated';
          } catch (err) {
            // Token is invalid, try to refresh
            const refreshToken = localStorage.getItem('discord_refresh_token');
            if (refreshToken) {
              try {
                await this.refreshToken(refreshToken);
                this.authState = 'authenticated';
              } catch (refreshErr) {
                // Refresh failed, clear tokens
                this.clearTokens();
                this.authState = 'idle';
              }
            } else {
              this.clearTokens();
              this.authState = 'idle';
            }
          }
        }
      } else {
        // We're not in a Discord environment, use regular OAuth flow
        console.log('Not in Discord environment, using regular OAuth flow');
        
        // Check if we have a stored token
        const token = localStorage.getItem('discord_access_token');
        if (token) {
          // Try to authenticate with the stored token
          try {
            await this.validateToken(token);
            this.authState = 'authenticated';
          } catch (err) {
            // Token is invalid, try to refresh
            const refreshToken = localStorage.getItem('discord_refresh_token');
            if (refreshToken) {
              try {
                await this.refreshToken(refreshToken);
                this.authState = 'authenticated';
              } catch (refreshErr) {
                // Refresh failed, clear tokens
                this.clearTokens();
                this.authState = 'idle';
              }
            } else {
              this.clearTokens();
              this.authState = 'idle';
            }
          }
        }
      }
      
      this.initialized = true;
      return Promise.resolve();
    } catch (err) {
      console.error('Failed to initialize Discord SDK:', err);
      this.authError = err.message;
      this.authState = 'error';
      return Promise.reject(err);
    }
  }

  /**
   * Link a Discord account
   * @returns {Promise} Promise that resolves when account is linked
   */
  async linkAccount() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    this.authState = 'loading';
    
    try {
      if (this.isDiscordEnvironment && this.discordSdk) {
        // Use Discord SDK for authentication
        console.log('Using Discord SDK for authentication');
        
        // Generate a code verifier for PKCE
        const codeVerifier = this.generateCodeVerifier();
        localStorage.setItem('discord_code_verifier', codeVerifier);
        
        // Generate a code challenge from the verifier
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);
        
        // Generate a random state
        const state = this.generateRandomState();
        localStorage.setItem('discord_auth_state', state);
        
        // Authorize with Discord
        const { code } = await this.discordSdk.commands.authorize({
          client_id: this.clientId,
          response_type: 'code',
          state,
          scope: this.scopes.join(' '),
          prompt: 'consent',
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          redirect_uri: this.redirectUri
        });
        
        // Exchange code for token
        await this.exchangeCodeForToken(code, codeVerifier);
        
        this.authState = 'authenticated';
        return Promise.resolve();
      } else {
        // Use regular OAuth flow
        console.log('Using regular OAuth flow for authentication');
        
        // Generate a code verifier for PKCE
        const codeVerifier = this.generateCodeVerifier();
        localStorage.setItem('discord_code_verifier', codeVerifier);
        
        // Generate a code challenge from the verifier
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);
        
        // Generate a random state
        const state = this.generateRandomState();
        localStorage.setItem('discord_auth_state', state);
        
        // Build the authorization URL
        const authUrl = new URL('https://discord.com/api/oauth2/authorize');
        authUrl.searchParams.append('client_id', this.clientId);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('scope', this.scopes.join(' '));
        authUrl.searchParams.append('prompt', 'consent');
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('redirect_uri', this.redirectUri);
        
        // Redirect to Discord for authorization
        window.location.href = authUrl.toString();
        
        // This will redirect, so we won't get here
        return new Promise(() => {});
      }
    } catch (err) {
      console.error('Failed to link Discord account:', err);
      this.authError = err.message;
      this.authState = 'error';
      return Promise.reject(err);
    }
  }

  /**
   * Handle the OAuth callback
   * @param {string} url - The callback URL
   * @returns {Promise} Promise that resolves when callback is handled
   */
  async handleCallback(url) {
    try {
      // Parse the URL
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const state = urlObj.searchParams.get('state');
      const error = urlObj.searchParams.get('error');
      
      // Check for errors
      if (error) {
        throw new Error(`Discord authentication error: ${error}`);
      }
      
      // Check if we have a code
      if (!code) {
        throw new Error('No code found in callback URL');
      }
      
      // Check if we have a state
      if (!state) {
        throw new Error('No state found in callback URL');
      }
      
      // Check if the state matches
      const savedState = localStorage.getItem('discord_auth_state');
      if (state !== savedState) {
        throw new Error('State mismatch in callback URL');
      }
      
      // Get the code verifier
      const codeVerifier = localStorage.getItem('discord_code_verifier');
      if (!codeVerifier) {
        throw new Error('No code verifier found');
      }
      
      // Exchange code for token
      await this.exchangeCodeForToken(code, codeVerifier);
      
      // Clear the state and code verifier
      localStorage.removeItem('discord_auth_state');
      localStorage.removeItem('discord_code_verifier');
      
      this.authState = 'authenticated';
      return Promise.resolve();
    } catch (err) {
      console.error('Failed to handle Discord callback:', err);
      this.authError = err.message;
      this.authState = 'error';
      return Promise.reject(err);
    }
  }

  /**
   * Exchange a code for a token
   * @param {string} code - The authorization code
   * @param {string} codeVerifier - The code verifier
   * @returns {Promise} Promise that resolves when token is exchanged
   */
  async exchangeCodeForToken(code, codeVerifier) {
    try {
      // Build the token request
      const tokenUrl = 'https://discord.com/api/oauth2/token';
      const body = new URLSearchParams();
      body.append('client_id', this.clientId);
      body.append('grant_type', 'authorization_code');
      body.append('code', code);
      body.append('redirect_uri', this.redirectUri);
      body.append('code_verifier', codeVerifier);
      
      // Send the request
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });
      
      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to exchange code for token: ${errorData.error}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Store the tokens
      localStorage.setItem('discord_access_token', data.access_token);
      localStorage.setItem('discord_refresh_token', data.refresh_token);
      localStorage.setItem('discord_token_expires_at', Date.now() + (data.expires_in * 1000));
      
      // Get the user profile
      await this.getProfile();
      
      return Promise.resolve();
    } catch (err) {
      console.error('Failed to exchange code for token:', err);
      throw err;
    }
  }

  /**
   * Refresh the access token
   * @param {string} refreshToken - The refresh token
   * @returns {Promise} Promise that resolves when token is refreshed
   */
  async refreshToken(refreshToken) {
    try {
      // Build the token request
      const tokenUrl = 'https://discord.com/api/oauth2/token';
      const body = new URLSearchParams();
      body.append('client_id', this.clientId);
      body.append('grant_type', 'refresh_token');
      body.append('refresh_token', refreshToken);
      
      // Send the request
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });
      
      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to refresh token: ${errorData.error}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Store the tokens
      localStorage.setItem('discord_access_token', data.access_token);
      localStorage.setItem('discord_refresh_token', data.refresh_token);
      localStorage.setItem('discord_token_expires_at', Date.now() + (data.expires_in * 1000));
      
      return Promise.resolve();
    } catch (err) {
      console.error('Failed to refresh token:', err);
      throw err;
    }
  }

  /**
   * Validate a token
   * @param {string} token - The access token
   * @returns {Promise} Promise that resolves when token is validated
   */
  async validateToken(token) {
    try {
      // Check if the token is expired
      const expiresAt = localStorage.getItem('discord_token_expires_at');
      if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
        throw new Error('Token expired');
      }
      
      // Send a request to the Discord API
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if the request was successful
      if (!response.ok) {
        throw new Error('Invalid token');
      }
      
      // Parse the response
      const data = await response.json();
      
      // Store the user profile
      this.userProfile = data;
      
      return Promise.resolve();
    } catch (err) {
      console.error('Failed to validate token:', err);
      throw err;
    }
  }

  /**
   * Get the user profile
   * @returns {Promise} Promise that resolves with the user profile
   */
  async getProfile() {
    try {
      // Check if we have a token
      const token = localStorage.getItem('discord_access_token');
      if (!token) {
        throw new Error('No access token found');
      }
      
      // Send a request to the Discord API
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if the request was successful
      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }
      
      // Parse the response
      const data = await response.json();
      
      // Store the user profile
      this.userProfile = data;
      
      return Promise.resolve(data);
    } catch (err) {
      console.error('Failed to get user profile:', err);
      throw err;
    }
  }

  /**
   * Logout
   * @returns {Promise} Promise that resolves when logout is complete
   */
  logout() {
    // Clear tokens and profile
    this.clearTokens();
    this.userProfile = null;
    this.authState = 'idle';
    
    return Promise.resolve();
  }

  /**
   * Clear tokens
   */
  clearTokens() {
    localStorage.removeItem('discord_access_token');
    localStorage.removeItem('discord_refresh_token');
    localStorage.removeItem('discord_token_expires_at');
    localStorage.removeItem('discord_auth_state');
    localStorage.removeItem('discord_code_verifier');
  }
  
  /**
   * Check if the user is authenticated
   * @returns {boolean} Whether the user is authenticated
   */
  isAuthenticated() {
    return this.authState === 'authenticated' && !!this.userProfile;
  }
  
  /**
   * Get the authenticated user
   * @returns {Object|null} The user profile or null if not authenticated
   */
  getUser() {
    return this.userProfile;
  }

  /**
   * Generate a random state
   * @returns {string} Random state
   */
  generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate a code verifier for PKCE
   * @returns {string} Code verifier
   */
  generateCodeVerifier() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  /**
   * Generate a code challenge from a code verifier
   * @param {string} codeVerifier - The code verifier
   * @returns {Promise<string>} Code challenge
   */
  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(digest));
  }

  /**
   * Base64URL encode a byte array
   * @param {Uint8Array} buffer - The byte array
   * @returns {string} Base64URL encoded string
   */
  base64URLEncode(buffer) {
    let base64 = btoa(String.fromCharCode.apply(null, buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

// Create and export a singleton instance
const discordAuthService = new DiscordAuthService();
export default discordAuthService;
