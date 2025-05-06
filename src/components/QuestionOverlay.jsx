import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import './styles/QuestionOverlay.css';

// Memoized QuestionOverlay component to prevent unnecessary re-renders
const QuestionOverlay = memo(function QuestionOverlay({ question, timeLeft, questionId, isInDiscord }) {
  const [animationClass, setAnimationClass] = useState('');
  const [displayedQuestion, setDisplayedQuestion] = useState(question);
  const timerBarRef = useRef(null);
  const prevTimeLeftRef = useRef(timeLeft);
  const prevQuestionIdRef = useRef(questionId);
  const animationTimerRef = useRef(null);
  const resetTimerRef = useRef(null);

  // Calculate if time is running low (less than 5 seconds)
  const isTimeLow = timeLeft <= 5;

  // Handle question changes with slide animation - optimized with useCallback
  const handleQuestionChange = useCallback(() => {
    if (question.text !== displayedQuestion.text) {
      // Clear any existing timers to prevent memory leaks
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      
      // Slide out current question
      setAnimationClass('slide-out');

      // After slide out animation, update question and slide in
      animationTimerRef.current = setTimeout(() => {
        setDisplayedQuestion(question);
        setAnimationClass('slide-in');

        // Reset animation class after slide in completes
        resetTimerRef.current = setTimeout(() => {
          setAnimationClass('');
        }, 500);
      }, 300);
    }
  }, [question, displayedQuestion]);

  // Apply question change effect
  useEffect(() => {
    handleQuestionChange();
    
    // Cleanup function to clear timers
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [handleQuestionChange]);

  // Reset and restart timer animation when timeLeft or questionId changes - optimized
  useEffect(() => {
    // If this is a new question, reset the animation
    if (questionId !== prevQuestionIdRef.current) {
      if (timerBarRef.current) {
        // Use requestAnimationFrame for smoother animation reset
        requestAnimationFrame(() => {
          // Reset animation
          timerBarRef.current.style.animation = 'none';
          timerBarRef.current.style.width = '100%';
          // Force reflow in a performance-optimized way
          timerBarRef.current.offsetHeight; // Force reflow
          // Restart animation
          timerBarRef.current.style.animation = `timerAnimation ${timeLeft}s linear forwards`;
        });
      }
      prevQuestionIdRef.current = questionId;
    } 
    // If timeLeft changed but not because of a new question
    else if (timeLeft !== prevTimeLeftRef.current) {
      if (timerBarRef.current) {
        // First stop the current animation
        const currentWidth = timerBarRef.current.offsetWidth / timerBarRef.current.parentNode.offsetWidth * 100;
        timerBarRef.current.style.animation = 'none';
        timerBarRef.current.style.width = `${currentWidth}%`;
        timerBarRef.current.offsetHeight; // Force reflow
        
        // Then restart with new duration
        timerBarRef.current.style.animation = `timerAnimation ${timeLeft}s linear forwards`;
        timerBarRef.current.style.animationDuration = `${timeLeft}s`;
      }
    }

    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, questionId]);

  // Memoize the timer bar to prevent unnecessary re-renders
  const TimerBar = memo(({ timeLeft, isTimeLow, timerBarRef }) => (
    <div className={`timer-container ${isTimeLow ? 'low-time' : ''}`}>
      <div 
        ref={timerBarRef}
        className="timer-bar" 
        style={{
          animationDuration: `${timeLeft}s`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          animationName: 'timerAnimation'
        }}
      ></div>
      <span className="timer-text">{timeLeft}s</span>
    </div>
  ));

  // Memoize the question text to prevent unnecessary re-renders
  const QuestionText = memo(({ isInDiscord, displayedQuestion }) => (
    isInDiscord ? (
      <div className="discord-question-wrapper">
        <h2 className="question-text" data-component-name="QuestionOverlay2">{displayedQuestion.text}</h2>
      </div>
    ) : (
      <h2 className="question-text">{displayedQuestion.text}</h2>
    )
  ));

  return (
    <div className={`question-overlay ${isInDiscord ? 'discord-mode' : ''}`}>
      <div className={`question-card ${animationClass}`}>
        <div className="question-header">
          <TimerBar 
            timeLeft={timeLeft} 
            isTimeLow={isTimeLow} 
            timerBarRef={timerBarRef} 
          />
        </div>
        
        <div className="question-body">
          {/* Add a special wrapper for Discord mode to ensure visibility */}
          <QuestionText 
            isInDiscord={isInDiscord} 
            displayedQuestion={displayedQuestion} 
          />
          
          {isInDiscord && displayedQuestion.image && (
            <div className="question-image-container">
              <img 
                src={displayedQuestion.image} 
                alt="Question illustration" 
                className="question-image discord-optimized"
                loading="eager"
                width="300"
                height="200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default QuestionOverlay;
