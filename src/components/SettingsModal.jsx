import React from 'react';
import './styles/SettingsModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext.jsx';
import SoundSettings from './SoundSettings';

function SettingsModal({ onClose }) {
  const { playSound } = useSound();
  
  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <h2>Settings</h2>
        
        <div className="settings-modal-content">
          {/* Sound Settings Section */}
          <SoundSettings />
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
