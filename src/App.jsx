import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './components/styles/App.css';
import backgroundMusic from './sounds/background.mp3';
import BackgroundAnimation from './components/BackgroundAnimation';
import discordService from './services/DiscordService';
import playerDataService from './services/PlayerDataService';

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
  const [isMuted, setIsMuted] = useState(false);
  const [isInGame, setIsInGame] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [discordStatus, setDiscordStatus] = useState('disconnected');
  const audioRef = useRef(null);
  
  // Initialize player data and check Discord login status
  useEffect(() => {
    // Load player data
    const player = playerDataService.getCurrentPlayer();
    setPlayerData(player);
    
    // Check Discord login status
    if (discordService.isLoggedIn()) {
      setDiscordStatus('connected');
    }
  }, []);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(backgroundMusic);
    audioRef.current.loop = true;
    
    // Try to play audio (may require user interaction on some browsers)
    const handleFirstInteraction = () => {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  // Handle mute toggle
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [isMuted]);

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
    
    // If not in game or confirmed navigation
    setCurrentPage(page);
    
    // Set game state when entering or leaving game
    if (page === 'game') {
      setIsInGame(true);
      setScore(0);
      setTotalAnswered(0);
    } else if (page !== 'game') {
      setIsInGame(false);
    }
    
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  // Handle confirmation response
  const handleConfirmNavigation = (confirmed) => {
    setShowExitConfirmation(false);
    
    if (confirmed && pendingNavigation) {
      setCurrentPage(pendingNavigation);
      setIsInGame(false);
    }
    
    setPendingNavigation(null);
  };

  // Handle music volume change
  const handleVolumeChange = (volume) => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  };

  // Render the appropriate page based on state
  return (
    <Router>
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
                onVolumeChange={handleVolumeChange}
                isInGame={isInGame}
                playerData={playerData}
              />
              
              {/* Mute button in the top right corner */}
              <button 
                className="mute-button"
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
              </button>
              
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
    </Router>
  );
}

export default App;
