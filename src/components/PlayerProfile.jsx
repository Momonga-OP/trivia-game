import React, { useState } from 'react';
import './styles/PlayerProfile.css';

const PlayerProfile = ({ 
  username = 'Guest', 
  avatarUrl = null, 
  level = 1, 
  score = 0,
  isLoggedIn = false,
  onLogin = () => {},
  isVisible = false,
  onClose = () => {},
}) => {
  // Default avatar if none provided
  const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="40" r="25" fill="%238c52ff"/><circle cx="50" cy="110" r="50" fill="%238c52ff"/></svg>';
  const userAvatar = avatarUrl || defaultAvatar;
  
  const handleLogin = () => {
    onLogin();
  };
  
  return (
    <div className="player-profile-container">
      {isVisible && (
        <div className="player-profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
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
                <p>Login to save your progress and compete with friends!</p>
                <button className="login-button" onClick={handleLogin}>
                  Sign In
                </button>
              </div>
            )}
          </div>
          
          <button className="close-profile" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerProfile;
