import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './components/styles/App.css';
import './components/styles/discord-compatibility.css';
import { SoundProvider } from './contexts/SoundContext.jsx';
import { DiscordAuthProvider } from './contexts/DiscordAuthContext.jsx';
import BackgroundAnimation from './components/BackgroundAnimation';
import playerDataService from './services/PlayerDataService';
import soundService from './services/SoundService';
import LoadingScreen from './components/LoadingScreen';
import NoiseTexture from './components/NoiseTexture';

// Import components
import HomePage from './components/HomePage';
import GameScreen from './components/GameScreen';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Credits from './components/Credits';
import Header from './components/Header';
import HowToPlay from './components/HowToPlay';
import Lore from './components/Lore';
import UserProfile from './components/UserProfile';
import DiscordCallback from './components/DiscordCallback';

// Main App component that handles routing and viewport adjustments
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [gameType, setGameType] = useState('dofus');
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [isInGame, setIsInGame] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize player data and sounds
  useEffect(() => {
    // Simulate resource loading with a minimum display time for the loading screen
    const loadResources = async () => {
      try {
        // Load player data
        const player = playerDataService.getCurrentPlayer();
        setPlayerData(player);
        
        // Initialize sound service
        await soundService.initialize();
        console.log('Sound service initialized in App component');
        
        // Ensure loading screen shows for at least 3 seconds (better user experience)
        const minLoadingTime = 3000;
        const startTime = performance.now();
        const elapsedTime = performance.now() - startTime;
        
        if (elapsedTime < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
        }
        
        // Transition to main content
        setIsLoading(false);
      } catch (error) {
        console.error('Error during initialization:', error);
        // Even on error, we should still show the app after a timeout
        setIsLoading(false);
      }
    };
    
    loadResources();
    
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

  // Navigation handler - optimized with useCallback
  const navigateTo = useCallback((page, options = {}) => {
    // Set game type if provided
    if (options.gameType) {
      setGameType(options.gameType);
    }
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
      case 'lore':
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
  }, [isInGame]);
  
  // Handle confirmation response - optimized with useCallback
  const handleConfirmNavigation = useCallback((confirmed) => {
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
  }, [pendingNavigation]);

  // Handle volume change for sound effects - optimized with useCallback
  const handleVolumeChange = useCallback((type, value) => {
    if (type === 'volume') {
      soundService.setVolume(value / 100);
    } else if (type === 'mute') {
      soundService.setMuted(value);
    }
  }, []);

  // Render the appropriate page based on state
  return (
    <SoundProvider>
      <DiscordAuthProvider>
        <Router>
          <div className="app-container">
            {/* Background elements */}
            <BackgroundAnimation />
            <NoiseTexture opacity={0.05} />
            
            {/* Loading screen */}
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <Routes>
                {/* Discord OAuth Callback Route */}
                <Route path="/discord/callback" element={<DiscordCallback />} />
                
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
                    
                    {/* User Profile - Discord Account Linking */}
                    <div className="user-profile-container">
                      <UserProfile />
                    </div>
                    
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
                          gameType={gameType}
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
                      {currentPage === 'lore' && (
                        <Lore navigateTo={navigateTo} windowSize={windowSize} />
                      )}
                    </main>
                  </>
                } />
              </Routes>
            )}
          </div>
        </Router>
      </DiscordAuthProvider>
    </SoundProvider>
  );
}

// Export App component
export default App;
