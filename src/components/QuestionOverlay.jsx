import React, { useState, useEffect } from 'react';
import './styles/QuestionOverlay.css';

function QuestionOverlay({ question, timeLeft, questionId }) {
  const [animationClass, setAnimationClass] = useState('');
  const [displayedQuestion, setDisplayedQuestion] = useState(question);
  
  // Handle question changes with slide animation
  useEffect(() => {
    if (question.text !== displayedQuestion.text) {
      // Slide out current question
      setAnimationClass('slide-out');
      
      // After slide out animation, update question and slide in
      const timer = setTimeout(() => {
        setDisplayedQuestion(question);
        setAnimationClass('slide-in');
        
        // Reset animation class after slide in completes
        const resetTimer = setTimeout(() => {
          setAnimationClass('');
        }, 500);
        
        return () => clearTimeout(resetTimer);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [question, displayedQuestion]);
  
  return (
    <div className="question-overlay">
      <div className={`question-card ${animationClass}`}>
        <div className="question-header">
          <div className="timer-container">
            <div className="timer-bar" style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
            <span className="timer-text">{timeLeft}s</span>
          </div>
        </div>
        
        <div className="question-body">
          <h2 className="question-text">{displayedQuestion.text}</h2>
        </div>
      </div>
    </div>
  );
}

export default QuestionOverlay;
