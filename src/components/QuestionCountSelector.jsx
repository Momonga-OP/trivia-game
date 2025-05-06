import React, { useState, useEffect } from 'react';
import './styles/QuestionCountSelector.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext.jsx';

function QuestionCountSelector({ onSelect, onClose, gameType }) {
  const { playSound } = useSound();
  const [isInDiscord, setIsInDiscord] = useState(false);
  
  // Detect if running in Discord environment
  useEffect(() => {
    const inDiscord = typeof window !== 'undefined' && (
      window.location.href.includes('discord') || 
      navigator.userAgent.includes('Discord') ||
      window.innerWidth <= 600
    );
    setIsInDiscord(inDiscord);
  }, []);
  
  const questionCounts = [10, 20, 30, 40];
  
  const handleSelect = (count) => {
    playSound('primaryButton');
    onSelect(count);
  };
  
  // Handle touch for mobile Discord users
  const handleTouchStart = (count) => {
    if (isInDiscord) {
      playSound('buttonHover');
    }
  };
  
  return (
    <div className={`question-count-overlay ${isInDiscord ? 'discord-mode' : ''}`}>
      <div className={`question-count-modal ${isInDiscord ? 'discord-mode' : ''}`}>
        <button 
          className="close-button"
          onClick={() => {
            onClose();
            playSound('closeButton');
          }}
          onMouseEnter={() => playSound('buttonHover')}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="question-count-header">
          <FontAwesomeIcon icon={faQuestionCircle} className="question-icon" />
          <h2>How many questions?</h2>
        </div>
        
        <p className="question-count-description">
          Select the number of questions for your {gameType === 'dofusTouch' ? 'Dofus Touch' : 'Dofus'} trivia game.
        </p>
        
        <div className="question-count-options">
          {questionCounts.map(count => (
            <button
              key={count}
              className={`question-count-button ${isInDiscord ? 'discord-mode' : ''}`}
              onClick={() => handleSelect(count)}
              onMouseEnter={() => !isInDiscord && playSound('buttonHover')}
              onTouchStart={() => handleTouchStart(count)}
              aria-label={`${count} Questions`}
            >
              <span className="count-number">{count}</span>
              <span className="count-text">Questions</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestionCountSelector;
