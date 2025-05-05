// This service is for Discord Rich Presence
// It's designed to work when the game is run outside of Discord

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
  }

  /**
   * Initialize the Discord RPC client
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    // Skip initialization in Discord iframe or if not in client environment
    if (!isClient || isDiscordEnvironment) {
      console.log('Skipping Rich Presence initialization (running in Discord or not in client)');
      return false;
    }

    if (this.initialized) return this.connected;

    try {
      // In a real implementation, this would connect to Discord's local RPC
      // For now, we'll just log the presence data for demonstration
      console.log('Rich Presence would initialize here in a desktop environment');
      this.connected = true;
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
    if (!isClient || !this.connected) return false;

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
      
      // In a real implementation, this would send to Discord
      console.log('Rich Presence Update:', this.lastPresenceData);
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
    if (!this.connected) return;
    
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
    if (!this.connected) return;
    
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
    console.log('Rich Presence service destroyed');
  }
}

// Create a singleton instance
const richPresenceService = new RichPresenceService();

export default richPresenceService;
