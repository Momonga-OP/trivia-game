import React from 'react';
import { useDiscordAuth } from '../contexts/DiscordAuthContext';
import './styles/DiscordAuthButton.css';

/**
 * Discord authentication button component
 * Handles initiating the Discord OAuth flow
 */
const DiscordAuthButton = ({ className = '' }) => {
  const { isAuthenticated, user, login, logout, isLoading } = useDiscordAuth();

  const handleAuth = () => {
    if (isAuthenticated) {
      logout();
    } else {
      login();
    }
  };

  return (
    <button 
      className={`discord-auth-button ${className} ${isAuthenticated ? 'logged-in' : ''}`}
      onClick={handleAuth}
      disabled={isLoading}
    >
      <div className="discord-button-content">
        <i className="fab fa-discord" data-fallback="D"></i>
        <span>
          {isLoading 
            ? 'Loading...' 
            : isAuthenticated 
              ? `Disconnect Discord` 
              : 'Connect with Discord'
          }
        </span>
      </div>
      
      {isAuthenticated && user && (
        <div className="discord-user-preview">
          {user.avatar ? (
            <img 
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
              alt={user.username} 
              className="discord-avatar-preview"
            />
          ) : (
            <div className="discord-avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </button>
  );
};

export default DiscordAuthButton;
