import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscordAuth } from '../contexts/DiscordAuthContext';
import playerDataService from '../services/PlayerDataService';
import './styles/DiscordCallback.css';

const DiscordCallback = () => {
  const navigate = useNavigate();
  const { isLoading, error: authError, user } = useDiscordAuth();
  const [status, setStatus] = useState('Processing login...');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // If there's an error from the Discord auth context
    if (authError) {
      setError(`Authentication error: ${authError}`);
      
      // Redirect back to home after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
      return;
    }
    
    // If we have a user, authentication was successful
    if (user && !isLoading) {
      // Update player data with Discord info
      playerDataService.updatePlayerWithDiscordData({
        id: user.id,
        username: user.username,
        discriminator: user.discriminator || '',
        avatar: user.avatar,
        global_name: user.global_name
      });
      
      setStatus('Login successful! Redirecting...');
      
      // Redirect back to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  }, [navigate, user, isLoading, authError]);
  
  return (
    <div className="discord-callback-container">
      <div className="auth-card">
        <div className="discord-logo">
          <i className="fab fa-discord"></i>
        </div>
        
        {error ? (
          <div className="auth-error">
            <h2>Authentication Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <h2>Discord Authentication</h2>
            <div className="loading-spinner"></div>
            <p>{status}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DiscordCallback;
