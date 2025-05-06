                <span className="discord-status">Connecting...</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Not in Discord message - only shown when not in Discord activity */}
      {!isInDiscord && !currentPlayer && (
        <div className="non-discord-message">
          <p>Play this game as a Discord activity to have your scores saved to the leaderboard!</p>
        </div>
      )}
      
      {/* Back button */}
      <button 
        className="back-button"
        onClick={handleBack}
        onMouseEnter={() => playSound('buttonHover')}
      >
        Back to Home
      </button>
    </div>
  );
};

export default Leaderboard;
