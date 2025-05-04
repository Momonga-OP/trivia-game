import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import './styles/LoadingScreen.css';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing');
  const [showContent, setShowContent] = useState(true);
  const [didYouKnowIndex, setDidYouKnowIndex] = useState(0);
  
  // Loading messages to cycle through
  const loadingMessages = [
    'Initializing',
    'Loading game assets',
    'Preparing trivia questions',
    'Connecting to World of Twelve',
    'Calibrating knowledge systems',
    'Almost ready'
  ];
  
  // Did You Know facts about Dofus
  const didYouKnowFacts = [
    "The name 'Dofus' comes from the dragon eggs that contain immense power in the game universe.",
    "The World of Twelve is named after the 12 main gods in the game.",
    "Ankama, the company behind Dofus, also created the animated series Wakfu.",
    "Dofus was first released in 2004 and has been running for over 20 years.",
    "The Brotherhood of the Tofu is the main group of heroes in the Dofus/Wakfu universe.",
    "Ogrest's Chaos was caused by the character Ogrest crying an ocean of tears.",
    "The Eliatropes were the first civilization in the World of Twelve.",
    "Each of the 12 main classes in Dofus is associated with one of the gods.",
    "The Dofus are six primordial dragon eggs with immense magical power.",
    "The timeline of the World of Twelve spans thousands of years of history.",
    "The Krosmoz is the name of the entire universe where Dofus takes place.",
    "Ecaflips are cat-like beings who love gambling and games of chance."
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
    
    // Cycle through Did You Know facts
    const factInterval = setInterval(() => {
      setDidYouKnowIndex(prevIndex => (prevIndex + 1) % didYouKnowFacts.length);
    }, isInDiscord ? 3000 : 5000);
    
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
      clearInterval(factInterval);
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
        
        {/* Did You Know card */}
        <div className="did-you-know-card">
          <div className="did-you-know-header">
            <FontAwesomeIcon icon={faLightbulb} className="lightbulb-icon" />
            <h3>Did You Know?</h3>
          </div>
          <p>{didYouKnowFacts[didYouKnowIndex]}</p>
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
