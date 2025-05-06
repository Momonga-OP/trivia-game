import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import './styles/LoadingScreen.css';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing');
  const [showContent, setShowContent] = useState(true);
  const [didYouKnowIndex, setDidYouKnowIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const requestRef = useRef();
  
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
  
  // Dofus eggs data
  const dofusEggs = [
    { name: "Emerald Dofus", color: "#2ecc71", power: "Time", image: "/assets/eggs/emerald-dofus.svg" },
    { name: "Crimson Dofus", color: "#e74c3c", power: "Fire", image: "/assets/eggs/crimson-dofus.svg" },
    { name: "Turquoise Dofus", color: "#1abc9c", power: "Water", image: "/assets/eggs/turquoise-dofus.svg" },
    { name: "Ivory Dofus", color: "#ecf0f1", power: "Life", image: "/assets/eggs/ivory-dofus.svg" },
    { name: "Ochre Dofus", color: "#f39c12", power: "Earth", image: "/assets/eggs/ochre-dofus.svg" },
    { name: "Abyssal Dofus", color: "#34495e", power: "Shadow", image: "/assets/eggs/abyssal-dofus.svg" }
  ];

  // Animation loop for rotating eggs
  const animate = () => {
    setRotationAngle(prevAngle => (prevAngle + 0.2) % 360);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    // Check if running in Discord
    const isInDiscord = window.location.href.includes('discord') || 
      navigator.userAgent.includes('DiscordApp');
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prevProgress => {
        // Make progress more consistent and ensure it reaches 100%
        const increment = Math.random() * 2 + 0.5; // Between 0.5 and 2.5
        const newProgress = prevProgress + increment;
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
    }, isInDiscord ? 1500 : 2500);
    
    // Cycle through facts
    const factInterval = setInterval(() => {
      setDidYouKnowIndex(prevIndex => (prevIndex + 1) % didYouKnowFacts.length);
    }, isInDiscord ? 3000 : 5000);
    
    // Ensure we reach 100% before completing
    const ensureProgressTimeout = setTimeout(() => {
      setProgress(100);
    }, 7000); // Force 100% after 7 seconds
    
    // Fade out and call onLoadingComplete
    const completeTimeout = setTimeout(() => {
      if (progress >= 95) {
        setShowContent(false);
        
        // Call onLoadingComplete after fade out animation
        setTimeout(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        }, 500);
      }
    }, 7500);
    
    // Safety fallback in case something goes wrong
    const directCallbackTimeout = setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 10000); // Force callback after 10 seconds max
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      clearInterval(factInterval);
      clearTimeout(ensureProgressTimeout);
      clearTimeout(completeTimeout);
      clearTimeout(directCallbackTimeout);
      cancelAnimationFrame(requestRef.current);
    };
  }, [onLoadingComplete, progress]);
  
  // Check if running in Discord for simpler rendering
  const isInDiscord = typeof window !== 'undefined' && (
    window.location.href.includes('discord') || 
    navigator.userAgent.includes('DiscordApp') ||
    window.innerWidth <= 600
  );
  
  return (
    <div className={`loading-screen ${!showContent ? 'fade-out' : ''} ${isInDiscord ? 'discord-mode' : ''}`}>
      <div className="loading-content">
        <div className="loading-logo">
          <h1>DOFUS LORE TRIVIA</h1>
          <div className="logo-glow"></div>
        </div>
        
        {/* Dofus Eggs Rotating Circle */}
        <div className="dofus-eggs-container">
          {dofusEggs.map((egg, index) => {
            const angle = (index * (360 / dofusEggs.length) + rotationAngle) * (Math.PI / 180);
            const radius = 100; // Radius of the circle
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <div 
                key={index}
                className="dofus-egg"
                style={{ 
                  transform: `translate(${x}px, ${y}px) rotate(${rotationAngle}deg)`,
                  backgroundColor: egg.color,
                }}
                title={`${egg.name}: ${egg.power}`}
              >
                <div 
                  className="egg-image"
                  style={{ 
                    backgroundImage: `url(${egg.image})`,
                    transform: `rotate(${-rotationAngle}deg)` // Counter-rotate to keep image upright
                  }}
                ></div>
              </div>
            );
          })}
          
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
        <div className="loading-particles">
          {[...Array(isInDiscord ? 20 : 50)].map((_, index) => (
            <div 
              key={index}
              className="particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
