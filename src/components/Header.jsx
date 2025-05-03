import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSound } from '../contexts/SoundContext.jsx';
import './styles/Header.css';
import './styles/Logo.css';

function Header({ navigateTo, currentPage, isInGame }) {
  const [showSettings, setShowSettings] = useState(false);
  const { playSound } = useSound();

  
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
      </div>
      
      {/* Settings Panel (shown when settings tab is clicked) */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-panel">
            <h2>Settings</h2>
            
            <div className="settings-content">
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
                <FontAwesomeIcon icon={['fab', 'discord']} />
                <span>Join Discord</span>
              </button>
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
              <FontAwesomeIcon icon="times" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
