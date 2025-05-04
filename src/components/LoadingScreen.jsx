import React, { useState, useEffect } from 'react';
import './styles/LoadingScreen.css';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing');
  const [showContent, setShowContent] = useState(true);
  
  // Loading messages to cycle through
  const loadingMessages = [
    'Initializing',
    'Loading game assets',
    'Preparing trivia questions',
    'Connecting to World of Twelve',
    'Calibrating knowledge systems',
    'Almost ready'
  ];
  
  useEffect(() => {
    // Check if running in Discord
    const isInDiscord = window.location.href.includes('discord') || 
                        navigator.userAgent.includes('Discord') ||
                        window.innerWidth <= 600;
    
    // Shorter loading for Discord and faster overall
    const loadingDuration = isInDiscord ? 2000 : 3000;
    const progressStep = isInDiscord ? 15 : 8;
    const messageInterval = isInDiscord ? 800 : 1200;
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + (Math.random() * progressStep);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 80);
    
    // Cycle through loading messages
    const textInterval = setInterval(() => {
      setLoadingText(prevText => {
        const currentIndex = loadingMessages.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, messageInterval);
    
    // Ensure we reach 100% before completing
    const ensureProgressTimeout = setTimeout(() => {
      setProgress(100);
    }, loadingDuration - 500);
    
    // Complete loading after animation
    const completeTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      setProgress(100);
      setLoadingText('Ready!');
      
      // Fade out animation - faster in Discord
      const fadeTimeout = setTimeout(() => {
        setShowContent(false);
        
        // Notify parent component that loading is complete
        const completeCallback = setTimeout(() => {
          if (onLoadingComplete) {
            console.log('Loading complete, triggering callback');
            onLoadingComplete();
          }
        }, isInDiscord ? 200 : 300);
        
        return () => clearTimeout(completeCallback);
      }, isInDiscord ? 300 : 500);
      
      return () => clearTimeout(fadeTimeout);
    }, loadingDuration);
    
    // Direct callback as a fallback
    const directCallbackTimeout = setTimeout(() => {
      if (onLoadingComplete) {
        console.log('Direct callback triggered as fallback');
        onLoadingComplete();
      }
    }, loadingDuration + 2000); // 2 seconds after expected completion
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      clearTimeout(ensureProgressTimeout);
      clearTimeout(completeTimeout);
      clearTimeout(directCallbackTimeout);
    };
  }, [onLoadingComplete, loadingMessages]);
  
  // Check if running in Discord for simpler rendering
  const isInDiscord = typeof window !== 'undefined' && (
    window.location.href.includes('discord') || 
    navigator.userAgent.includes('Discord') ||
    window.innerWidth <= 600
  );
  
  return (
    <div className={`loading-screen ${!showContent ? 'fade-out' : ''} ${isInDiscord ? 'discord-mode' : ''}`}>
      <div className="loading-content">
        <div className="loading-logo">
          <h1>Dofus Lore Trivia</h1>
          <div className="logo-glow"></div>
        </div>
        
        <div className="hexagon-container">
          {/* Reduced hexagons for Discord */}
          {[...Array(isInDiscord ? 6 : 12)].map((_, index) => (
            <div 
              key={index} 
              className="hexagon"
              style={{
                animationDelay: `${index * 0.2}s`,
                opacity: Math.min(1, progress / (100 - index * 5))
              }}
            ></div>
          ))}
          
          {/* Central loading circle */}
          <div className="loading-circle">
            <svg viewBox="0 0 100 100">
              <circle className="loading-circle-bg" cx="50" cy="50" r="40" />
              <circle 
                className="loading-circle-progress" 
                cx="50" 
                cy="50" 
                r="40" 
                strokeDashoffset={252 - (252 * progress) / 100}
              />
            </svg>
            <div className="loading-percentage">{Math.floor(progress)}%</div>
          </div>
        </div>
        
        <div className="loading-text">
          <p>{loadingText}</p>
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
        
        {/* Reduced particles for Discord */}
        {!isInDiscord && (
          <div className="loading-particles">
            {[...Array(12)].map((_, index) => (
              <div 
                key={index} 
                className="particle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
