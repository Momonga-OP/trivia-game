import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles/Header.css';
import './styles/Logo.css';

function Header({ navigateTo, currentPage, isInGame }) {
  const [showSettings, setShowSettings] = useState(false);

  
  // Handle navigation with game lock
  const handleNavigation = (page) => {
    navigateTo(page);
  };
  
  return (
    <>
      {/* Top header for desktop and tablet */}
      <header className="main-header">
        <div className="logo" onClick={() => handleNavigation('home')}>
          <div className="logo-container">
            <span className="logo-text">Dofus Lore Trivia</span>
          </div>
        </div>
        
        <nav className="main-nav">
          <ul className="nav-links">
            <li className={currentPage === 'home' ? 'active' : ''}>
              <button 
                onClick={() => handleNavigation('home')}
                className={isInGame ? 'disabled' : ''}
              >
                Home
              </button>
            </li>
            <li className={currentPage === 'howtoplay' ? 'active' : ''}>
              <button 
                onClick={() => handleNavigation('howtoplay')}
                className={isInGame ? 'disabled' : ''}
              >
                How to Play
              </button>
            </li>
            <li className={currentPage === 'lore' ? 'active' : ''}>
              <button 
                onClick={() => handleNavigation('lore')}
                className={isInGame ? 'disabled' : ''}
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
          className={`tab-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => navigateTo('home')}
        >
          <FontAwesomeIcon icon="home" />
          <span>Home</span>
        </div>
        
        <div 
          className={`tab-item ${currentPage === 'howtoplay' ? 'active' : ''}`}
          onClick={() => navigateTo('howtoplay')}
        >
          <FontAwesomeIcon icon="question-circle" />
          <span>How to Play</span>
        </div>
        
        <div 
          className={`tab-item ${currentPage === 'lore' ? 'active' : ''}`}
          onClick={() => navigateTo('lore')}
        >
          <FontAwesomeIcon icon="book" />
          <span>Lore</span>
        </div>
        
        <div 
          className="tab-item"
          onClick={() => setShowSettings(true)}
        >
          <FontAwesomeIcon icon="cog" />
          <span>Settings</span>
        </div>
      </div>
      
      {/* Settings Panel (shown when settings tab is clicked) */}
      {showSettings && (
        <div className="settings-panel">
          <h2>Settings</h2>
          

          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>Have feedback or found a bug?</p>
            <p>Join our Discord!</p>
            
            <button 
              style={{
                backgroundColor: '#5865f2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                margin: '15px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                width: '100%'
              }}
              onClick={() => window.open('https://discord.gg/rKb3Zp7AQ2', '_blank')}
            >
              <FontAwesomeIcon icon={['fab', 'discord']} />
              Join
            </button>
          </div>
          
          <button 
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer'
            }}
            onClick={() => setShowSettings(false)}
          >
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
      )}
    </>
  );
}

export default Header;
