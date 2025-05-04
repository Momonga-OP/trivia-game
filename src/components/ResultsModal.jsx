import React, { useEffect } from 'react';
import './styles/ResultsModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrophy, faCheck, faTimes as faX, faClock } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext.jsx';

function ResultsModal({ score, totalAnswered, onClose, onPlayAgain, gameType }) {
  const { playSound } = useSound();
  
  // Calculate percentage score
  const percentage = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  
  // Determine result message based on percentage
  const getResultMessage = () => {
    if (percentage >= 90) return "Legendary! You're a true Dofus master!";
    if (percentage >= 75) return "Excellent! Your knowledge is impressive!";
    if (percentage >= 60) return "Great job! You know your stuff!";
    if (percentage >= 40) return "Not bad! Keep learning!";
    return "Keep practicing! The World of Twelve has many secrets!";
  };
  
  // Play result sound when modal opens
  useEffect(() => {
    if (percentage >= 70) {
      playSound('success');
    } else if (percentage >= 40) {
      playSound('buttonClick');
    } else {
      playSound('error');
    }
  }, []);
  
  return (
    <div className="results-modal-overlay">
      <div className="results-modal">
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
        
        <div className="results-header">
          <div className="trophy-icon">
            <FontAwesomeIcon icon={faTrophy} />
          </div>
          <h2>Quiz Results</h2>
          <div className="game-type-badge">
            {gameType === 'dofusTouch' ? 'Dofus Touch' : 'Dofus'}
          </div>
        </div>
        
        <div className="score-display">
          <div className="score-circle">
            <div className="score-number">{percentage}%</div>
            <div className="score-text">{score} / {totalAnswered}</div>
          </div>
        </div>
        
        <div className="result-message">
          {getResultMessage()}
        </div>
        
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon correct">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div className="stat-details">
              <div className="stat-value">{score}</div>
              <div className="stat-label">Correct</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon incorrect">
              <FontAwesomeIcon icon={faX} />
            </div>
            <div className="stat-details">
              <div className="stat-value">{totalAnswered - score}</div>
              <div className="stat-label">Incorrect</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon time">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="stat-details">
              <div className="stat-value">{Math.round(totalAnswered * 30 / 60)}</div>
              <div className="stat-label">Minutes</div>
            </div>
          </div>
        </div>
        
        <div className="results-actions">
          <button 
            className="play-again-button" 
            onClick={() => {
              playSound('primaryButton');
              onPlayAgain();
            }}
            onMouseEnter={() => playSound('buttonHover')}
          >
            Play Again
          </button>
          
          <button 
            className="home-button" 
            onClick={() => {
              playSound('secondaryButton');
              onClose();
            }}
            onMouseEnter={() => playSound('buttonHover')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsModal;
