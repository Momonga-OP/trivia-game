import React, { useState, useEffect, useRef } from 'react';
import './styles/DiscordProfilePicture.css';
import discordService from '../services/DiscordService';
import playerDataService from '../services/PlayerDataService';

// Helper function to detect Discord Activity mode
const isInDiscordActivity = () => {
  // Check if we're in a Discord iframe
  const inDiscordIframe = window.location.href.includes('discord') || 
    window.location.ancestorOrigins?.contains('discord.com') ||
    navigator.userAgent.includes('DiscordBot') ||
    document.referrer.includes('discord.com');
  
  // Check for Discord SDK
  const hasDiscordSDK = typeof window.DiscordSDK !== 'undefined';
  
  // Check for Discord-specific URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const hasDiscordParams = urlParams.has('guild_id') || urlParams.has('channel_id');
  
  return inDiscordIframe || hasDiscordSDK || hasDiscordParams || discordService.isActivity;
};

const DiscordProfilePicture = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [isDiscordActivity, setIsDiscordActivity] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    // Detect if we're in Discord Activity mode
    const checkDiscordActivity = async () => {
      const inDiscordActivity = isInDiscordActivity();
      setIsDiscordActivity(inDiscordActivity);
      
      if (inDiscordActivity) {
        console.log('Discord Activity detected, initializing SDK...');
        // Try to initialize Discord SDK
        try {
          await discordService.initializeActivitySDK();
        } catch (error) {
          console.warn('Failed to initialize Discord SDK:', error);
        }
      }
    };
    
    checkDiscordActivity();
    
    // Load player data with retry mechanism
    const loadPlayerData = () => {
      // First try to get data from Discord service
      const discordUser = discordService.currentUser;
      
      if (discordUser) {
        // We have Discord user data
        const playerData = {
          username: discordUser.username,
          avatarUrl: discordUser.avatar ? 
            `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : 
            null,
          id: discordUser.id,
          isGuest: false
        };
        
        // Save to player data service and update state
        playerDataService.savePlayer(playerData);
        setPlayerData(playerData);
      } else {
        // Fallback to stored player data
        const currentPlayer = playerDataService.getCurrentPlayer();
        setPlayerData(currentPlayer);
      }
    };
    
    // Initial load
    loadPlayerData();
    
    // Set up interval to check for Discord data (in case it loads after component mount)
    const dataCheckInterval = setInterval(() => {
      if (discordService.currentUser) {
        loadPlayerData();
        clearInterval(dataCheckInterval);
      }
    }, 1000);
    
    // Listen for Discord participant changes
    const handleParticipantsChanged = (event) => {
      console.log('Discord participants changed:', event.detail);
      const participants = event.detail.participants;
      if (participants && participants.length > 0) {
        // Update player data
        loadPlayerData();
      }
    };

    window.addEventListener('discord:participants-changed', handleParticipantsChanged);

    // Close profile when clicking outside
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('discord:participants-changed', handleParticipantsChanged);
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(dataCheckInterval);
    };
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Default avatar if none provided
  const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="40" r="25" fill="%238c52ff"/><circle cx="50" cy="110" r="50" fill="%238c52ff"/></svg>';
  
  // Get avatar URL
  const avatarUrl = playerData?.avatarUrl || defaultAvatar;
  const username = playerData?.username || 'Guest';
  const level = playerData?.level || 1;

  return (
    <div className="discord-profile-container" ref={profileRef}>
      <div 
        className={`discord-avatar ${isExpanded ? 'expanded' : ''}`} 
        onClick={toggleExpand}
        title={isExpanded ? "" : username}
      >
        <img 
          src={avatarUrl} 
          alt={username} 
          className="avatar-image"
        />
        {!isExpanded && (
          <div className="level-badge">{level}</div>
        )}
      </div>

      {isExpanded && (
        <div className="discord-profile-expanded">
          <button className="close-profile-btn" onClick={toggleExpand}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="profile-header">
            <img 
              src={avatarUrl} 
              alt={username} 
              className="expanded-avatar-image"
            />
            <div className="profile-info">
              <h3 className="profile-username">{username}</h3>
              <div className="profile-level">Level {level}</div>
              {playerData && !playerData.isGuest && (
                <div className="discord-tag">
                  <svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="#5865F2"/>
                  </svg>
                  <span>Discord User</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-stats">
            {playerData && (
              <>
                <div className="stat-item">
                  <div className="stat-label">Games</div>
                  <div className="stat-value">{playerData.gamesPlayed || 0}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Accuracy</div>
                  <div className="stat-value">
                    {playerData.totalAnswers > 0 
                      ? Math.round((playerData.correctAnswers / playerData.totalAnswers) * 100) 
                      : 0}%
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Score</div>
                  <div className="stat-value">{playerData.score || 0}</div>
                </div>
              </>
            )}
          </div>
          
          {playerData && playerData.isGuest && (
            <div className="login-prompt">
              <p>Login with Discord to save your progress!</p>
              <button 
                className="discord-login-btn"
                onClick={() => discordService.login()}
              >
                <svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="white"/>
                </svg>
                Connect with Discord
              </button>
            </div>
          )}
          
          <div className="profile-footer">
            <div className="experience-bar">
              <div className="experience-progress" style={{ 
                width: `${playerData ? (playerData.experience % 100) : 0}%` 
              }}></div>
              <span className="experience-text">
                {playerData ? `${playerData.experience % 100}/100 XP` : '0/100 XP'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscordProfilePicture;
