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

  // Simplified timer bar approach: directly set the width based on timeLeft
  // Calculate percentage for timer bar width
  const timerPercentage = Math.max((timeLeft / 30) * 100, 0);
  
  // Track question changes
  useEffect(() => {
    prevQuestionIdRef.current = questionId;
    // No need to manipulate DOM directly, we use inline styles
  }, [questionId]);
  
  // Track timeLeft changes
  useEffect(() => {
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Completely isolated TimerBar with minimal updates to prevent flickering
  const TimerBar = memo(({ timeLeft, isTimeLow }) => {
    // Calculate percentage directly in the component
    const percentage = Math.max((timeLeft / 30) * 100, 0);
    
    // Use useRef to store the DOM elements and avoid re-renders
    const timerBarElementRef = useRef(null);
    const timerTextRef = useRef(null);
    const timerContainerRef = useRef(null);
    
    // Use a separate ref to track previous values to minimize DOM updates
    const prevValuesRef = useRef({ timeLeft, isTimeLow, percentage });
    
    // Update the timer bar width and text directly using DOM manipulation to avoid re-renders
    // Only update the DOM when values actually change
    useEffect(() => {
      const prevValues = prevValuesRef.current;
      
      // Only update width if percentage changed significantly (avoid sub-pixel updates)
      if (Math.abs(prevValues.percentage - percentage) >= 1 && timerBarElementRef.current) {
        timerBarElementRef.current.style.width = `${percentage}%`;
      }
      
      // Only update text if timeLeft changed
      if (prevValues.timeLeft !== timeLeft && timerTextRef.current) {
        timerTextRef.current.textContent = `${timeLeft}s`;
      }
      
      // Only update class if isTimeLow changed
      if (prevValues.isTimeLow !== isTimeLow && timerContainerRef.current) {
        if (isTimeLow) {
          timerContainerRef.current.classList.add('low-time');
        } else {
          timerContainerRef.current.classList.remove('low-time');
        }
      }
      
      // Update previous values
      prevValuesRef.current = { timeLeft, isTimeLow, percentage };
    }, [percentage, timeLeft, isTimeLow]);
    
    return (
      <div className="timer-container" ref={timerContainerRef}>
        <div 
          ref={timerBarElementRef}
          className="timer-bar"
          style={{
            width: `${percentage}%`,
            // Remove all transitions for Discord to prevent flickering
            transition: 'none'
          }}
        ></div>
        <span className="timer-text" ref={timerTextRef}>{timeLeft}s</span>
      </div>
    );
  }, () => {
    // Always return true to prevent re-renders completely
    // All updates are handled via direct DOM manipulation
    return true;
  });

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
