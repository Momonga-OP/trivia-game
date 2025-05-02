import React, { useState, useEffect } from 'react';
import './styles/CountdownAnimation.css';

function CountdownAnimation({ onComplete }) {
  const [count, setCount] = useState(3);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // Start with "Ready?" text
    const readyTimeout = setTimeout(() => {
      // Then start the countdown
      setAnimationClass('animate-out');
      
      const countdownInterval = setInterval(() => {
        setCount(prevCount => {
          if (prevCount <= 1) {
            clearInterval(countdownInterval);
            
            // After countdown finishes, show "Go!" and then complete
            setTimeout(() => {
              setAnimationClass('animate-out');
              setTimeout(() => {
                if (onComplete) onComplete();
              }, 500);
            }, 800);
            
            return "Go!";
          }
          setAnimationClass('');
          setTimeout(() => {
            setAnimationClass('animate-out');
          }, 800);
          return prevCount - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(countdownInterval);
        clearTimeout(readyTimeout);
      };
    }, 1000);
    
    return () => clearTimeout(readyTimeout);
  }, [onComplete]);

  return (
    <div className="countdown-container">
      <div className="countdown-overlay"></div>
      <div className={`countdown-number ${animationClass}`}>
        {count === 3 ? "Ready?" : count}
      </div>
    </div>
  );
}

export default CountdownAnimation;
