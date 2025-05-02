import React from 'react';

function Dashboard({ navigateTo, score, totalAnswered }) {
  // Calculate percentage
  const percentage = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  
  // Determine performance message
  let performanceMessage = '';
  if (percentage >= 90) {
    performanceMessage = 'Legendary! You are a true Dofus master!';
  } else if (percentage >= 70) {
    performanceMessage = 'Great job! Your knowledge of the World of Twelve is impressive!';
  } else if (percentage >= 50) {
    performanceMessage = 'Not bad! You know your way around Amakna!';
  } else {
    performanceMessage = 'Keep exploring the World of Twelve to improve your knowledge!';
  }

  return (
    <div className="dashboard">
      <h1>Your Results</h1>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Score</h3>
          <p className="stat-value">{score}/{totalAnswered}</p>
        </div>
        
        <div className="stat-card">
          <h3>Percentage</h3>
          <p className="stat-value">{percentage}%</p>
        </div>
      </div>
      
      <div className="performance-message">
        <p>{performanceMessage}</p>
      </div>
      
      <div className="dashboard-buttons">
        <button className="btn btn-primary" onClick={() => navigateTo('game')}>
          Play Again
        </button>
        <button className="btn btn-secondary" onClick={() => navigateTo('home')}>
          Home
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
