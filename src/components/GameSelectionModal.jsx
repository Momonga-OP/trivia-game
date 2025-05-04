import React from 'react';
import './styles/GameSelectionModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGamepad, faMobileAlt, faInfoCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext.jsx';

function GameSelectionModal({ onClose, onSelectGame }) {
  const { playSound } = useSound();

  const handleGameSelect = (game) => {
    // Play button click sound
    playSound('buttonClick');
    onSelectGame(game);
  };

  return (
    <div className="game-selection-modal-overlay">
      <div className="game-selection-modal">
        <div className="modal-particles">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`particle particle-${i+1}`}></div>
          ))}
        </div>
        
        <button 
          className="close-button" 
          onClick={() => {
            playSound('secondaryButton');
            onClose();
          }}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="modal-header">
          <h2>Select Your Adventure</h2>
          <p>Choose which Dofus universe you want to test your knowledge in:</p>
        </div>
        
        <div className="game-options">
          <div 
            className="game-option dofus"
            onClick={() => handleGameSelect('dofus')}
            onMouseEnter={() => playSound('buttonHover')}
          >
            <div className="game-icon">
              <FontAwesomeIcon icon={faGamepad} />
            </div>
            <div className="game-option-content">
              <h3>Dofus</h3>
              <p>The original World of Twelve adventure</p>
              
              <div className="game-details">
                <div className="detail-item">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>Classic Dofus lore and mechanics</span>
                </div>
                <div className="detail-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>30 seconds per question</span>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className="game-option dofus-touch"
            onClick={() => handleGameSelect('dofusTouch')}
            onMouseEnter={() => playSound('buttonHover')}
          >
            <div className="game-icon">
              <FontAwesomeIcon icon={faMobileAlt} />
            </div>
            <div className="game-option-content">
              <h3>Dofus Touch</h3>
              <p>The mobile experience of Dofus</p>
              
              <div className="game-details">
                <div className="detail-item">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>Mobile-specific features and content</span>
                </div>
                <div className="detail-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>30 seconds per question</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <p>Both games feature challenging questions to test your knowledge!</p>
        </div>
      </div>
    </div>
  );
}

export default GameSelectionModal;
