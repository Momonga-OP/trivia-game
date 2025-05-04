import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext.jsx';
import { useDiscordAuth } from '../contexts/DiscordAuthContext.jsx';
import DiscordAuthButton from './DiscordAuthButton';
import './styles/Header.css';
import './styles/Logo.css';

function Header({ navigateTo, currentPage, isInGame }) {
  const [showSettings, setShowSettings] = useState(false);
  const { playSound, isMuted, toggleMute, volume, updateVolume } = useSound();
  const { isAuthenticated, user } = useDiscordAuth();

  
  // Handle navigation with game lock
  const handleNavigation = (page) => {
    // Play sound and navigate
    playSound('secondaryButton');
    // Always allow navigation, even during gameplay
    navigateTo(page);
  };
  
  return (
    <>
      {/* Top header for desktop and tablet */}
      <header className="main-header">
        <div 
          className="logo" 
          onClick={() => handleNavigation('home')}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <div className="logo-container">
            <span className="logo-text">Dofus Lore Trivia</span>
          </div>
        </div>
        
        <nav className="main-nav">
          <ul className="nav-links">
            <li className={currentPage === 'home' ? 'active' : ''}>
              <button 
                onClick={() => handleNavigation('home')}
                className={isInGame ? 'in-game' : ''}
                onMouseEnter={() => playSound('buttonHover')}
              >
                Home
              </button>
            </li>
            <li className={currentPage === 'howtoplay' ? 'active' : ''}>
              <button 
                onClick={() => handleNavigation('howtoplay')}
                className={isInGame ? 'in-game' : ''}
                onMouseEnter={() => playSound('buttonHover')}
              >
                How to Play
              </button>
            </li>
            <li className={currentPage === 'lore' ? 'active' : ''}>
              <button 
                onClick={() => handleNavigation('lore')}
                className={isInGame ? 'in-game' : ''}
                onMouseEnter={() => playSound('buttonHover')}
              >
                Lore
              </button>
            </li>
          </ul>
          
          {/* Creator Credits */}
          <div className="creator-credits">
            <span>Created by Momonga</span>
          </div>
        </nav>
      </header>
      
      {/* Bottom tab navigation for mobile */}
      <div className="tab-navigation">
        <div 
          className={`tab-item ${currentPage === 'home' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
          onClick={() => handleNavigation('home')}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon="home" data-fallback="🏠" />
          <span>Home</span>
        </div>
        
        <div 
          className={`tab-item ${currentPage === 'howtoplay' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
          onClick={() => handleNavigation('howtoplay')}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon="question-circle" data-fallback="❓" />
          <span>How to Play</span>
        </div>
        
        <div 
          className={`tab-item ${currentPage === 'lore' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
          onClick={() => handleNavigation('lore')}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon="book" data-fallback="📖" />
          <span>Lore</span>
        </div>
        
        <div 
          className="tab-item"
          onClick={() => {
            playSound('secondaryButton');
            setShowSettings(true);
          }}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon="cog" data-fallback="⚙️" />
          <span>Settings</span>
        </div>
      </div>
      
      {/* Settings Panel (shown when settings tab is clicked) */}
      {showSettings && (
        <div className="settings-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="settings-modal" style={{
            backgroundColor: 'rgba(42, 27, 74, 0.95)',
            borderRadius: '16px',
            padding: '20px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(140, 82, 255, 0.2)',
            position: 'relative',
            width: '320px',
            maxWidth: '90%',
            border: '1px solid rgba(140, 82, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.3s ease forwards',
            margin: '0 auto'
          }}>
            <h2>Settings</h2>
            
            <div className="settings-content">
              <div className="settings-section">
                <h3>Sound Settings</h3>
                <div className="setting-item">
                  <label>Sound Effects:</label>
                  <button 
                    className={`toggle-button ${isMuted ? '' : 'active'}`}
                    onClick={() => {
                      toggleMute();
                      playSound('buttonClick');
                    }}
                    onMouseEnter={() => playSound('buttonHover')}
                  >
                    {isMuted ? 'Off' : 'On'}
                  </button>
                </div>
                
                <div className="setting-item">
                  <label>Volume:</label>
                  <div className="volume-control">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={volume}
                      disabled={isMuted}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value);
                        updateVolume(newVolume);
                        // Play a sound to demonstrate the new volume
                        if (!isMuted && newVolume > 0) {
                          playSound('buttonClick');
                        }
                      }}
                    />
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>Discord Integration</h3>
                <p>{isAuthenticated ? 'Your account is linked with Discord' : 'Link your account with Discord to save progress'}</p>
                
                <DiscordAuthButton 
                  className="settings-discord-button"
                  onClick={() => playSound('socialButton')}
                />
                
                {isAuthenticated && user && (
                  <div className="discord-user-info">
                    <p>Logged in as: {user.global_name || user.username}</p>
                  </div>
                )}
              </div>
              
              <div className="settings-section">
                <h3>Support</h3>
                <p>Have feedback or found a bug?</p>
                <p>Join our Discord community!</p>
                
                <button 
                  className="discord-button"
                  onClick={() => {
                    playSound('socialButton');
                    window.open('https://discord.gg/rKb3Zp7AQ2', '_blank');
                  }}
                  onMouseEnter={() => playSound('buttonHover')}
                >
                  <FontAwesomeIcon icon={faDiscord} data-fallback="Discord" />
                  <span>Join Discord</span>
                </button>
              </div>
            </div>
            
            <button 
              className="close-button"
              onClick={() => {
                playSound('closeButton');
                setShowSettings(false);
              }}
              onMouseEnter={() => playSound('buttonHover')}
              aria-label="Close settings"
              data-fallback="X"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: 0.8
              }}
            >
              <FontAwesomeIcon icon={faTimes} data-fallback="X" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
