import React, { useState } from 'react';
import { useDiscordAuth } from '../contexts/DiscordAuthContext';
import './styles/PlayerProfile.css';

const PlayerProfile = ({ 
  username = 'Guest', 
  avatarUrl = null, 
  level = 1, 
  score = 0,
  isVisible = false,
  onClose = () => {},
}) => {
  // Get Discord auth context
  const { isAuthenticated, user, login } = useDiscordAuth();
  
  // Default avatar if none provided
  const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="40" r="25" fill="%238c52ff"/><circle cx="50" cy="110" r="50" fill="%238c52ff"/></svg>';
  
  // Use Discord avatar if authenticated, otherwise use provided avatar or default
  const userAvatar = isAuthenticated && user?.avatar 
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
    : (avatarUrl || defaultAvatar);
  
  // Use Discord username if authenticated
  const displayName = isAuthenticated && user 
    ? (user.global_name || user.username) 
    : username;
  
  const handleLogin = () => {
    login();
  };
  
  return (
    <div className="player-profile-container">
      {isVisible && (
        <div className="player-profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
            </div>
            <div className="profile-info">
              <h3 className="profile-username">{displayName}</h3>
              {isAuthenticated ? (
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
            {isAuthenticated ? (
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
