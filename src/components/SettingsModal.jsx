import React from 'react';
import './styles/SettingsModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSound } from '../contexts/SoundContext.jsx';

function SettingsModal({ isOpen, onClose }) {
  const { playSound } = useSound();
  
  if (!isOpen) return null;
  
  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h2>Settings</h2>
        
        <div className="settings-modal-content">
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
            <FontAwesomeIcon icon={['fab', 'discord']} />
            Join
          </button>
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
          <FontAwesomeIcon icon="times" />
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;
