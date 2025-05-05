import React from 'react';
import './styles/ParticipantsList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCrown, faUser } from '@fortawesome/free-solid-svg-icons';
import soundService from '../services/SoundService';

/**
 * Component to display the list of Discord participants in the activity
 */
const ParticipantsList = ({ participants, onClose }) => {
  // Handle close button click with sound
  const handleClose = () => {
    soundService.play('closeButton');
    onClose();
  };

  return (
    <div className="participants-container">
      <div className="participants-header">
        <h3>Players</h3>
        <button className="close-button" onClick={handleClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className="participants-list">
        {participants.length === 0 ? (
          <div className="no-participants">No other players yet</div>
        ) : (
          participants.map((participant, index) => (
            <div key={participant.user.id} className="participant-item">
              <div className="participant-avatar">
                {participant.user.avatar ? (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${participant.user.id}/${participant.user.avatar}.png`} 
                    alt={participant.user.username} 
                  />
                ) : (
                  <div className="default-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
              </div>
              <div className="participant-info">
                <span className="participant-name">
                  {participant.user.username}
                  {index === 0 && (
                    <span className="host-badge">
                      <FontAwesomeIcon icon={faCrown} />
                    </span>
                  )}
                </span>
                <span className="participant-status">{participant.status || 'Playing'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantsList;
