import React, { useState, useEffect, useRef } from 'react';
import './styles/LoadingScreen.css';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing');
  const [showContent, setShowContent] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipCategory, setTipCategory] = useState('lore');
  const [showTipNav, setShowTipNav] = useState(false);
  const animationFrameRef = useRef(null);
  const containerRef = useRef(null);
  
  // Loading messages to cycle through - more interesting and game-related
  const loadingMessages = [
    'Initializing game systems',
    'Loading Dofus lore database',
    'Summoning Osamodas creatures',
    'Brewing Eniripsa potions',
    'Consulting the Xelor timeline',
    'Gathering Ecaflip lucky coins',
    'Polishing Iop sword',
    'Tuning Pandawa bamboo flutes',
    'Preparing trivia challenges',
    'Calibrating difficulty levels',
    'Connecting to World of Twelve',
    'Almost ready'
  ];

  // Game tips organized by categories
  const tips = {
    lore: [
      'The twelve classes of Dofus are inspired by the twelve gods of the World of Twelve.',
      'The Dofus are dragon eggs with immense magical power.',
      'Ogrest Chaos flooded much of the World of Twelve.',
      'The Brotherhood of the Forgotten was founded by Dathura.',
      'Osamodas is the god of animal spirits and summoning.',
      'The Eliatropes and Dragons are cosmic siblings born from the same Dofus.',
      'The Sadida Kingdom is home to living plant creatures called Sadida Dolls.',
      'The Ecaflip god appears as a cat-like humanoid and governs games of chance.',
      'Rushu is the demon lord who rules over Shukrute, the demon dimension.',
      'The Sacrier class gains power through their own suffering and blood.'
    ],
    gameplay: [
      'Take your time to read questions carefully before answering!',
      'Some questions have multiple correct answers - choose the best one!',
      'Earn more points by answering questions quickly and accurately.',
      'Challenge yourself with different game modes to test your knowledge!',
      'The harder the difficulty, the more points you can earn per question.',
      'You can customize sound settings in the options menu.',
      'Try to achieve a streak of correct answers for bonus points!',
      'Each game mode has its own leaderboard to compete on.',
      'You can track your progress and stats in your player profile.',
      'Share your high scores with friends to challenge them!'
    ],
    trivia: [
      'The first Dofus game was released in 2004 by Ankama Games.',
      'Wakfu is set in the same universe as Dofus but 1000 years later.',
      'There are six primordial Dofus eggs, each with a different color.',
      'The Krosmoz is the name of the entire universe where Dofus takes place.',
      'Goultard is one of the most powerful characters in Dofus lore.',
      'The Xelor class manipulates time and is named after Xelor, the god of time.',
      'The animated series "Wakfu" expanded the lore of the Dofus universe.',
      'The Feca class specializes in protective shields and glyphs.',
      'The World of Twelve was originally called the World of Ten before two gods joined.',
      'Nox is a powerful Xelor who appears as the main antagonist in season 1 of Wakfu.'
    ]
  };
  
  // Add interactive particle effect
  useEffect(() => {
    if (!containerRef.current || !showContent) return;
    
    const container = containerRef.current;
    
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update CSS variables for interactive particles
      container.style.setProperty('--mouse-x', `${x}px`);
      container.style.setProperty('--mouse-y', `${y}px`);
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showContent]);
  
  // Smooth progress animation using requestAnimationFrame
  const animateProgress = (targetProgress, duration, startTime, startProgress) => {
    const now = performance.now();
    const elapsedTime = now - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Easing function for smoother animation
    const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentProgress = startProgress + (targetProgress - startProgress) * easedProgress;
    
    setProgress(currentProgress);
    
    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(() => 
        animateProgress(targetProgress, duration, startTime, startProgress)
      );
    } else if (targetProgress >= 100) {
      setLoadingText('Ready!');
      setTimeout(() => {
        setShowContent(false);
        setTimeout(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        }, 300);
      }, 500);
    }
  };
  
  // Show tip navigation after some progress
  useEffect(() => {
    if (progress > 40 && !showTipNav) {
      setShowTipNav(true);
    }
  }, [progress, showTipNav]);
  
  useEffect(() => {
    // Check if running in Discord
    const isInDiscord = window.location.href.includes('discord') || 
                        navigator.userAgent.includes('Discord') ||
                        window.innerWidth <= 600;
    
    // Loading phases with different durations
    const phases = [
      { target: 30, duration: isInDiscord ? 800 : 1200 },  // Initial phase
      { target: 60, duration: isInDiscord ? 700 : 1000 },  // Middle phase
      { target: 85, duration: isInDiscord ? 600 : 900 },   // Later phase
      { target: 100, duration: isInDiscord ? 500 : 800 }   // Final phase
    ];
    
    // Start the first phase
    const startPhase = (phaseIndex) => {
      if (phaseIndex >= phases.length) return;
      
      const phase = phases[phaseIndex];
      const startProgress = phaseIndex > 0 ? phases[phaseIndex - 1].target : 0;
      
      // Start the animation for this phase
      animationFrameRef.current = requestAnimationFrame(() => 
        animateProgress(phase.target, phase.duration, performance.now(), startProgress)
      );
      
      // Schedule the next phase
      setTimeout(() => {
        setLoadingPhase(phaseIndex + 1);
        startPhase(phaseIndex + 1);
      }, phase.duration);
    };
    
    // Start the loading sequence
    startPhase(0);
    
    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setLoadingText(prevText => {
        const currentIndex = loadingMessages.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, isInDiscord ? 800 : 1200);
    
    // Cycle through tips
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips[tipCategory].length);
    }, 5000);
    
    // Fallback to ensure loading completes
    const fallbackTimeout = setTimeout(() => {
      if (progress < 100) {
        console.log('Fallback: forcing loading completion');
        setProgress(100);
        setLoadingText('Ready!');
        setTimeout(() => {
          setShowContent(false);
          setTimeout(() => {
            if (onLoadingComplete) {
              onLoadingComplete();
            }
          }, 300);
        }, 500);
      }
    }, isInDiscord ? 4000 : 6000);
    
    return () => {
      clearInterval(messageInterval);
      clearInterval(tipInterval);
      clearTimeout(fallbackTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onLoadingComplete, loadingMessages, tips, tipCategory]);
  
  // Check if running in Discord for simpler rendering
  const isInDiscord = typeof window !== 'undefined' && (
    window.location.href.includes('discord') || 
    navigator.userAgent.includes('Discord') ||
    window.innerWidth <= 600
  );
  
  // Handle tip category change
  const handleCategoryChange = (category) => {
    setTipCategory(category);
    setTipIndex(0); // Reset to first tip in new category
  };
  
  return (
    <div 
      className={`loading-screen ${!showContent ? 'fade-out' : ''} ${isInDiscord ? 'discord-mode' : ''}`}
      ref={containerRef}
    >
      <div className="loading-content">
        <div className="loading-logo">
          <h1>Dofus Lore Trivia</h1>
          <div className="logo-glow"></div>
        </div>
        
        <div className="hexagon-container">
          {/* Interactive hexagons */}
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
        
        {/* Enhanced Game tip section with categories */}
        <div className="loading-tip">
          <div className="tip-header">
            <h3>Did you know?</h3>
            {showTipNav && (
              <div className="tip-categories">
                <button 
                  className={tipCategory === 'lore' ? 'active' : ''}
                  onClick={() => handleCategoryChange('lore')}
                >
                  Lore
                </button>
                <button 
                  className={tipCategory === 'gameplay' ? 'active' : ''}
                  onClick={() => handleCategoryChange('gameplay')}
                >
                  Gameplay
                </button>
                <button 
                  className={tipCategory === 'trivia' ? 'active' : ''}
                  onClick={() => handleCategoryChange('trivia')}
                >
                  Trivia
                </button>
              </div>
            )}
          </div>
          <div className="tip-content">
            <p>{tips[tipCategory][tipIndex]}</p>
            <div className="tip-pagination">
              {tips[tipCategory].map((_, i) => (
                <span 
                  key={i} 
                  className={`tip-dot ${i === tipIndex ? 'active' : ''}`}
                ></span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Interactive particles */}
        <div className="loading-particles">
          {/* Static background particles */}
          {[...Array(isInDiscord ? 10 : 20)].map((_, index) => (
            <div 
              key={index} 
              className="particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.2 + (Math.random() * 0.3)
              }}
            ></div>
          ))}
          
          {/* Interactive mouse-following particles */}
          {!isInDiscord && (
            <div className="interactive-particles">
              {[...Array(6)].map((_, index) => (
                <div 
                  key={`interactive-${index}`} 
                  className="interactive-particle"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
        
        {/* Loading progress bar at bottom */}
        <div className="loading-progress-bar">
          <div 
            className="loading-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
