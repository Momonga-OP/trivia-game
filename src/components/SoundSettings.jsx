import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVolumeUp, 
  faVolumeMute, 
  faMusic, 
  faVolumeDown 
} from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../contexts/SoundContext';
import soundService from '../services/SoundService';
import musicService from '../services/MusicService';
import './styles/SoundSettings.css';

const SoundSettings = () => {
  // Get sound context
  const { playSound } = useSound();
  
  // Local state for sound effects
  const [isSfxMuted, setIsSfxMuted] = useState(soundService.isMuted);
  const [sfxVolume, setSfxVolume] = useState(soundService.volume * 100);
  
  // Local state for music
  const [isMusicMuted, setIsMusicMuted] = useState(musicService.isMuted);
  const [musicVolume, setMusicVolume] = useState(musicService.volume * 100);
  
  // Handle sound effects volume change
  const handleSfxVolumeChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setSfxVolume(newValue);
    soundService.setVolume(newValue / 100);
    
    // Play a sample sound when adjusting volume
    if (!isSfxMuted && newValue > 0) {
      soundService.play('buttonClick');
    }
  };
  
  // Handle music volume change
  const handleMusicVolumeChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setMusicVolume(newValue);
    musicService.setVolume(newValue / 100);
  };
  
  // Toggle sound effects mute
  const handleToggleSfxMute = () => {
    const newMuted = !isSfxMuted;
    setIsSfxMuted(newMuted);
    soundService.setMuted(newMuted);
    
    if (!newMuted) {
      // Play a sound to confirm unmuting
      soundService.play('buttonClick');
    }
  };
  
  // Toggle music mute
  const handleToggleMusicMute = () => {
    const newMuted = !isMusicMuted;
    setIsMusicMuted(newMuted);
    musicService.setMuted(newMuted);
  };
  
  return (
    <div className="sound-settings">
      <h3>Sound Settings</h3>
      
      {/* Sound Effects Controls */}
      <div className="sound-control">
        <div className="sound-control-header">
          <span>Sound Effects</span>
          <button 
            className="mute-button" 
            onClick={handleToggleSfxMute}
            aria-label={isSfxMuted ? "Unmute sound effects" : "Mute sound effects"}
          >
            <FontAwesomeIcon 
              icon={isSfxMuted ? faVolumeMute : (sfxVolume < 50 ? faVolumeDown : faVolumeUp)} 
              className={isSfxMuted ? "muted" : ""}
            />
          </button>
        </div>
        
        <div className="volume-slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={sfxVolume}
            onChange={handleSfxVolumeChange}
            className="volume-slider"
            disabled={isSfxMuted}
            aria-label="Sound effects volume"
          />
          <div className="volume-value">{sfxVolume}%</div>
        </div>
      </div>
      
      {/* Music Controls */}
      <div className="sound-control">
        <div className="sound-control-header">
          <span>Background Music</span>
          <button 
            className="mute-button" 
            onClick={handleToggleMusicMute}
            aria-label={isMusicMuted ? "Unmute music" : "Mute music"}
          >
            <FontAwesomeIcon 
              icon={isMusicMuted ? faVolumeMute : faMusic} 
              className={isMusicMuted ? "muted" : ""}
            />
          </button>
        </div>
        
        <div className="volume-slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={musicVolume}
            onChange={handleMusicVolumeChange}
            className="volume-slider"
            disabled={isMusicMuted}
            aria-label="Music volume"
          />
          <div className="volume-value">{musicVolume}%</div>
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;
