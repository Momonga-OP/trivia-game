import React, { useState, useEffect, useRef } from 'react';
import './styles/HomePage.css';
import BackgroundAnimation from './BackgroundAnimation';
import PlayerProfile from './PlayerProfile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faPlay, faInfoCircle, faTrophy, faQuestion, faUsers } from '@fortawesome/free-solid-svg-icons';
import discordService from '../services/DiscordService';
import playerDataService from '../services/PlayerDataService';

function HomePage({ navigateTo, windowSize, playerData: propPlayerData }) {
  const [showSettings, setShowSettings] = useState(false);
  const [musicVolume, setMusicVolume] = useState(70);
  const [soundVolume, setSoundVolume] = useState(80);
  const [hoverCard, setHoverCard] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const audioRef = useRef(null);
  
  // Load player data on component mount
  useEffect(() => {
    if (propPlayerData) {
      setPlayerData(propPlayerData);
    } else {
      const player = playerDataService.getCurrentPlayer();
      setPlayerData(player);
    }
  }, [propPlayerData]);
  
  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);
  
  // Handle Discord login
  const handleDiscordLogin = () => {
    try {
      // Show a loading indicator or message if needed
      console.log('Initiating Discord login...');
      discordService.login();
    } catch (error) {
      console.error('Error initiating Discord login:', error);
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
          onMouseEnter={() => setHoverCard(true)}
          onMouseLeave={() => setHoverCard(false)}
        >
          <div className="card-glow"></div>
          <div className="card-content">
            <div className="game-mode-card-header">
              <div className="mode-icon">
                <i className="fas fa-user"></i>
              </div>
              <h2 className="game-mode-title">Solo Challenge</h2>
            </div>
            
            <div className="game-mode-details">
              <div className="detail-item">
                <i className="fas fa-star"></i>
                <span>Test your Dofus knowledge</span>
              </div>
              <div className="detail-item">
                <i className="fas fa-clock"></i>
                <span>15 seconds per question</span>
              </div>
              <div className="detail-item">
                <i className="fas fa-trophy"></i>
                <span>Earn high scores</span>
              </div>
            </div>
            
            <div className="game-mode-action">
              <button className="play-button" onClick={() => navigateTo('game')}>
                <span className="button-text">Play Now</span>
                <i className="fas fa-arrow-right"></i>
              </button>
              <button className="settings-button" onClick={() => setShowSettings(true)}>
                <i className="fas fa-cog"></i>
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
          
          <div className="settings-row">
            <label>Music</label>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="settings-row">
            <label>Sound</label>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>Have feedback or found a bug?</p>
            <p>Join our Discord!</p>
            
            <button 
              className="discord-button"
              onClick={() => window.open('https://discord.gg/rKb3Zp7AQ2', '_blank')}
            >
              <i className="fab fa-discord"></i>
              Join
            </button>
          </div>
          
          <button 
            className="close-button"
            onClick={() => setShowSettings(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
