import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { questions } from '../questionsData.js';
import CountdownAnimation from './CountdownAnimation';
import QuestionOverlay from './QuestionOverlay';
import AnimatedOptions from './AnimatedOptions';
import soundService from '../services/SoundService';
import './styles/GameScreen.css';

// Memoized GameScreen component to prevent unnecessary re-renders
const GameScreen = memo(function GameScreen({ navigateTo, score, setScore, totalAnswered, setTotalAnswered }) {
  // Create shuffled questions array on game start
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [bgIndex, setBgIndex] = useState(Math.floor(Math.random() * 5) + 1);
  const [showCountdown, setShowCountdown] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Shuffle questions when component mounts
  useEffect(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);
  
  // Handle countdown completion - optimized with useCallback
  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setShowQuestion(true);
    setGameStarted(true);
  }, []);
  
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  // Background rotation
  useEffect(() => {
    setBgIndex(Math.floor(Math.random() * 5) + 1);
  }, [currentQuestionIndex]);

  // Check answer function - optimized with useCallback
  const checkAnswer = useCallback(() => {
    setIsTimerActive(false);
    if (currentQuestion && selectedOption === currentQuestion.correctAnswer) {
      // Play success sound for correct answer
      soundService.play('success');
      setFeedback("Correct! 🎉");
      setScore(score + 1);
    } else if (currentQuestion) {
      // Play error sound for wrong answer
      soundService.play('error');
      setFeedback(`Wrong! ❌ The correct answer is ${currentQuestion.correctAnswer}.`);
    }
    setTotalAnswered(totalAnswered + 1);
    setShowNextButton(true);
  }, [currentQuestion, selectedOption, score, totalAnswered, setScore, setTotalAnswered]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameStarted && !isTimerActive) {
      // Start the timer when the game starts (after countdown)
      setIsTimerActive(true);
      setTimeLeft(15);
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
    soundService.play('primaryButton');
    
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      // Update to next question immediately without animation
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setFeedback('');
      setShowNextButton(false);
      setTimeLeft(15);
      setIsTimerActive(true);
    } else {
      // End of questions, go to dashboard
      navigateTo('dashboard');
    }
  }, [currentQuestionIndex, shuffledQuestions.length, navigateTo]);

  // Handle option selection and auto-submit - optimized with useCallback
  const handleOptionSelect = useCallback((option) => {
    if (!showNextButton) {
      // Play button click sound when selecting an option
      soundService.play('buttonClick');
      
      setSelectedOption(option);
      // Auto-submit the answer when an option is selected
      setIsTimerActive(false);
      if (currentQuestion && option === currentQuestion.correctAnswer) {
        // Play success sound for correct answer
        soundService.play('success');
        setFeedback("Correct! 🎉");
        setScore(score + 1);
      } else if (currentQuestion) {
        // Play error sound for wrong answer
        soundService.play('error');
        setFeedback(`Wrong! ❌ The correct answer is ${currentQuestion.correctAnswer}.`);
      }
      setTotalAnswered(totalAnswered + 1);
      setShowNextButton(true);
    }
  }, [currentQuestion, showNextButton, score, totalAnswered, setScore, setTotalAnswered]);

  // If questions aren't loaded yet
  if (!currentQuestion) {
    return <div className="loading">Loading questions...</div>;
  }

  return (
    <div className={`game-screen bg-${bgIndex}`}>
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
        />
      )}
      
      <div className="question-container">
        <div className="options-section">
          <h3 className="options-title">Choose your answer:</h3>
          <AnimatedOptions 
            options={currentQuestion.options}
            selectedOption={selectedOption}
            correctAnswer={currentQuestion.correctAnswer}
            showNextButton={showNextButton}
            onOptionSelect={handleOptionSelect}
            questionId={currentQuestionIndex}
          />
          
          {feedback && <div className="feedback">{feedback}</div>}
          
          {showNextButton && (
            <button className="next-button large-button" onClick={handleNextQuestion}>
              {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          )}
        </div>
      </div>
      
      <button className="exit-button" onClick={() => navigateTo('home')}>
        Exit Game
      </button>
    </div>
  );
});

export default GameScreen;
