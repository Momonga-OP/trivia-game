import React from 'react';
import './styles/HowToPlay.css';

function HowToPlay({ navigateTo }) {
  return (
    <div className="how-to-play-container">
      <div className="how-to-play-content">
        <h1 className="how-to-play-title">How to Play Dofus Lore Trivia</h1>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <i className="fas fa-gamepad"></i>
          </div>
          <div className="instruction-text">
            <h2>Game Basics</h2>
            <p>Test your knowledge of Dofus lore by answering multiple-choice questions about the game world, characters, and history.</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <i className="fas fa-mouse-pointer"></i>
          </div>
          <div className="instruction-text">
            <h2>Answer Questions</h2>
            <p>Simply click on the answer you think is correct. Your selection will be automatically submitted.</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="instruction-text">
            <h2>Time Limit</h2>
            <p>You have 15 seconds to answer each question. If time runs out, the question will be marked as incorrect.</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="instruction-text">
            <h2>Feedback</h2>
            <p>After answering, you'll immediately see if you were right or wrong, and the correct answer will be highlighted.</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <i className="fas fa-arrow-right"></i>
          </div>
          <div className="instruction-text">
            <h2>Next Question</h2>
            <p>Click the "Next Question" button to proceed to the next challenge.</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="instruction-text">
            <h2>Scoring</h2>
            <p>Each correct answer earns you one point. Try to get the highest score possible!</p>
          </div>
        </div>
        
        <div className="start-game-container">
          <button 
            className="start-game-button"
            onClick={() => navigateTo('game')}
          >
            Start Playing Now!
          </button>
        </div>
      </div>
    </div>
  );
}

export default HowToPlay;
