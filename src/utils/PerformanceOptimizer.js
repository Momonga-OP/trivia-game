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
    window.discord !== undefined || 
    window.__DISCORD__ !== undefined || 
    window.location.hostname.includes('discord.com') ||
    navigator.userAgent.includes('Discord')
  );
};

// Memory management to prevent memory leaks
export const cleanupMemory = () => {
  // Clear any unused image caches
  if (window.caches) {
    try {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image-cache')) {
            caches.delete(cacheName);
          }
        });
      });
    } catch (e) {
      console.warn('Cache cleanup failed:', e);
    }
  }
  
  // Force garbage collection hint (not guaranteed but can help)
  if (window.gc) {
    try {
      window.gc();
    } catch (e) {
      // Garbage collection not available
    }
  }
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
    
    // Reduce shadow effects
    const shadowElements = document.querySelectorAll('.card-glow, .logo-glow, .button-shine');
    shadowElements.forEach(element => {
      element.style.opacity = '0.3';
      element.style.filter = 'blur(3px)';
    });
    
    // Optimize background animations
    const bgAnimations = document.querySelectorAll('.background-animation');
    bgAnimations.forEach(bg => {
      bg.style.opacity = '0.4';
    });
    
    // Reduce transition effects
    document.documentElement.style.setProperty('--transition-speed', '0.2s');
  }
  
  // Optimize scrolling
  window.addEventListener('scroll', throttle(() => {
    // Any scroll-based updates can go here
  }, 100));
  
  // Optimize resize handling
  window.addEventListener('resize', debounce(() => {
    // Any resize-based updates can go here
  }, 150));
  
  // Periodically clean up memory
  setInterval(cleanupMemory, 60000); // Every minute
  
  // Optimize rendering by using passive event listeners
  window.addEventListener('touchstart', () => {}, { passive: true });
  window.addEventListener('touchmove', () => {}, { passive: true });
};

// Optimize font loading
export const optimizeFontLoading = () => {
  // Use font-display: swap to prevent FOIT (Flash of Invisible Text)
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap !important;
    }
  `;
  document.head.appendChild(style);
};

// Initialize all performance optimizations
export const initializeOptimizations = () => {
  applyPerformanceOptimizations();
  optimizeFontLoading();
  
  // Add event listener for when the page becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Re-apply optimizations when tab becomes visible again
      applyPerformanceOptimizations();
    }
  });
};
