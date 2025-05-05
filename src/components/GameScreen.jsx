import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { questions } from '../questionsData.js';
import { questionsDofusTouch } from '../QuestionDofustouch.js';
import CountdownAnimation from './CountdownAnimation';
import QuestionOverlay from './QuestionOverlay';
import AnimatedOptions from './AnimatedOptions';
import ResultsModal from './ResultsModal';
import { useSound } from '../contexts/SoundContext.jsx';
import richPresenceService from '../services/RichPresenceService';
import { isInDiscord, optimizeForDiscord, enhanceIconsForDiscord } from '../utils/DiscordUtils';
import './styles/GameScreen.css';
import './styles/DiscordMode.css';

// Utility function to shuffle an array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Memoized GameScreen component to prevent unnecessary re-renders
const GameScreen = memo(function GameScreen({ navigateTo, score, setScore, totalAnswered, setTotalAnswered, gameType, isInDiscord, updateSharedGameState }) {
  const [showResults, setShowResults] = useState(false);
  // Set the game type to 'dofus' by default if not provided
  const currentGameType = gameType || 'dofus';
  const { playSound } = useSound();
  // Create shuffled questions array on game start
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const [bgIndex, setBgIndex] = useState(Math.floor(Math.random() * 5) + 1);
  const [showCountdown, setShowCountdown] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  // Detect if running in Discord
  const [inDiscordEnv, setInDiscordEnv] = useState(isInDiscord || false);

  // Shuffle questions when component mounts based on game type
  useEffect(() => {
    // Select the appropriate question set based on game type
    const questionSet = currentGameType === 'dofusTouch' ? questionsDofusTouch : questions;
    const shuffled = [...questionSet].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, [currentGameType]);

  // Handle countdown completion - optimized with useCallback
  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setShowQuestion(true);
    setGameStarted(true);
    setStartTime(Date.now());
  }, []);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  // Shuffle options whenever the current question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.options) {
      // Create a copy of the options array and shuffle it
      const options = [...currentQuestion.options];
      const shuffled = shuffleArray(options);
      setShuffledOptions(shuffled);
      console.log('Options shuffled:', shuffled);
    }
  }, [currentQuestion]);

  // Background rotation
  useEffect(() => {
    setBgIndex(Math.floor(Math.random() * 5) + 1);
  }, [currentQuestionIndex]);

  // Check answer function - optimized with useCallback
  const checkAnswer = useCallback(() => {
    setIsTimerActive(false);
    if (timeLeft === 0 && !selectedOption) {
      // Time's up and no option selected
      playSound('error');
      setFeedback(`Time's up! ⏱️ The correct answer is ${currentQuestion.correctAnswer}.`);
      setShowTimesUp(true);
    } else if (currentQuestion && selectedOption === currentQuestion.correctAnswer) {
      // Play success sound for correct answer
      playSound('success');
      setFeedback("Correct! 🎉");
      setScore(score + 1);
    } else if (currentQuestion) {
      // Play error sound for wrong answer
      playSound('error');
      setFeedback(`Wrong! ❌ The correct answer is ${currentQuestion.correctAnswer}.`);
    }
    setTotalAnswered(totalAnswered + 1);
    setShowNextButton(true);
    setAnsweredQuestions([...answeredQuestions, { question: currentQuestion, isCorrect: selectedOption === currentQuestion.correctAnswer }]);
  }, [currentQuestion, selectedOption, score, totalAnswered, setScore, setTotalAnswered, timeLeft]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameStarted && !isTimerActive) {
      // Start the timer when the game starts (after countdown)
      setIsTimerActive(true);
      setTimeLeft(30);
    }

    if (isTimerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      checkAnswer();
    }

    return () => clearTimeout(timer);
  }, [timeLeft, isTimerActive, gameStarted]);

  // Handle next question - optimized with useCallback
  const handleNextQuestion = useCallback(() => {
    // Play button click sound when clicking next question
    playSound('primaryButton');

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      // Update to next question immediately without animation
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setFeedback('');
      setShowNextButton(false);
      setTimeLeft(30);
      setIsTimerActive(true);
      setShowTimesUp(false);
    } else {
      // Show results modal instead of going to dashboard
      setIsTimerActive(false);
      setShowResults(true);
    }
  }, [currentQuestionIndex, shuffledQuestions.length, navigateTo]);

  // Handle option selection and auto-submit - optimized with useCallback
  const handleOptionSelect = useCallback((option) => {
    if (!showNextButton) {
      // Play button click sound when selecting an option
      playSound('buttonClick');

      setSelectedOption(option);
      // Auto-submit the answer when an option is selected
      setIsTimerActive(false);
      if (currentQuestion && option === currentQuestion.correctAnswer) {
        // Play success sound for correct answer
        playSound('success');
        setFeedback("Correct! 🎉");
        setScore(score + 1);
      } else if (currentQuestion) {
        // Play error sound for wrong answer
        playSound('error');
        setFeedback(`Wrong! ❌ The correct answer is ${currentQuestion.correctAnswer}.`);
      }
      setTotalAnswered(totalAnswered + 1);
      setShowNextButton(true);
      setAnsweredQuestions([...answeredQuestions, { question: currentQuestion, isCorrect: option === currentQuestion.correctAnswer }]);
    }
  }, [currentQuestion, showNextButton, score, totalAnswered, setScore, setTotalAnswered, playSound]);

  // Apply Discord optimizations when in Discord environment
  useEffect(() => {
    const checkDiscordEnv = () => {
      // For testing in browser, we'll only apply Discord mode if explicitly set
      // In production, this would use the actual isInDiscord() check
      const isDiscord = isInDiscord || false; // Set to false for browser testing
      setInDiscordEnv(isDiscord);
      
      if (isDiscord) {
        // Apply Discord-specific optimizations
        optimizeForDiscord();
        // Enhance icons for better visibility
        setTimeout(enhanceIconsForDiscord, 500);
      }
    };
    
    checkDiscordEnv();
    
    // Re-check when window is fully loaded
    window.addEventListener('load', checkDiscordEnv);
    return () => window.removeEventListener('load', checkDiscordEnv);
  }, []);

  // Update game state
  useEffect(() => {
    if (currentQuestion && shuffledQuestions.length > 0) {
      // Update shared game state for Discord Activities
      if (isInDiscord && typeof updateSharedGameState === 'function') {
        updateSharedGameState({
          currentQuestionIndex,
          score,
          selectedOption,
          showNextButton,
          timeLeft
        });
      }

      // Update Rich Presence with detailed game information
      try {
        richPresenceService.updateGamePresence({
          score,
          currentQuestion: currentQuestionIndex + 1,
          totalQuestions: shuffledQuestions.length,
          category: gameType || 'Dofus Lore',
          difficulty: currentQuestion.difficulty || 'Normal'
        });
      } catch (error) {
        console.warn('Rich Presence update failed:', error);
      }
    }
  }, [currentQuestion, currentQuestionIndex, score, selectedOption, showNextButton, timeLeft, isInDiscord, updateSharedGameState, shuffledQuestions.length, gameType]);

  // Handle game completion
  const handleGameComplete = useCallback(() => {
    // Calculate final results
    const correctAnswersCount = answeredQuestions.filter(q => q.isCorrect).length;
    const finalResults = {
      score,
      totalQuestions: shuffledQuestions.length,
      correctAnswers: correctAnswersCount,
      incorrectAnswers: answeredQuestions.length - correctAnswersCount,
      timeTaken: Math.floor((Date.now() - startTime) / 1000)
    };

    // Update Rich Presence with game results
    try {
      richPresenceService.updateResultsPresence(finalResults);
    } catch (error) {
      console.warn('Rich Presence results update failed:', error);
    }

    // Navigate to dashboard with results
    navigateTo('dashboard');
  }, [answeredQuestions, navigateTo, shuffledQuestions.length, score, startTime]);

  // If questions aren't loaded yet
  if (!currentQuestion) {
    return <div className="loading">Loading questions...</div>;
  }

  return (
    <div className={`game-screen bg-${bgIndex} ${inDiscordEnv ? 'discord-mode' : ''}`}>
      {/* Game type indicator */}
      <div className="game-type-indicator">
        {currentGameType === 'dofusTouch' ? 'Dofus Touch' : 'Dofus'}
      </div>

      {/* Results Modal */}
      {showResults && (
        <ResultsModal
          score={score}
          totalAnswered={totalAnswered}
          onClose={() => navigateTo('home')}
          onPlayAgain={() => {
            setShowResults(false);
            setCurrentQuestionIndex(0);
            setScore(0);
            setTotalAnswered(0);
            setSelectedOption(null);
            setFeedback('');
            setShowNextButton(false);
            setTimeLeft(30);
            setIsTimerActive(true);
            setShowTimesUp(false);
            setShowCountdown(true);
            setShowQuestion(false);
            setGameStarted(false);
            setAnsweredQuestions([]);
            setStartTime(null);
          }}
          gameType={currentGameType}
          isInDiscord={inDiscordEnv}
        />
      )}
      {/* Countdown animation at the start of the game */}
      {showCountdown && (
        <CountdownAnimation onComplete={handleCountdownComplete} />
      )}

      <div className="game-container">
        <div className="score-display">Score: {score}/{totalAnswered}</div>
      </div>

      {/* Question overlay - always visible after countdown */}
      {!showCountdown && currentQuestion && (
        <QuestionOverlay
          question={currentQuestion}
          timeLeft={timeLeft}
          questionId={currentQuestionIndex}
          isInDiscord={inDiscordEnv}
        />
      )}

      <div className="question-container">
        <div className="options-section">
          <h3 className="options-title">Choose your answer:</h3>
          <AnimatedOptions
            options={shuffledOptions.length > 0 ? shuffledOptions : (currentQuestion ? currentQuestion.options : [])}
            selectedOption={selectedOption}
            correctAnswer={currentQuestion ? currentQuestion.correctAnswer : ''}
            showNextButton={showNextButton}
            onOptionSelect={handleOptionSelect}
            questionId={currentQuestionIndex}
            isInDiscord={inDiscordEnv}
          />

          {feedback && <div className="feedback">{feedback}</div>}

          {showTimesUp && !selectedOption && (
            <div className="times-up-message">
              <div className="times-up-icon">⏱️</div>
              <div className="times-up-text">Time's Up!</div>
            </div>
          )}

          {showNextButton && (
            <button className="next-button large-button" onClick={handleNextQuestion}>
              {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          )}
        </div>
      </div>

      <button
        className="exit-button"
        onClick={() => {
          playSound('secondaryButton');
          navigateTo('home');
        }}
        onMouseEnter={() => playSound('buttonHover')}
      >
        Exit Game
      </button>
    </div>
  );
});

export default GameScreen;
