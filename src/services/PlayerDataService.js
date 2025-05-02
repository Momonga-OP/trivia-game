// Player data management service
import discordService from './DiscordService';

class PlayerDataService {
  constructor() {
    this.currentPlayer = null;
    this.loadPlayerData();
  }
  
  // Load player data from localStorage
  loadPlayerData() {
    // Try to get player data from localStorage
    const storedData = localStorage.getItem('player_data');
    
    if (storedData) {
      try {
        this.currentPlayer = JSON.parse(storedData);
      } catch (error) {
        console.error('Error parsing player data:', error);
        this.currentPlayer = this.createGuestProfile();
      }
    } else {
      // Create a guest profile if no data exists
      this.currentPlayer = this.createGuestProfile();
    }
    
    // If user is logged in with Discord, update the profile
    if (discordService.isLoggedIn()) {
      const discordUser = discordService.getCurrentUser();
      this.updatePlayerWithDiscordData(discordUser);
    }
    
    return this.currentPlayer;
  }
  
  // Create a default guest profile
  createGuestProfile() {
    return {
      id: 'guest-' + Math.random().toString(36).substring(2, 9),
      username: 'Guest',
      avatarUrl: null,
      isGuest: true,
      level: 1,
      experience: 0,
      score: 0,
      gamesPlayed: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      achievements: [],
      createdAt: new Date().toISOString()
    };
  }
  
  // Update player data with Discord user info
  updatePlayerWithDiscordData(discordUser) {
    if (!discordUser) return;
    
    // Check if we already have data for this Discord user
    const existingData = localStorage.getItem(`discord_player_${discordUser.id}`);
    
    if (existingData) {
      try {
        this.currentPlayer = JSON.parse(existingData);
      } catch (error) {
        // If error parsing, create new profile
        this.createProfileFromDiscordUser(discordUser);
      }
    } else {
      // Create new profile from Discord data
      this.createProfileFromDiscordUser(discordUser);
    }
    
    this.savePlayerData();
    return this.currentPlayer;
  }
  
  // Create a new player profile from Discord user data
  createProfileFromDiscordUser(discordUser) {
    this.currentPlayer = {
      id: discordUser.id,
      username: discordUser.username,
      avatarUrl: discordUser.avatarUrl,
      isGuest: false,
      level: 1,
      experience: 0,
      score: 0,
      gamesPlayed: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      achievements: [],
      createdAt: new Date().toISOString(),
      discordData: {
        id: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        email: discordUser.email
      }
    };
    
    return this.currentPlayer;
  }
  
  // Save player data to localStorage
  savePlayerData() {
    if (!this.currentPlayer) return;
    
    try {
      localStorage.setItem('player_data', JSON.stringify(this.currentPlayer));
      
      // If player is logged in with Discord, save to their specific storage as well
      if (!this.currentPlayer.isGuest && this.currentPlayer.discordData) {
        localStorage.setItem(
          `discord_player_${this.currentPlayer.id}`, 
          JSON.stringify(this.currentPlayer)
        );
      }
    } catch (error) {
      console.error('Error saving player data:', error);
    }
  }
  
  // Get current player data
  getCurrentPlayer() {
    return this.currentPlayer || this.createGuestProfile();
  }
  
  // Update player stats after a game
  updatePlayerStats(gameResults) {
    if (!this.currentPlayer) return;
    
    const { score, correctAnswers, totalQuestions } = gameResults;
    
    this.currentPlayer.score += score;
    this.currentPlayer.gamesPlayed += 1;
    this.currentPlayer.correctAnswers += correctAnswers;
    this.currentPlayer.totalAnswers += totalQuestions;
    
    // Calculate experience gain (10 XP per correct answer)
    const experienceGain = correctAnswers * 10;
    this.currentPlayer.experience += experienceGain;
    
    // Check for level up (100 XP per level)
    this.checkForLevelUp();
    
    // Save updated data
    this.savePlayerData();
    
    return {
      newScore: this.currentPlayer.score,
      experienceGain,
      newLevel: this.currentPlayer.level
    };
  }
  
  // Check if player should level up
  checkForLevelUp() {
    if (!this.currentPlayer) return;
    
    const experiencePerLevel = 100;
    const experienceForNextLevel = this.currentPlayer.level * experiencePerLevel;
    
    if (this.currentPlayer.experience >= experienceForNextLevel) {
      this.currentPlayer.level += 1;
      return true;
    }
    
    return false;
  }
  
  // Calculate accuracy percentage
  getAccuracyPercentage() {
    if (!this.currentPlayer || this.currentPlayer.totalAnswers === 0) {
      return 0;
    }
    
    return Math.round((this.currentPlayer.correctAnswers / this.currentPlayer.totalAnswers) * 100);
  }
  
  // Reset player progress (for testing)
  resetProgress() {
    if (this.currentPlayer.isGuest) {
      this.currentPlayer = this.createGuestProfile();
    } else {
      // Keep Discord data but reset progress
      const { id, username, avatarUrl, discordData } = this.currentPlayer;
      
      this.currentPlayer = {
        id,
        username,
        avatarUrl,
        discordData,
        isGuest: false,
        level: 1,
        experience: 0,
        score: 0,
        gamesPlayed: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        achievements: [],
        createdAt: new Date().toISOString()
      };
    }
    
    this.savePlayerData();
    return this.currentPlayer;
  }
}

// Create a singleton instance
const playerDataService = new PlayerDataService();
export default playerDataService;
