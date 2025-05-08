/**
 * BookSoundPreloader.js
 * Utility to preload book-related sound effects for better performance
 */
import soundService from '../services/SoundService';

/**
 * Preloads all book-related sound effects to ensure smooth playback
 * This is particularly important for Discord Activity where audio performance can be limited
 */
export const preloadBookSounds = () => {
  try {
    // Check if soundService is available
    if (!soundService || typeof soundService.preloadSound !== 'function') {
      console.warn('Sound service not available or missing preloadSound method');
      return false;
    }
    
    // List of book-related sound effects to preload
    const bookSounds = [
      'pageFlip',
      'bookOpen',
      'bookClose',
      'pageRustle'
    ];
    
    // Preload each sound with error handling
    bookSounds.forEach(soundName => {
      try {
        soundService.preloadSound(soundName);
      } catch (soundError) {
        console.warn(`Failed to preload sound: ${soundName}`, soundError);
      }
    });
    
    console.log('Book sound effects preloaded');
    return true;
  } catch (error) {
    console.warn('Error preloading sound effects:', error);
    return false;
  }
};

/**
 * Optimizes sound playback for mobile devices
 * Reduces sound complexity and volume for better performance on low-power devices
 */
export const optimizeSoundsForMobile = () => {
  // Check if we're on a mobile device
  const isMobile = window.innerWidth <= 768 || 
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Reduce volume for mobile devices
    soundService.setVolume(0.3); // 30% of normal volume
    
    console.log('Sound effects optimized for mobile');
  }
};

export default {
  preloadBookSounds,
  optimizeSoundsForMobile
};
