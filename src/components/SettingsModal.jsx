import React from 'react';
import './styles/SettingsModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext.jsx';

function SettingsModal({ onClose }) {
  const { playSound, isMuted, toggleMute, volume, updateVolume } = useSound();
  
  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h2>Settings</h2>
        
        <div className="settings-modal-content">
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
            <p>Join our Discord!</p>
            
            <button 
              className="discord-button"
              onClick={() => {
                playSound('socialButton');
                window.open('https://discord.gg/rKb3Zp7AQ2', '_blank');
              }}
              onMouseEnter={() => playSound('buttonHover')}
            >
              <FontAwesomeIcon icon={faDiscord} />
              Join Discord
            </button>
          </div>
        </div>
        
        <button 
          className="close-button"
          onClick={() => {
            onClose();
            playSound('closeButton');
          }}
          onMouseEnter={() => playSound('buttonHover')}
          data-fallback="X"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;
