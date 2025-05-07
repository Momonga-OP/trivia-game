import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './components/styles/App.css';
import './components/styles/discord-compatibility.css';
import './components/styles/discord-audio.css';
import './components/styles/discord-optimization.css';
import { SoundProvider } from './contexts/SoundContext.jsx';
import BackgroundAnimation from './components/BackgroundAnimation';
import discordService from './services/DiscordService';
import playerDataService from './services/PlayerDataService';
import soundService from './services/SoundService';
import musicService from './services/MusicService';
import richPresenceService from './services/RichPresenceService';
import LoadingScreen from './components/LoadingScreen';
import NoiseTexture from './components/NoiseTexture';
import ParticipantsList from './components/ParticipantsList';
import VoiceParticipants from './components/VoiceParticipants';
import DiscordProfilePicture from './components/DiscordProfilePicture';

// Import components
import HomePage from './components/HomePage';
import GameScreen from './components/GameScreen';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Credits from './components/Credits';
import Header from './components/Header';
import HowToPlay from './components/HowToPlay';
import Lore from './components/Lore';
import DiscordCallback from './components/DiscordCallback';

// Main App component that handles routing and viewport adjustments
function App({ discordStatus = 'disconnected', discordParticipants = [] }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [gameType, setGameType] = useState('dofus');
  const [questionCount, setQuestionCount] = useState(40); // Default to 40 questions
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [isInGame, setIsInGame] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showVoiceParticipants, setShowVoiceParticipants] = useState(false);
  const [sharedGameState, setSharedGameState] = useState(null);
  
  // Check if running in Discord environment
  const isInDiscord = useMemo(() => {
    return discordStatus !== 'disconnected' && discordStatus !== 'failed';
  }, [discordStatus]);

  // Initialize player data, check Discord login status, and initialize sounds
  useEffect(() => {
    // Load player data
    const player = playerDataService.getCurrentPlayer();
    setPlayerData(player);
    
    // Check Discord login status
    if (discordService.isLoggedIn()) {
      // If we're in Discord, update player data with Discord user info
      if (isInDiscord && discordService.getCurrentUser()) {
        const discordUser = discordService.getCurrentUser();
        const updatedPlayer = {
          ...player,
          name: discordUser.username,
          avatar: discordUser.avatarUrl,
          id: discordUser.id
        };
        playerDataService.updatePlayer(updatedPlayer);
        setPlayerData(updatedPlayer);
      }
    }
    
    // Initialize sound service with Discord-specific optimizations
    soundService.init(isInDiscord);
    
    // Initialize music service and start playing background music
    musicService.init(isInDiscord);
    musicService.playBackgroundMusic('main');
    
    // Initialize Rich Presence service
    try {
      richPresenceService.init(isInDiscord);
    } catch (error) {
      console.warn('Failed to initialize Rich Presence service:', error);
    }
    
    // Safety timeout to ensure loading screen doesn't get stuck
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Reduced from 8000 to 3000ms
    
    // Set up event listener for user interaction to enable autoplay
    const handleInteraction = () => {
      musicService.handleUserInteraction();
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      clearTimeout(safetyTimeout);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      musicService.stopBackgroundMusic();
    };
  }, [isInDiscord]);

  // Track Discord participants
  useEffect(() => {
    if (discordParticipants.length > 0) {
      console.log('Discord participants updated:', discordParticipants);
    }
  }, [discordParticipants]);

  // Set up game state sharing for multiplayer
  useEffect(() => {
    if (!isInDiscord) return;
    
    // Listen for game state updates from other participants
    discordService.onGameStateUpdate((state) => {
      if (state && state.gameType === gameType) {
        setSharedGameState(state);
      }
    });
  }, [isInDiscord, gameType]);

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
    
    // Set question count if provided
    if (options.questionCount) {
      setQuestionCount(options.questionCount);
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
        soundService.play('buttonClick');
        break;
      default:
        soundService.play('buttonClick');
    }
    
    // If not in game or confirmed navigation
    setCurrentPage(page);
    
    // Update background music based on screen without interrupting playback
    if (page === 'game') {
      musicService.changeTheme('game');
    } else if (page === 'dashboard') {
      musicService.changeTheme('results');
    } else {
      musicService.changeTheme('main');
    }
    
    // Set game state when entering or leaving game
    if (page === 'game') {
      setIsInGame(true);
      setScore(0);
      setTotalAnswered(0);
    } else {
      setIsInGame(false);
    }
  }, [isInGame]);

  // Handle confirmation for exiting game
  const handleConfirmNavigation = useCallback((confirmed) => {
    soundService.play('buttonClick');
    setShowExitConfirmation(false);
    
    if (confirmed && pendingNavigation) {
      setIsInGame(false);
      navigateTo(pendingNavigation);
    }
    
    setPendingNavigation(null);
  }, [navigateTo, pendingNavigation]);

  // Toggle participants list
  const toggleParticipants = useCallback(() => {
    soundService.play('buttonClick');
    setShowParticipants(prev => !prev);
    setShowVoiceParticipants(false);
  }, []);

  // Toggle voice participants list
  const toggleVoiceParticipants = useCallback(() => {
    soundService.play('buttonClick');
    setShowVoiceParticipants(prev => !prev);
    setShowParticipants(false);
  }, []);

  // Update shared game state for multiplayer
  const updateSharedGameState = useCallback((gameState) => {
    if (!isInDiscord) return;
    
    // Add host info and timestamp
    gameState = {
      ...gameState,
      gameType,
      hostId: playerData?.id,
      timestamp: Date.now()
    };
    
    discordService.shareGameState(gameState);
  }, [isInDiscord, gameType, playerData]);

  // Render the appropriate page based on state
  return (
    <SoundProvider>
      <Router>
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <div className="app-container">
            <NoiseTexture />
            <div className="animated-bg"></div>
            {/* Background Animation */}
            <BackgroundAnimation isInDiscord={isInDiscord} />
            
            {/* Routes */}
            <Routes>
              {/* Discord OAuth Callback Route */}
              <Route path="/auth/discord/callback" element={
                <DiscordCallback 
                  onSuccess={() => {
                    console.log('Discord authentication successful');
                    // Update player data with Discord user info
                    if (discordService.getCurrentUser()) {
                      const discordUser = discordService.getCurrentUser();
                      const updatedPlayer = {
                        ...playerData,
                        name: discordUser.username,
                        avatar: discordUser.avatarUrl,
                        id: discordUser.id
                      };
                      playerDataService.updatePlayer(updatedPlayer);
                      setPlayerData(updatedPlayer);
                    }
                  }}
                  onError={(error) => {
                    console.error('Discord authentication error:', error);
                  }}
                />
              } />
              
              {/* Main App Routes */}
              <Route path="/*" element={
                <>
                  {/* Header with navigation */}
                  <Header 
                    navigateTo={navigateTo} 
                    currentPage={currentPage} 
                    isInGame={isInGame}
                    playerData={playerData}
                    isInDiscord={isInDiscord}
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
                        isInDiscord={isInDiscord}
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
                        questionCount={questionCount}
                        isInDiscord={isInDiscord}
                        discordParticipants={discordParticipants}
                        sharedGameState={sharedGameState}
                        updateSharedGameState={updateSharedGameState}
                      />
                    )}
                    {currentPage === 'dashboard' && (
                      <Dashboard 
                        navigateTo={navigateTo} 
                        score={score} 
                        totalAnswered={totalAnswered}
                        windowSize={windowSize}
                        playerData={playerData}
                        isInDiscord={isInDiscord}
                      />
                    )}
                    {currentPage === 'about' && (
                      <About navigateTo={navigateTo} windowSize={windowSize} isInDiscord={isInDiscord} />
                    )}
                    {currentPage === 'credits' && (
                      <Credits 
                        navigateTo={navigateTo} 
                        windowSize={windowSize} 
                        isInDiscord={isInDiscord} 
                        playerData={playerData}
                      />
                    )}
                    {currentPage === 'howtoplay' && (
                      <HowToPlay navigateTo={navigateTo} windowSize={windowSize} isInDiscord={isInDiscord} />
                    )}
                    {currentPage === 'lore' && (
                      <Lore navigateTo={navigateTo} windowSize={windowSize} isInDiscord={isInDiscord} />
                    )}
                  </main>
                  
                  {/* Discord UI elements container */}
                  <div className="discord-ui-container">
                    {/* Discord status indicators */}
                    {isInDiscord && (
                      <>
                        <div 
                          className="discord-badge" 
                          aria-label="Discord connection status"
                          onClick={toggleParticipants}
                          title="Discord Participants"
                        >
                          <i className="fab fa-discord" aria-hidden="true"></i>
                          {discordParticipants.length > 0 && (
                            <span className="participant-count">{discordParticipants.length}</span>
                          )}
                        </div>
                        
                        {/* Voice channel button - separate from Discord badge */}
                        <div 
                          className="discord-badge voice-button" 
                          onClick={toggleVoiceParticipants}
                          title="Voice Channel"
                          style={{ top: '5px', right: '30px' }}
                        >
                          <i className="fas fa-microphone" aria-hidden="true"></i>
                        </div>
                        
                        {/* Participants list */}
                        {showParticipants && discordParticipants.length > 0 && (
                          <ParticipantsList 
                            participants={discordParticipants} 
                            onClose={() => setShowParticipants(false)} 
                          />
                        )}
                        
                        {/* Voice participants list */}
                        {showVoiceParticipants && (
                          <VoiceParticipants 
                            isInDiscord={isInDiscord}
                            onClose={() => setShowVoiceParticipants(false)}
                          />
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Discord Profile Picture Component */}
                  {isInDiscord && (
                    <div className="discord-profile-picture-wrapper">
                      <DiscordProfilePicture />
                    </div>
                  )}
                </>
              } />
            </Routes>
          </div>
        )}
      </Router>
    </SoundProvider>
  );
}

export default App;
