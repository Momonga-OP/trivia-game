// This service is for Discord Rich Presence
// It's designed to work when the game is run outside of Discord AND inside Discord

// Only initialize in browser environment, not during server-side rendering
const isClient = typeof window !== 'undefined';
const isDiscordEnvironment = isClient && (
  window.discord || 
  window.__DISCORD__ || 
  window.location.hostname.includes('discord.com')
);

class RichPresenceService {
  constructor() {
    this.connected = false;
    this.initialized = false;
    this.startTimestamp = null;
    this.lastPresenceData = null;
    this.discordSdk = null;
  }

  /**
   * Initialize the Discord RPC client
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    // Always try to initialize in Discord environment
    if (!isClient) {
      console.log('Skipping Rich Presence initialization (not in client)');
      return false;
    }

    if (this.initialized) return this.connected;

    try {
      // Check if we're in Discord
      if (isDiscordEnvironment) {
        console.log('Initializing Discord Activity presence');
        // In Discord, we'll use the Activity SDK
        if (window.discord?.activities) {
          this.discordSdk = window.discord.activities;
          this.connected = true;
        }
      } else {
        // In a regular browser, we'd use Discord's local RPC
        console.log('Rich Presence would initialize here in a desktop environment');
      }
      
      this.initialized = true;
      this.startTimestamp = new Date();
      
      // Set initial presence
      this.updatePresence({
        state: 'In Main Menu',
        details: 'Browsing Trivia Categories',
      });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Discord Rich Presence:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Update the user's Rich Presence
   * @param {Object} presenceData - The presence data to update
   * @returns {Promise<boolean>} Whether the update was successful
   */
  async updatePresence(presenceData) {
    if (!isClient) return false;

    try {
      // Save the presence data for refreshing
      this.lastPresenceData = {
        // Default values
        largeImageKey: 'dofus_logo',
        largeImageText: 'Dofus Lore Trivia',
        startTimestamp: this.startTimestamp,
        instance: false,
        
        // Override with provided data
        ...presenceData
      };
      
      // If in Discord, use the Activity SDK
      if (isDiscordEnvironment && this.discordSdk) {
        try {
          // Format data for Discord Activity
          const activityData = {
            state: this.lastPresenceData.state || 'Playing Trivia',
            details: this.lastPresenceData.details || 'Dofus Lore Trivia',
            timestamps: {
              start: this.startTimestamp ? this.startTimestamp.getTime() : Date.now(),
            },
            assets: {
              largeImage: this.lastPresenceData.largeImageKey || 'dofus_logo',
              largeText: this.lastPresenceData.largeImageText || 'Dofus Lore Trivia',
            }
          };
          
          // Add small image if provided
          if (this.lastPresenceData.smallImageKey) {
            activityData.assets.smallImage = this.lastPresenceData.smallImageKey;
            activityData.assets.smallText = this.lastPresenceData.smallImageText || '';
          }
          
          // Update Discord Activity
          if (this.discordSdk.setActivity) {
            await this.discordSdk.setActivity(activityData);
            console.log('Discord Activity updated:', activityData);
          }
        } catch (activityError) {
          console.warn('Failed to update Discord Activity:', activityError);
        }
      } else {
        // In a regular browser, this would send to Discord's local RPC
        console.log('Rich Presence Update:', this.lastPresenceData);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update Rich Presence:', error);
      return false;
    }
  }

  /**
   * Update presence for when a player is in the game
   * @param {Object} gameState - Current game state
   */
  updateGamePresence(gameState) {
    if (!this.initialized) return;
    
    const { score, currentQuestion, totalQuestions, category, difficulty } = gameState;
    
    this.updatePresence({
      state: `Score: ${score} points`,
      details: `Q${currentQuestion}/${totalQuestions} - ${category}`,
      smallImageKey: 'question_icon',
      smallImageText: `Difficulty: ${difficulty || 'Normal'}`,
    });
  }

  /**
   * Update presence for when a player completes a game
   * @param {Object} results - Game results
   */
  updateResultsPresence(results) {
    if (!this.initialized) return;
    
    const { score, totalQuestions, correctAnswers } = results;
    
    this.updatePresence({
      state: `Scored ${score} points`,
      details: `Got ${correctAnswers}/${totalQuestions} correct`,
      smallImageKey: 'trophy',
      smallImageText: 'Game Completed',
      endTimestamp: new Date(),
    });
  }

  /**
   * Clean up resources when the service is no longer needed
   */
  destroy() {
    this.connected = false;
    this.initialized = false;
    this.discordSdk = null;
    console.log('Rich Presence service destroyed');
  }
}

// Create a singleton instance
const richPresenceService = new RichPresenceService();

export default richPresenceService;
