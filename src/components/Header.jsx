import React, { useState } from 'react';
import './styles/Header.css';
import './styles/Logo.css';

function Header({ navigateTo, currentPage, onVolumeChange, isInGame }) {
  const [showSettings, setShowSettings] = useState(false);
  const [musicVolume, setMusicVolume] = useState(70);
  const [soundVolume, setSoundVolume] = useState(80);
  
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
          <i className="fas fa-home"></i>
          <span>Home</span>
        </div>
        
        <div 
          className={`tab-item ${currentPage === 'howtoplay' ? 'active' : ''}`}
          onClick={() => navigateTo('howtoplay')}
        >
          <i className="fas fa-question-circle"></i>
          <span>How to Play</span>
        </div>
        
        <div 
          className="tab-item"
          onClick={() => setShowSettings(true)}
        >
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </div>
      </div>
      
      {/* Settings Panel (shown when settings tab is clicked) */}
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
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setMusicVolume(value);
                  if (onVolumeChange) onVolumeChange(value);
                }}
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
              <i className="fab fa-discord"></i>
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
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </>
  );
}

export default Header;
