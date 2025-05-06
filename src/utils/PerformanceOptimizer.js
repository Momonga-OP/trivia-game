/**
 * Performance Optimizer Utility
 * Provides functions to optimize game performance and reduce lag
 */

// Debounce function to limit how often a function can be called
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Throttle function to limit the rate at which a function can be called
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Request Animation Frame wrapper for smoother animations
export const rafCallback = (callback) => {
  let ticking = false;
  
  return (...args) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
};

// Optimize image loading by lazy loading images
export const lazyLoadImage = (imgElement, src) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          imgElement.src = src;
          observer.unobserve(imgElement);
        }
      });
    });
    observer.observe(imgElement);
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    imgElement.src = src;
  }
};

// Optimize rendering by preventing unnecessary re-renders
export const shouldComponentUpdate = (prevProps, nextProps, keysToCheck) => {
  return keysToCheck.some(key => prevProps[key] !== nextProps[key]);
};

// Optimize audio playback to reduce lag
export const optimizeAudioPlayback = (audioElement) => {
  // Reduce audio quality for better performance
  if (audioElement && audioElement.mozSetup) {
    // Firefox specific optimization
    audioElement.mozSetup(1, 22050); // Mono, 22.05kHz
  }
  
  // Set small audio buffer size
  if (audioElement) {
    audioElement.preload = 'none'; // Don't preload audio
    
    // Only load when needed
    return {
      play: () => {
        audioElement.preload = 'auto';
        audioElement.load();
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('Audio playback error:', error);
          });
        }
      }
    };
  }
  
  return { play: () => {} };
};

// Detect if running in Discord for performance optimizations
export const isRunningInDiscord = () => {
  return typeof window !== 'undefined' && (
    window.location.href.includes('discord') || 
    navigator.userAgent.includes('Discord') ||
    window.innerWidth <= 600
  );
};

// Apply performance optimizations based on environment
export const applyPerformanceOptimizations = () => {
  // Reduce animations in Discord
  if (isRunningInDiscord()) {
    document.body.classList.add('discord-mode');
    
    // Reduce particle effects
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
      particle.style.animationDuration = '40s'; // Slower animation
      particle.style.opacity = '0.2'; // More transparent
    });
    
    // Disable complex animations
    const animations = document.querySelectorAll('.animation-heavy');
    animations.forEach(animation => {
      animation.classList.add('simplified');
    });
  }
  
  // Optimize scrolling
  window.addEventListener('scroll', throttle(() => {
    // Any scroll-based updates can go here
  }, 100));
  
  // Optimize resize handling
  window.addEventListener('resize', debounce(() => {
    // Any resize-based updates can go here
  }, 150));
};
