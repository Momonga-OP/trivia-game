import React, { useState, useEffect } from 'react';
import './styles/HomePage.css';
import BackgroundAnimation from './BackgroundAnimation';
import PlayerProfile from './PlayerProfile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faPlay, faInfoCircle, faTrophy, faQuestion, faUsers } from '@fortawesome/free-solid-svg-icons';
import discordService from '../services/DiscordService';
import playerDataService from '../services/PlayerDataService';
import { useSound } from '../contexts/SoundContext';

function HomePage({ navigateTo, windowSize, playerData: propPlayerData }) {
  const [showSettings, setShowSettings] = useState(false);
  const [hoverCard, setHoverCard] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  
  // Get sound functions from context
  const { playSound } = useSound();

  
  // Load player data on component mount
  useEffect(() => {
    if (propPlayerData) {
      setPlayerData(propPlayerData);
    } else {
      const player = playerDataService.getCurrentPlayer();
      setPlayerData(player);
    }
  }, [propPlayerData]);
  

  
  // Handle Discord login
  const handleDiscordLogin = () => {
    try {
      // Play button click sound
      playSound('primaryButton');
      
      // Show a loading indicator or message if needed
      console.log('Initiating Discord login...');
      discordService.login();
    } catch (error) {
      console.error('Error initiating Discord login:', error);
      // Play error sound
      playSound('error');
      // You could show an error message to the user here
    }
  };
  
  return (
    <div className="home-page">
      {/* Background */}
      <BackgroundAnimation />
      
      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(6)].map((_, index) => (
          <div key={index} className={`particle particle-${index + 1}`}></div>
        ))}
      </div>
      
      {/* Header Section */}
      <div className="home-header">
        <div className="logo-container">
          <h1 className="game-title">Dofus Lore Trivia</h1>
          <div className="logo-glow"></div>
        </div>
        <p className="subtitle">Test your knowledge of the World of Twelve!</p>
      </div>
      
      {/* Game Mode Section */}
      <div className="game-section">
        <div 
          className={`game-mode-card ${hoverCard ? 'hover' : ''}`}
          onMouseEnter={() => {
            setHoverCard(true);
            playSound('cardFlip');
          }}
          onMouseLeave={() => setHoverCard(false)}
        >
          <div className="card-glow"></div>
          <div className="card-content">
            <div className="game-mode-card-header">
              <div className="mode-icon">
                <FontAwesomeIcon icon="users" />
              </div>
              <h2 className="game-mode-title">Solo Challenge</h2>
            </div>
            
            <div className="game-mode-details">
              <div className="detail-item">
                <FontAwesomeIcon icon="star" />
                <span>Test your Dofus knowledge</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon="clock" />
                <span>15 seconds per question</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon="trophy" />
                <span>Earn high scores</span>
              </div>
            </div>
            
            <div className="game-mode-action">
              <button 
                className="play-button" 
                onClick={() => navigateTo('game')}
                onMouseEnter={() => playSound('primaryButton')}
              >
                <span className="button-text">Play Now</span>
                <FontAwesomeIcon icon="arrow-right" />
              </button>
              <button 
                className="settings-button" 
                onClick={() => {
                  setShowSettings(true);
                  playSound('secondaryButton');
                }}
                onMouseEnter={() => playSound('buttonHover')}
              >
                <FontAwesomeIcon icon="cog" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="social-links">
        <a href="https://discord.gg/rKb3Zp7AQ2" target="_blank" rel="noopener noreferrer" className="social-icon discord">
          <i className="fab fa-discord"></i>
          <span className="tooltip">Join Discord</span>
        </a>
        <a href="https://www.youtube.com/@Spartadfosutouch1827" target="_blank" rel="noopener noreferrer" className="social-icon youtube">
          <i className="fab fa-youtube"></i>
          <span className="tooltip">YouTube Channel</span>
        </a>
      </div>
      
      {/* User Profile */}
      <div className="user-profile-wrapper">
        <PlayerProfile 
          username={playerData?.username || 'Guest'}
          avatarUrl={playerData?.avatarUrl}
          level={playerData?.level || 1}
          score={playerData?.score || 0}
          isLoggedIn={!playerData?.isGuest}
          onLogin={handleDiscordLogin}
        />
      </div>
      
      {/* Settings Panel (shown when settings button is clicked) */}
      {showSettings && (
        <div className="settings-panel">
          <h2>Settings</h2>
          

          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>Have feedback or found a bug?</p>
            <p>Join our Discord!</p>
            
            <button 
              className="discord-button"
              onClick={() => {
                playSound('socialButton');
                window.open('https://discord.gg/rKb3Zp7AQ2', '_blank');
              }}
              onMouseEnter={() => playSound('buttonHover')}
            >
              <i className="fab fa-discord"></i>
              Join
            </button>
          </div>
          
          <button 
            className="close-button"
            onClick={() => {
              setShowSettings(false);
              playSound('closeButton');
            }}
            onMouseEnter={() => playSound('buttonHover')}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
