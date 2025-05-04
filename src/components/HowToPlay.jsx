import React from 'react';
import './styles/HowToPlay.css';
import { useSound } from '../contexts/SoundContext.jsx';
import BackgroundAnimation from './BackgroundAnimation';

function HowToPlay({ navigateTo }) {
  const { playSound } = useSound();
  
  return (
    <div className="how-to-play-container">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(6)].map((_, index) => (
          <div key={index} className={`particle particle-${index + 1}`}></div>
        ))}
      </div>
      <div className="how-to-play-content">
        <h1 className="how-to-play-title">How to Play Dofus Lore Trivia</h1>
        <p className="how-to-play-subtitle">Follow these simple steps to test your knowledge of the World of Twelve!</p>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <span className="step-number">1</span>
            <span className="icon-text">🎮</span>
          </div>
          <div className="instruction-text">
            <h2>Step 1: Choose Your Game</h2>
            <p>Select either Dofus or Dofus Touch from the game selection screen to start a quiz tailored to that version.</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <span className="step-number">2</span>
            <span className="icon-text">⏲️</span>
          </div>
          <div className="instruction-text">
            <h2>Step 2: Wait for Countdown</h2>
            <p>After selecting a game, a 3-2-1 countdown will appear. Get ready to answer questions when it finishes!</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <span className="step-number">3</span>
            <span className="icon-text">❓</span>
          </div>
          <div className="instruction-text">
            <h2>Step 3: Read the Question</h2>
            <p>Each question will appear at the top of the screen. Read it carefully and think about your answer.</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <span className="step-number">4</span>
            <span className="icon-text">🔎</span>
          </div>
          <div className="instruction-text">
            <h2>Step 4: Select Your Answer</h2>
            <p>Click on one of the multiple-choice options that you think is correct. You have 30 seconds to make your selection.</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <span className="step-number">5</span>
            <span className="icon-text">✅</span>
          </div>
          <div className="instruction-text">
            <h2>Step 5: See Your Result</h2>
            <p>After selecting an answer, you'll immediately see if you were right or wrong. The correct answer will be highlighted in green.</p>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-icon">
            <span className="step-number">6</span>
            <span className="icon-text">➡️</span>
          </div>
          <div className="instruction-text">
            <h2>Step 6: Continue to Next Question</h2>
            <p>Click the "Next Question" button to proceed to the next challenge. This button appears after you've selected an answer.</p>
          </div>
        </div>
        

        
        <div className="instruction-card">
          <div className="instruction-icon">
            <span className="step-number">7</span>
            <span className="icon-text">🏆</span>
          </div>
          <div className="instruction-text">
            <h2>Step 7: View Your Final Score</h2>
            <p>After answering all questions, you'll see your final score. Each correct answer earns you one point!</p>
          </div>
        </div>
        
        <div className="start-game-container">
          <button 
            className="start-game-button"
            onClick={() => {
              playSound('buttonClick');
              navigateTo('game');
            }}
            onMouseEnter={() => playSound('buttonHover')}
          >
            Start Playing Now!
          </button>
          <button 
            className="back-button"
            onClick={() => {
              playSound('buttonClick');
              navigateTo('home');
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

export default HowToPlay;
