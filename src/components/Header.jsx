import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { 
  faTimes, 
  faHome, 
  faQuestionCircle, 
  faBook, 
  faCog,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext.jsx';
import { isInDiscord } from '../utils/DiscordUtils';
import './styles/Header.css';
import './styles/Logo.css';
import SettingsModal from './SettingsModal';

function Header({ navigateTo, currentPage, isInGame, isInDiscord: propIsInDiscord }) {
  const [showSettings, setShowSettings] = useState(false);
  const { playSound, isMuted, toggleMute, volume, updateVolume } = useSound();
  const [inDiscordEnv, setInDiscordEnv] = useState(propIsInDiscord || false);
  
  // Check if we're in Discord environment
  useEffect(() => {
    // Use the prop if provided, otherwise detect it
    setInDiscordEnv(propIsInDiscord || isInDiscord());
    
    // Force update on window load to ensure proper detection
    const handleLoad = () => {
      setInDiscordEnv(propIsInDiscord || isInDiscord());
    };
    
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, [propIsInDiscord]);
  
  // Handle navigation with game lock
  const handleNavigation = (page) => {
    // Play sound and navigate
    playSound('secondaryButton');
    // Always allow navigation, even during gameplay
    navigateTo(page);
  };
  
  // Hide top header when in game AND in Discord environment
  const shouldHideTopHeader = isInGame && inDiscordEnv;
  
  // For debugging - log the state
  useEffect(() => {
    console.log('Header state:', { isInGame, inDiscordEnv, shouldHideTopHeader });
  }, [isInGame, inDiscordEnv, shouldHideTopHeader]);
  
  if (shouldHideTopHeader) {
    // Return only the simplified bottom navigation for Discord game mode
    return (
      <div className="tab-navigation discord-game-mode">
        <div 
          className="tab-item active"
          onClick={() => handleNavigation('home')}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Exit Game</span>
        </div>
      </div>
    );
  }
  
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
            <li className={currentPage === 'credits' ? 'active' : ''}>
              <button 
                onClick={() => handleNavigation('credits')}
                className={isInGame ? 'in-game' : ''}
                onMouseEnter={() => playSound('buttonHover')}
              >
                Credits
              </button>
            </li>
          </ul>
        </nav>
      </header>
      
      {/* Bottom tab navigation for mobile */}
      <div className="tab-navigation">
        <div 
          className={`tab-item ${currentPage === 'home' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
          onClick={() => handleNavigation('home')}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </div>
        
        <div 
          className={`tab-item ${currentPage === 'howtoplay' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
          onClick={() => handleNavigation('howtoplay')}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
          <span>How to Play</span>
        </div>
        
        <div 
          className={`tab-item ${currentPage === 'lore' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
          onClick={() => handleNavigation('lore')}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon={faBook} />
          <span>Lore</span>
        </div>
        
        <div 
          className={`tab-item ${currentPage === 'credits' ? 'active' : ''} ${isInGame ? 'in-game' : ''}`}
          onClick={() => handleNavigation('credits')}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon={faUsers} />
          <span>Credits</span>
        </div>
        
        <div 
          className="tab-item"
          onClick={() => {
            playSound('secondaryButton');
            setShowSettings(true);
          }}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon={faCog} />
          <span>Settings</span>
        </div>
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}

export default Header;
