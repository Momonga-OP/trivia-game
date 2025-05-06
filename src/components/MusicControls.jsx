import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import musicService from '../services/MusicService';
import './styles/MusicControls.css';

/**
 * MusicControls component for adjusting music volume and mute state
 */
const MusicControls = () => {
  const [volume, setVolume] = useState(musicService.volume * 100);
  const [isMuted, setIsMuted] = useState(musicService.isMuted);

  // Update local state when music service changes
  useEffect(() => {
    const updateFromService = () => {
      setVolume(musicService.volume * 100);
      setIsMuted(musicService.isMuted);
    };

    // Initial update
    updateFromService();

    // We could add event listeners here if the music service had events
  }, []);

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    musicService.setVolume(newVolume / 100);
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    musicService.setMuted(newMutedState);
  };

  return (
    <div className="music-controls">
      <h3>Background Music</h3>
      <div className="music-control-row">
        <button 
          className={`mute-button ${isMuted ? 'muted' : ''}`}
          onClick={handleMuteToggle}
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        >
          <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          disabled={isMuted}
          aria-label="Music volume"
        />
        <span className="volume-value">{volume}%</span>
      </div>
    </div>
  );
};

export default MusicControls;
