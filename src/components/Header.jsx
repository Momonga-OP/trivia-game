import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext.jsx';
import { isInDiscord } from '../utils/DiscordUtils';
import './styles/Header.css';
import './styles/Logo.css';

function Header({ navigateTo, currentPage, isInGame }) {
  const [showSettings, setShowSettings] = useState(false);
  const { playSound, isMuted, toggleMute, volume, updateVolume } = useSound();
  const [inDiscordEnv, setInDiscordEnv] = useState(false);
  
  // Check if we're in Discord environment
  useEffect(() => {
    setInDiscordEnv(isInDiscord());
  }, []);
  
  // Handle navigation with game lock
  const handleNavigation = (page) => {
    // Play sound and navigate
    playSound('secondaryButton');
    // Always allow navigation, even during gameplay
    navigateTo(page);
  };
  
  // Hide top header when in game AND in Discord environment
  const shouldHideTopHeader = isInGame && inDiscordEnv;
  
  return (
    <>
      {/* Top header for desktop and tablet - hidden during gameplay in Discord */}
      {!shouldHideTopHeader && (
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
      )}
      
      {/* Bottom tab navigation for mobile - always visible but simplified in Discord during gameplay */}
      <div className={`tab-navigation ${shouldHideTopHeader ? 'discord-game-mode' : ''}`}>
        {/* Only show Home tab during gameplay in Discord */}
        {shouldHideTopHeader ? (
          <div 
            className="tab-item active"
            onClick={() => handleNavigation('home')}
            onMouseEnter={() => playSound('buttonHover')}
          >
            <FontAwesomeIcon icon="home" />
            <span>Exit Game</span>
          </div>
        ) : (
          <>
            <div 
              className={`tab-item ${currentPage === 'home' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
              onClick={() => handleNavigation('home')}
              onMouseEnter={() => playSound('buttonHover')}
            >
              <FontAwesomeIcon icon="home" />
              <span>Home</span>
            </div>
            
            <div 
              className={`tab-item ${currentPage === 'howtoplay' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
              onClick={() => handleNavigation('howtoplay')}
              onMouseEnter={() => playSound('buttonHover')}
            >
              <FontAwesomeIcon icon="question-circle" />
              <span>How to Play</span>
            </div>
            
            <div 
              className={`tab-item ${currentPage === 'lore' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
              onClick={() => handleNavigation('lore')}
              onMouseEnter={() => playSound('buttonHover')}
            >
              <FontAwesomeIcon icon="book" />
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
              <FontAwesomeIcon icon="cog" />
              <span>Settings</span>
            </div>
          </>
        )}
      </div>
      
      {/* Settings Panel (shown when settings tab is clicked) */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-panel">
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
                  <FontAwesomeIcon icon={faDiscord} />
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
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
