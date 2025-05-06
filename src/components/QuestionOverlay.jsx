import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import './styles/QuestionOverlay.css';

// Memoized QuestionOverlay component to prevent unnecessary re-renders
const QuestionOverlay = memo(function QuestionOverlay({ question, timeLeft, questionId, isInDiscord }) {
  const [animationClass, setAnimationClass] = useState('');
  const [displayedQuestion, setDisplayedQuestion] = useState(question);
  const timerBarRef = useRef(null);
  const prevTimeLeftRef = useRef(timeLeft);
  const prevQuestionIdRef = useRef(questionId);

  // Calculate if time is running low (less than 5 seconds)
  const isTimeLow = timeLeft <= 5;

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

  // Reset and restart timer animation when timeLeft or questionId changes
  useEffect(() => {
    // If this is a new question, reset the animation
    if (questionId !== prevQuestionIdRef.current) {
      if (timerBarRef.current) {
        // Reset animation
        timerBarRef.current.style.animation = 'none';
        // Force reflow
        void timerBarRef.current.offsetWidth;
        // Restart animation
        timerBarRef.current.style.animation = `timerAnimation ${timeLeft}s linear forwards`;
      }
      prevQuestionIdRef.current = questionId;
    } 
    // If timeLeft changed but not because of a new question
    else if (timeLeft !== prevTimeLeftRef.current) {
      if (timerBarRef.current) {
        // Update animation duration
        timerBarRef.current.style.animationDuration = `${timeLeft}s`;
      }
    }

    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, questionId]);

  return (
    <div className={`question-overlay ${isInDiscord ? 'discord-mode' : ''}`}>
      <div className={`question-card ${animationClass}`}>
        <div className="question-header">
          <div className={`timer-container ${isTimeLow ? 'low-time' : ''}`}>
            <div 
              ref={timerBarRef}
              className="timer-bar" 
              style={{
                animationDuration: `${timeLeft}s`
              }}
            ></div>
            <span className="timer-text">{timeLeft}s</span>
          </div>
        </div>
        
        <div className="question-body">
          {/* Add a special wrapper for Discord mode to ensure visibility */}
          {isInDiscord ? (
            <div className="discord-question-wrapper">
              <h2 className="question-text" data-component-name="QuestionOverlay2">{displayedQuestion.text}</h2>
            </div>
          ) : (
            <h2 className="question-text">{displayedQuestion.text}</h2>
          )}
          
          {isInDiscord && displayedQuestion.image && (
            <div className="question-image-container">
              <img 
                src={displayedQuestion.image} 
                alt="Question illustration" 
                className="question-image discord-optimized"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default QuestionOverlay;
