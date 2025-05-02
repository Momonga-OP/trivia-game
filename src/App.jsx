import { useState, useEffect } from 'react';
import './App.css';
import { questions } from './questionsData.js';

// Main App component that handles routing
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Navigation handler
  const navigateTo = (page) => {
    setCurrentPage(page);
    
    // Reset score when starting a new game
    if (page === 'game') {
      setScore(0);
      setTotalAnswered(0);
    }
  };

  // Render the appropriate page based on state
  return (
    <div className="app-container">
      {currentPage === 'home' && (
        <HomePage navigateTo={navigateTo} />
      )}
      {currentPage === 'game' && (
        <GameScreen 
          navigateTo={navigateTo} 
          score={score} 
          setScore={setScore}
          totalAnswered={totalAnswered}
          setTotalAnswered={setTotalAnswered}
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          navigateTo={navigateTo} 
          score={score} 
          totalAnswered={totalAnswered}
        />
      )}
      {currentPage === 'about' && (
        <About navigateTo={navigateTo} />
      )}
      {currentPage === 'credits' && (
        <Credits navigateTo={navigateTo} />
      )}
    </div>
  );
}

// Home Page Component
function HomePage({ navigateTo }) {
  return (
    <div className="home-page">
      <div className="content-container">
        <h1 className="game-title">Dofus Lore Trivia</h1>
        <p className="subtitle">Test your knowledge of the World of Twelve!</p>
        
        <div className="button-container">
          <button className="btn btn-primary" onClick={() => navigateTo('game')}>
            Start Game
          </button>
          <button className="btn btn-secondary" onClick={() => navigateTo('dashboard')}>
            Dashboard
          </button>
          <button className="btn btn-tertiary" onClick={() => navigateTo('about')}>
            About
          </button>
          <button className="btn btn-credits" onClick={() => navigateTo('credits')}>
            Credits
          </button>
        </div>
        
        <div className="social-links">
          <a href="https://discord.gg/rKb3Zp7AQ2" target="_blank" rel="noopener noreferrer" className="social-icon discord">
            <i className="fab fa-discord"></i>
          </a>
          <a href="https://www.youtube.com/@Spartadfosutouch1827" target="_blank" rel="noopener noreferrer" className="social-icon youtube">
            <i className="fab fa-youtube"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

// Game Screen Component
function GameScreen({ navigateTo, score, setScore, totalAnswered, setTotalAnswered }) {
  // Create shuffled questions array on game start
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [bgIndex, setBgIndex] = useState(Math.floor(Math.random() * 5) + 1);
  
  // Shuffle questions when component mounts
  useEffect(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);
  
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  // Background rotation
  useEffect(() => {
    setBgIndex(Math.floor(Math.random() * 5) + 1);
  }, [currentQuestionIndex]);

  // Check answer function
  const checkAnswer = () => {
    setIsTimerActive(false);
    if (currentQuestion && selectedOption === currentQuestion.correctAnswer) {
      setFeedback("Correct! 🎉");
      setScore(score + 1);
    } else if (currentQuestion) {
      setFeedback(`Wrong! ❌ The correct answer is ${currentQuestion.correctAnswer}.`);
    }
    setTotalAnswered(totalAnswered + 1);
    setShowNextButton(true);
  };

  // Timer implementation
  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      // Auto submit if time runs out
      if (currentQuestion && !selectedOption) {
        setFeedback(`Time's up! ⏱️ The correct answer is ${currentQuestion.correctAnswer}.`);
        setTotalAnswered(totalAnswered + 1);
      } else if (currentQuestion) {
        checkAnswer();
      }
      setShowNextButton(true);
    }
    
    return () => clearTimeout(timer);
  }, [timeLeft, isTimerActive, currentQuestion, selectedOption, totalAnswered, setTotalAnswered, score, setScore]);

  // Handle clicking anywhere in the option item, not just the radio button
  const handleOptionSelect = (option) => {
    if (isTimerActive) {
      setSelectedOption(option);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setFeedback('');
      setShowNextButton(false);
      setTimeLeft(15);
      setIsTimerActive(true);
    } else {
      // Game over
      navigateTo('dashboard');
    }
  };

  // Wait for shuffled questions to be ready
  if (shuffledQuestions.length === 0 || !currentQuestion) {
    return <div className="loading">Loading questions...</div>;
  }

  return (
    <div className={`game-screen bg-${bgIndex}`}>
      <Header navigateTo={navigateTo} />
      
      <div className="game-header-row">
        <div className="timer-container">
          <div className="timer">
            <div className="timer-bar" style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
          </div>
          <span className="timer-text">{timeLeft}s</span>
        </div>
        
        <div className="score-display">
          <span className="score-pill">
            Score: {score}/{totalAnswered}
          </span>
        </div>
      </div>
      
      <div className="question-section">
        <h2 className="question-count">Question {currentQuestionIndex + 1}/{shuffledQuestions.length}</h2>
        <p className="question-text">{currentQuestion.text}</p>
        
        <div className="options-container">
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index} 
              className={`option-item ${selectedOption === option ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(option)}
            >
              <input
                type="radio"
                id={`option-${index}`}
                name="answer"
                value={option}
                checked={selectedOption === option}
                onChange={() => handleOptionSelect(option)}
                disabled={!isTimerActive}
              />
              <label htmlFor={`option-${index}`}>{option}</label>
            </div>
          ))}
        </div>

        <div className="button-row">
          {!showNextButton ? (
            <button 
              onClick={checkAnswer} 
              disabled={!selectedOption || !isTimerActive}
              className={`btn ${!selectedOption || !isTimerActive ? 'btn-disabled' : 'btn-submit'}`}
            >
              Submit Answer
            </button>
          ) : (
            <button 
              onClick={handleNextQuestion} 
              className="btn btn-next"
            >
              Next Question
            </button>
          )}
        </div>

        {feedback && (
          <p className={`feedback ${feedback.includes('Correct') ? 'feedback-correct' : 'feedback-wrong'}`}>
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ navigateTo, score, totalAnswered }) {
  // Calculate the accuracy based on current round
  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  
  return (
    <div className="dashboard-screen">
      <Header navigateTo={navigateTo} />
      <h2 className="screen-title">Player Dashboard</h2>
      
      <div className="stats-container">
        <h3 className="stats-title">Current Round Stats</h3>
        <p className="stats-score">Score: {score}/{totalAnswered}</p>
        
        <div className="stats-details">
          <p>Correct Answers: {score}</p>
          <p>Incorrect Answers: {totalAnswered - score}</p>
          <p>Accuracy: {accuracy}%</p>
        </div>
      </div>
      
      <div className="button-container">
        <button onClick={() => navigateTo('game')} className="btn btn-primary">
          Play Again
        </button>
      </div>
    </div>
  );
}

// About Component
function About({ navigateTo }) {
  return (
    <div className="about-screen">
      <Header navigateTo={navigateTo} />
      <h2 className="screen-title">About Dofus Trivia</h2>
      
      <div className="about-content">
        <p>
          Welcome to Dofus Lore Trivia, a fun quiz game testing your knowledge about the World of Twelve and the Dofus universe!
        </p>
        <p>
          This game features questions about characters, locations, classes, and lore from the popular MMORPG Dofus.
        </p>
        <p>
          How well do you know the world of Dofus? Challenge yourself and find out!
        </p>
        <p>
          Each question has a 15-second timer to keep you on your toes and make the challenge more exciting!
        </p>
      </div>
    </div>
  );
}

// Credits Component
function Credits({ navigateTo }) {
  return (
    <div className="credits-screen">
      <Header navigateTo={navigateTo} />
      <h2 className="screen-title">Credits</h2>
      
      <div className="credits-content">
        <div className="credit-section">
          <h3>Created By</h3>
          <p>Sparta Guild - Dodge Server</p>
        </div>
        
        <div className="credit-section">
          <h3>Follow Us</h3>
          <div className="social-links-large">
            <a href="https://discord.gg/rKb3Zp7AQ2" target="_blank" rel="noopener noreferrer" className="social-link discord">
              <i className="fab fa-discord"></i>
              <span>Join our Discord Server</span>
            </a>
            <a href="https://www.youtube.com/@Spartadfosutouch1827" target="_blank" rel="noopener noreferrer" className="social-link youtube">
              <i className="fab fa-youtube"></i>
              <span>Subscribe to our YouTube Channel</span>
            </a>
          </div>
        </div>
        
        <div className="credit-section">
          <h3>Special Thanks</h3>
          <p>To all members of the Sparta Guild and the Dofus community</p>
        </div>
      </div>
    </div>
  );
}

// Common Header Component with Navigation
function Header({ navigateTo }) {
  return (
    <header className="game-header">
      <h1 className="header-title" onClick={() => navigateTo('home')}>
        Dofus Trivia
      </h1>
      <nav className="header-nav">
        <button 
          onClick={() => navigateTo('home')}
          className="nav-btn"
        >
          Home
        </button>
        <button 
          onClick={() => navigateTo('dashboard')}
          className="nav-btn"
        >
          Dashboard
        </button>
        <button 
          onClick={() => navigateTo('credits')}
          className="nav-btn"
        >
          Credits
        </button>
      </nav>
    </header>
  );
}

export default App;