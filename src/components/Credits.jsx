import React from 'react';
import './styles/Credits.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faCrown, faPalette, faGamepad, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext.jsx';

function Credits({ navigateTo, windowSize, isInDiscord }) {
  // Get sound functions from context
  const { playSound } = useSound();
  return (
    <div className={`credits-page ${isInDiscord ? 'discord-mode' : ''}`}>
      <div className="credits-container">
        <div className="credits-header">
          <h1><span className="gradient-text">Credits</span></h1>
          <p className="credits-subtitle">The amazing people who made this possible</p>
        </div>
        
        <div className="credits-content">
          <div className="credit-card creator">
            <div className="credit-card-header">
              <FontAwesomeIcon icon={faCrown} className="credit-icon" />
              <h2>Creator</h2>
            </div>
            <div className="credit-card-body">
              <div className="credit-avatar creator-avatar">
                <span>M</span>
              </div>
              <div className="credit-details">
                <div className="credit-name">Momonga</div>
                <div className="credit-role">
                  <FontAwesomeIcon icon={faGamepad} /> Momonga
                </div>
                <div className="credit-discord">
                  <FontAwesomeIcon icon={faDiscord} /> Latif
                </div>
              </div>
            </div>
          </div>

          <div className="credit-card ux">
            <div className="credit-card-header">
              <FontAwesomeIcon icon={faPalette} className="credit-icon" />
              <h2>UX Design</h2>
            </div>
            <div className="credit-card-body">
              <div className="credit-avatar ux-avatar">
                <span>Z</span>
              </div>
              <div className="credit-details">
                <div className="credit-name">Zubic Vila</div>
                <div className="credit-role">
                  <FontAwesomeIcon icon={faGamepad} /> Zubic Vila
                </div>
                <div className="credit-discord">
                  <FontAwesomeIcon icon={faDiscord} /> Zubic Vila
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="credits-footer">
          <p>Thank you for playing our trivia game!</p>
          <button 
            className="back-button" 
            onClick={() => {
              playSound('primaryButton');
              navigateTo('home');
            }}
            onMouseEnter={() => playSound('buttonHover')}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Credits;
