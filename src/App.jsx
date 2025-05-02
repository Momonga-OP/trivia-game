import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './components/styles/App.css';
import BackgroundAnimation from './components/BackgroundAnimation';
import discordService from './services/DiscordService';
import playerDataService from './services/PlayerDataService';
import soundService from './services/SoundService';
import { SoundProvider } from './contexts/SoundContext';
import LoadingScreen from './components/LoadingScreen';

// Import components
import HomePage from './components/HomePage';
import GameScreen from './components/GameScreen';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Credits from './components/Credits';
import Header from './components/Header';
import HowToPlay from './components/HowToPlay';
import DiscordCallback from './components/DiscordCallback';

// Main App component that handles routing and viewport adjustments
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [isInGame, setIsInGame] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [discordStatus, setDiscordStatus] = useState('disconnected');
  const [isLoading, setIsLoading] = useState(true);

  
  // Initialize player data, check Discord login status, and initialize sounds
  useEffect(() => {
    // Load player data
    const player = playerDataService.getCurrentPlayer();
    setPlayerData(player);
    
    // Check Discord login status
    if (discordService.isLoggedIn()) {
      setDiscordStatus('connected');
    }
    
    // Initialize sound service
    soundService.initialize().then(() => {
      console.log('Sound service initialized in App component');
    }).catch(error => {
      console.error('Failed to initialize sound service:', error);
    });
    
    // Safety timeout to ensure loading screen doesn't get stuck
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 8000); // Force exit loading after 8 seconds max
    
    return () => clearTimeout(safetyTimeout);
  }, []);





  // Track viewport size changes
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation handler
  const navigateTo = (page) => {
    // If player is in game and trying to navigate away
    if (isInGame && page !== 'game') {
      setPendingNavigation(page);
      setShowExitConfirmation(true);
      return;
    }
    
    // Play navigation sound - different sound for each page
    switch(page) {
      case 'game':
        soundService.play('primaryButton');
        break;
      case 'home':
        soundService.play('primaryButton');
        break;
      case 'dashboard':
        soundService.play('secondaryButton');
        break;
      case 'about':
      case 'credits':
      case 'howtoplay':
        soundService.play('buttonClick');
        break;
      default:
        soundService.play('buttonClick');
    }
    
    // If not in game or confirmed navigation
    setCurrentPage(page);
    
    // Set game state when entering or leaving game
    if (page === 'game') {
      setIsInGame(true);
      setScore(0);
      setTotalAnswered(0);
      // Play game start sound
      soundService.play('gameStart');
    } else if (page !== 'game') {
      setIsInGame(false);
    }
    
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  // Handle confirmation response
  const handleConfirmNavigation = (confirmed) => {
    setShowExitConfirmation(false);
    
    // Play sound based on user choice
    if (confirmed) {
      soundService.play('buttonClick');
      if (pendingNavigation) {
        setCurrentPage(pendingNavigation);
        setIsInGame(false);
        soundService.play('gameEnd');
      }
    } else {
      soundService.play('buttonHover');
    }
    
    setPendingNavigation(null);
  };

  // Handle volume change for sound effects
  const handleVolumeChange = (type, value) => {
    if (type === 'volume') {
      soundService.setVolume(value / 100);
    } else if (type === 'mute') {
      soundService.setMuted(value);
    }
  };

  // Render the appropriate page based on state
  return (
    <Router>
      <SoundProvider>
        {isLoading ? (
          <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
        ) : (
          <div className="app-container">
        {/* Background Animation */}
        <BackgroundAnimation />
        
        {/* Routes */}
        <Routes>
          {/* Discord OAuth Callback Route */}
          <Route path="/auth/discord/callback" element={<DiscordCallback />} />
          
          {/* Main App Routes */}
          <Route path="/*" element={
            <>
              {/* Header with navigation */}
              <Header 
                navigateTo={navigateTo} 
                currentPage={currentPage} 
                isInGame={isInGame}
                playerData={playerData}
              />
              

              
              {/* Exit confirmation dialog */}
              {showExitConfirmation && (
                <div className="confirmation-overlay">
                  <div className="confirmation-dialog">
                    <h3>Exit Game?</h3>
                    <p>You will lose your current progress if you leave the game.</p>
                    <div className="confirmation-buttons">
                      <button 
                        className="cancel-button" 
                        onClick={() => handleConfirmNavigation(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="confirm-button" 
                        onClick={() => handleConfirmNavigation(true)}
                      >
                        Exit Anyway
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Main content area */}
              <main className="main-content">
                {currentPage === 'home' && (
                  <HomePage 
                    navigateTo={navigateTo} 
                    windowSize={windowSize} 
                    playerData={playerData}
                  />
                )}
                {currentPage === 'game' && (
                  <GameScreen 
                    navigateTo={navigateTo} 
                    score={score} 
                    setScore={setScore}
                    totalAnswered={totalAnswered}
                    setTotalAnswered={setTotalAnswered}
                    windowSize={windowSize}
                    playerData={playerData}
                  />
                )}
                {currentPage === 'dashboard' && (
                  <Dashboard 
                    navigateTo={navigateTo} 
                    score={score} 
                    totalAnswered={totalAnswered}
                    windowSize={windowSize}
                    playerData={playerData}
                  />
                )}
                {currentPage === 'about' && (
                  <About navigateTo={navigateTo} windowSize={windowSize} />
                )}
                {currentPage === 'credits' && (
                  <Credits navigateTo={navigateTo} windowSize={windowSize} />
                )}
                {currentPage === 'howtoplay' && (
                  <HowToPlay navigateTo={navigateTo} windowSize={windowSize} />
                )}
              </main>
              
              {/* Discord connection badge */}
              {discordStatus === 'connected' && (
                <div className="discord-badge">
                  <i className="fab fa-discord"></i> Connected
                </div>
              )}
            </>
          } />
        </Routes>
          </div>
        )}
      </SoundProvider>
    </Router>
  );
}

export default App;
