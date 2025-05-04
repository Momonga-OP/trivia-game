import React from 'react';
import { useDiscordAuth } from '../contexts/DiscordAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { useSound } from '../contexts/SoundContext';
import './styles/UserProfile.css';

const UserProfile = () => {
  const { isAuthenticated, isLoading, user, login, logout, isDiscordEnvironment } = useDiscordAuth();
  const { playSound } = useSound();
  
  // Handle login click
  const handleLoginClick = () => {
    playSound('primaryButton');
    login();
  };
  
  // Handle logout click
  const handleLogoutClick = () => {
    playSound('secondaryButton');
    logout();
  };
  
  // Get Discord avatar URL
  const getAvatarUrl = () => {
    if (!user || !user.id || !user.avatar) {
      return 'https://cdn.discordapp.com/embed/avatars/0.png'; // Default Discord avatar
    }
    
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  };
  
  return (
    <div className="user-profile-container">
      {isLoading ? (
        <div className="user-profile-loading">
          <div className="loading-spinner"></div>
          <span>Loading profile...</span>
        </div>
      ) : isAuthenticated && user ? (
        <div className="user-profile">
          <div className="user-avatar">
            <img 
              src={getAvatarUrl()} 
              alt={`${user.username}'s avatar`} 
              onError={(e) => {
                e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
              }}
            />
            {isDiscordEnvironment && (
              <div className="discord-badge">
                <FontAwesomeIcon icon={faDiscord} data-fallback="Discord" />
              </div>
            )}
          </div>
          <div className="user-info">
            <h3 className="user-name">{user.global_name || user.username}</h3>
            <p className="user-tag">@{user.username}</p>
            <button 
              className="logout-button"
              onClick={handleLogoutClick}
              onMouseEnter={() => playSound('buttonHover')}
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="login-container">
          <button 
            className="discord-login-button"
            onClick={handleLoginClick}
            onMouseEnter={() => playSound('buttonHover')}
          >
            <FontAwesomeIcon icon={faDiscord} data-fallback="Discord" />
            <span>{isDiscordEnvironment ? 'Link Discord Account' : 'Sign in with Discord'}</span>
          </button>
          <p className="login-info">
            {isDiscordEnvironment 
              ? 'Link your Discord account to save progress and compete with friends!'
              : 'Sign in to save your progress and compete with friends!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
