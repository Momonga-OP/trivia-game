import React, { createContext, useState, useEffect, useContext } from 'react';
import soundService from '../services/SoundService';
import musicService from '../services/MusicService';

// Create a context for sound management
const SoundContext = createContext();

// Custom hook to use the sound context
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

// Sound Provider component
export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default volume (30%)
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sound service on component mount
  useEffect(() => {
    const initSounds = () => {
      const initialized = soundService.init();
      setIsInitialized(initialized);
      
      // Sync state with service
      setIsMuted(soundService.isMuted);
      setVolume(soundService.volume);
    };
    
    initSounds();
  }, []);

  // Play a sound effect
  const playSound = (soundName) => {
    if (isInitialized && !isMuted) {
      soundService.play(soundName);
    }
  };

  // Toggle mute state for sound effects
  const toggleMute = () => {
    const newMuted = soundService.toggleMute();
    setIsMuted(newMuted);
    return newMuted;
  };

  // Update sound effects volume
  const updateVolume = (newVolume) => {
    setVolume(newVolume);
    soundService.setVolume(newVolume);
  };

  // Context value
  const value = {
    // Sound effects
    isMuted,
    volume,
    playSound,
    toggleMute,
    updateVolume,
    
    // General
    isInitialized
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

export default SoundContext;
