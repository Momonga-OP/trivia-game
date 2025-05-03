import React, { useState, useEffect } from 'react';
import './styles/AnimatedOptions.css';
import { useSound } from '../contexts/SoundContext.jsx';

function AnimatedOptions({ options, selectedOption, correctAnswer, showNextButton, onOptionSelect, questionId }) {
  const { playSound } = useSound();
  const [animationClass, setAnimationClass] = useState('');
  const [displayedOptions, setDisplayedOptions] = useState(options);
  
  // Handle options changes with slide animation
  useEffect(() => {
    if (options !== displayedOptions) {
      // Slide out current options
      setAnimationClass('slide-out');
      
      // After slide out animation, update options and slide in
      const timer = setTimeout(() => {
        setDisplayedOptions(options);
        setAnimationClass('slide-in');
        
        // Reset animation class after slide in completes
        const resetTimer = setTimeout(() => {
          setAnimationClass('');
        }, 500);
        
        return () => clearTimeout(resetTimer);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [options, displayedOptions]);
  
  // Initial animation when component mounts
  useEffect(() => {
    setAnimationClass('slide-in');
    
    const timer = setTimeout(() => {
      setAnimationClass('');
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`animated-options-container ${animationClass}`}>
      {displayedOptions.map((option, index) => (
        <button
          key={index}
          className={`option-button ${selectedOption === option ? 'selected' : ''} 
            ${showNextButton && option === correctAnswer ? 'correct' : ''}
            ${showNextButton && selectedOption === option && option !== correctAnswer ? 'incorrect' : ''}`}
          onClick={() => onOptionSelect(option)}
          onMouseEnter={() => playSound('buttonHover')}
          disabled={showNextButton}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default AnimatedOptions;
