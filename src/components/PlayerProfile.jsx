import React, { useState } from 'react';
import './styles/PlayerProfile.css';

const PlayerProfile = ({ 
  username = 'Guest', 
  avatarUrl = null, 
  level = 1, 
  score = 0,
  isLoggedIn = false,
  onLogin = () => {},
}) => {
  const [showProfile, setShowProfile] = useState(false);
  
  // Default avatar if none provided
  const defaultAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
  const userAvatar = avatarUrl || defaultAvatar;
  
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };
  
  const handleLogin = () => {
    onLogin();
  };
  
  return (
    <div className="player-profile-container">
      <div className="player-avatar-wrapper" onClick={toggleProfile}>
        <div className="player-avatar">
          <img src={userAvatar} alt={username} />
          {isLoggedIn && <div className="player-level">Lvl {level}</div>}
        </div>
      </div>
      
      {showProfile && (
        <div className="player-profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <img src={userAvatar} alt={username} />
            </div>
            <div className="profile-info">
              <h3 className="profile-username">{username}</h3>
              {isLoggedIn ? (
                <>
                  <div className="profile-level">Level {level}</div>
                  <div className="profile-score">Score: {score}</div>
                </>
              ) : (
                <div className="profile-guest">Playing as Guest</div>
              )}
            </div>
          </div>
          
          <div className="profile-stats">
            {isLoggedIn ? (
              <>
                <div className="stat-item">
                  <div className="stat-label">Games Played</div>
                  <div className="stat-value">12</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Correct Answers</div>
                  <div className="stat-value">87%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Best Score</div>
                  <div className="stat-value">{score}</div>
                </div>
              </>
            ) : (
              <div className="login-prompt">
                <p>Connect with Discord to save your progress and compete with friends!</p>
                <button className="discord-login-button" onClick={handleLogin}>
                  <i className="fab fa-discord"></i>
                  Login with Discord
                </button>
              </div>
            )}
          </div>
          
          <button className="close-profile" onClick={toggleProfile}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerProfile;
