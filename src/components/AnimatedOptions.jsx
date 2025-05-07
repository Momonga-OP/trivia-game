import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import './styles/AnimatedOptions.css';
import { useSound } from '../contexts/SoundContext.jsx';

// Memoized AnimatedOptions component to prevent unnecessary re-renders
const AnimatedOptions = memo(function AnimatedOptions({ options, selectedOption, correctAnswer, showNextButton, onOptionSelect, questionId, isInDiscord }) {
  const { playSound } = useSound();
  const [animationClass, setAnimationClass] = useState('');
  const [displayedOptions, setDisplayedOptions] = useState(options);
  const animationTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const initialAnimationRef = useRef(null);
  
  // Handle options changes with slide animation - optimized with useCallback
  const handleOptionsChange = useCallback(() => {
    if (options !== displayedOptions) {
      // Clear any existing timers to prevent memory leaks
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      
      // Slide out current options
      setAnimationClass('slide-out');
      
      // After slide out animation, update options and slide in
      animationTimerRef.current = setTimeout(() => {
        setDisplayedOptions(options);
        
        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
          setAnimationClass('slide-in');
          
          // Reset animation class after slide in completes
          resetTimerRef.current = setTimeout(() => {
            setAnimationClass('');
          }, 500);
        });
      }, 300);
    }
  }, [options, displayedOptions]);
  
  // Apply options change effect
  useEffect(() => {
    handleOptionsChange();
    
    // Cleanup function to clear timers
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [handleOptionsChange]);
  
  // Initial animation when component mounts - optimized
  useEffect(() => {
    // Use requestAnimationFrame for smoother initial animation
    requestAnimationFrame(() => {
      setAnimationClass('slide-in');
      
      initialAnimationRef.current = setTimeout(() => {
        setAnimationClass('');
      }, 500);
    });
    
    // Cleanup function
    return () => {
      if (initialAnimationRef.current) clearTimeout(initialAnimationRef.current);
    };
  }, []);

  // Handle option click with sound effect
  const handleOptionClick = useCallback((option) => {
    // Play option select sound
    playSound('optionSelect');
    // Call the parent component's handler
    onOptionSelect(option);
  }, [onOptionSelect, playSound]);

  // Memoize the option button to prevent unnecessary re-renders
  const OptionButton = memo(({ option, index, isSelected, isCorrect, isIncorrect, disabled }) => {
    // Create a memoized click handler for each button to prevent re-renders
    const memoizedClickHandler = useCallback(() => {
      handleOptionClick(option);
    }, [option]);
    
    // Create a memoized hover handler for each button
    const memoizedHoverHandler = useCallback(() => {
      playSound('buttonHover');
    }, []);
    
    // Use refs to directly manipulate the DOM for class changes without re-rendering
    const buttonRef = useRef(null);
    
    // Update button classes directly via DOM to avoid re-renders
    useEffect(() => {
      if (buttonRef.current) {
        // Reset all state classes
        buttonRef.current.classList.remove('selected', 'correct', 'incorrect');
        
        // Apply current state classes
        if (isSelected) buttonRef.current.classList.add('selected');
        if (isCorrect) buttonRef.current.classList.add('correct');
        if (isIncorrect) buttonRef.current.classList.add('incorrect');
        
        // Update disabled state
        buttonRef.current.disabled = disabled;
      }
    }, [isSelected, isCorrect, isIncorrect, disabled]);
    
    return (
      <button
        ref={buttonRef}
        className="option-button"
        onClick={memoizedClickHandler}
        onMouseEnter={memoizedHoverHandler}
        disabled={disabled}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {option}
      </button>
    );
  }, (prevProps, nextProps) => {
    // Always return true in Discord mode to prevent re-renders completely
    // All updates are handled via direct DOM manipulation
    if (isInDiscord) return true;
    
    // In regular mode, only re-render if these specific props change
    return (
      prevProps.option === nextProps.option &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isCorrect === nextProps.isCorrect &&
      prevProps.isIncorrect === nextProps.isIncorrect &&
      prevProps.disabled === nextProps.disabled
    );
  });

  return (
    <div className={`animated-options-container ${animationClass}`}>
      {displayedOptions.map((option, index) => {
        const isSelected = selectedOption === option;
        const isCorrect = showNextButton && option === correctAnswer;
        const isIncorrect = showNextButton && isSelected && option !== correctAnswer;
        
        return (
          <OptionButton
            key={index}
            option={option}
            index={index}
            isSelected={isSelected}
            isCorrect={isCorrect}
            isIncorrect={isIncorrect}
            disabled={showNextButton}
          />
        );
      })}
    </div>
  );
});

export default AnimatedOptions;
