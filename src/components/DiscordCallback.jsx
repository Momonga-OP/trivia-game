import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import discordService from '../services/DiscordService';
import playerDataService from '../services/PlayerDataService';
import './styles/DiscordCallback.css';

const DiscordCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing login...');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const processAuth = async () => {
      try {
        // Handle the OAuth callback
        const userData = await discordService.handleCallback();
        
        // Update player data with Discord info
        playerDataService.updatePlayerWithDiscordData(userData);
        
        setStatus('Login successful! Redirecting...');
        
        // Redirect back to home after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate with Discord. Please try again.');
        
        // Redirect back to home after a delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };
    
    processAuth();
  }, [navigate]);
  
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
