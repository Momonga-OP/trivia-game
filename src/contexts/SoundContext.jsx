import React, { createContext, useState, useEffect, useContext } from 'react';
import soundService from '../services/SoundService';

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
  const [volume, setVolume] = useState(0.7); // Default volume (0-1)
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sound service on component mount
  useEffect(() => {
    const initSounds = async () => {
      await soundService.initialize();
      setIsInitialized(true);
    };
    
    initSounds();
    
    // Try to load saved preferences
    const savedMuted = localStorage.getItem('soundMuted');
    const savedVolume = localStorage.getItem('soundVolume');
    
    if (savedMuted !== null) {
      const muted = savedMuted === 'true';
      setIsMuted(muted);
      soundService.setMuted(muted);
    }
    
    if (savedVolume !== null) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      soundService.setVolume(vol);
    }
  }, []);

  // Play a sound effect
  const playSound = (soundName) => {
    if (isInitialized && !isMuted) {
      soundService.play(soundName);
    }
  };

  // Toggle mute state
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundService.setMuted(newMuted);
    localStorage.setItem('soundMuted', newMuted.toString());
    return newMuted;
  };

  // Update volume
  const updateVolume = (newVolume) => {
    setVolume(newVolume);
    soundService.setVolume(newVolume);
    localStorage.setItem('soundVolume', newVolume.toString());
  };

  // Context value
  const value = {
    isMuted,
    volume,
    playSound,
    toggleMute,
    updateVolume,
    isInitialized
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

export default SoundContext;
