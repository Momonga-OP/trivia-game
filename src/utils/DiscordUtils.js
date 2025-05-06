/**
 * Utility functions for Discord integration
 */

/**
 * Detects if the application is running inside Discord
 * @returns {boolean} True if running in Discord
 */
export const isInDiscord = () => {
  if (typeof window === 'undefined') return false;
  
  // Use actual detection logic for Discord environment
  return (
    window.discord !== undefined || 
    window.__DISCORD__ !== undefined || 
    window.location.hostname.includes('discord.com')
  );
};

/**
 * Gets Discord SDK if available
 * @returns {Object|null} Discord SDK or null if not available
 */
export const getDiscordSDK = () => {
  if (!isInDiscord()) return null;
  
  return window.discord || null;
};

/**
 * Gets the current user's Discord information if available
 * @returns {Promise<Object|null>} User info or null if not available
 */
export const getDiscordUser = async () => {
  const sdk = getDiscordSDK();
  if (!sdk || !sdk.user) return null;
  
  try {
    const user = await sdk.user.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Failed to get Discord user:', error);
    return null;
  }
};

/**
 * Optimizes UI for Discord
 * Adds the discord-mode class to the body element
 */
export const optimizeForDiscord = () => {
  if (!isInDiscord()) return;
  
  // Add Discord mode class to body
  document.body.classList.add('discord-mode');
  
  // Adjust viewport for Discord iframe
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
  
  console.log('UI optimized for Discord');
};

/**
 * Registers Discord activity commands
 * @param {Object} commands Map of command names to handler functions
 */
export const registerDiscordCommands = (commands) => {
  const sdk = getDiscordSDK();
  if (!sdk || !sdk.commands) return;
  
  try {
    // Register each command
    Object.entries(commands).forEach(([name, handler]) => {
      sdk.commands.registerCommand(name, handler);
    });
    
    console.log('Discord commands registered:', Object.keys(commands));
  } catch (error) {
    console.error('Failed to register Discord commands:', error);
  }
};

/**
 * Enhances icons for better visibility in Discord
 * This addresses the issue with YouTube, Discord, and close icons
 */
export const enhanceIconsForDiscord = () => {
  if (!isInDiscord()) return;
  
  // Wait for DOM to be fully loaded
  const enhanceIcons = () => {
    // Add background to social icons for better visibility
    const socialIcons = document.querySelectorAll('.social-icon, .icon-youtube, .icon-discord, .icon-close, .fa-youtube, .fa-discord, .fa-times, .fa-cog, .fab, .fas');
    
    socialIcons.forEach(icon => {
      // Skip if already enhanced
      if (icon.dataset.enhanced === 'true') return;
      
      // Mark as enhanced to avoid duplicate processing
      icon.dataset.enhanced = 'true';
      
      // Add a more prominent background
      icon.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      icon.style.borderRadius = '50%';
      icon.style.padding = '10px';
      icon.style.margin = '3px';
      icon.style.display = 'inline-flex';
      icon.style.justifyContent = 'center';
      icon.style.alignItems = 'center';
      icon.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.4)';
      icon.style.width = '24px';
      icon.style.height = '24px';
      icon.style.position = 'relative';
      
      // Add a data-fallback attribute if not present
      if (!icon.dataset.fallback) {
        if (icon.classList.contains('fa-discord') || icon.classList.contains('discord')) {
          icon.dataset.fallback = 'DC';
        } else if (icon.classList.contains('fa-youtube') || icon.classList.contains('youtube')) {
          icon.dataset.fallback = 'YT';
        } else if (icon.classList.contains('fa-cog') || icon.classList.contains('settings')) {
          icon.dataset.fallback = '⚙️';
        } else if (icon.classList.contains('fa-times') || icon.classList.contains('close')) {
          icon.dataset.fallback = '✖';
        }
      }
      
      // Ensure SVG icons are visible
      const svg = icon.querySelector('svg');
      if (svg) {
        svg.style.fill = 'white';
        svg.style.stroke = 'white';
        svg.style.width = '18px';
        svg.style.height = '18px';
        svg.style.filter = 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))';
      }
      
      // Ensure Font Awesome icons are visible
      if (icon.classList.contains('fas') || icon.classList.contains('fab') || icon.classList.contains('fa')) {
        icon.style.color = 'white';
        icon.style.fontSize = '18px';
        icon.style.textShadow = '0 0 4px rgba(0, 0, 0, 0.9)';
      }
      
      // Ensure image icons are visible
      const img = icon.querySelector('img');
      if (img) {
        img.style.filter = 'brightness(1.5) contrast(1.2)';
        img.style.width = '18px';
        img.style.height = '18px';
      }
      
      // Add fallback text as pseudo-element for when icons don't load
      if (icon.dataset.fallback) {
        const fallbackStyle = document.createElement('style');
        const uniqueId = `icon-${Math.random().toString(36).substring(2, 9)}`;
        icon.classList.add(uniqueId);
        
        fallbackStyle.textContent = `
          .${uniqueId}::before {
            content: "${icon.dataset.fallback}";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
            font-weight: bold;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .${uniqueId} svg:not(:visible) + .${uniqueId}::before,
          .${uniqueId}:empty::before {
            opacity: 1;
          }
        `;
        
        document.head.appendChild(fallbackStyle);
      }
    });
    
    // Add a CSS class for Discord icons
    const style = document.createElement('style');
    style.textContent = `
      .discord-mode .social-icon, 
      .discord-mode .fa-youtube, 
      .discord-mode .fa-discord, 
      .discord-mode .fa-times,
      .discord-mode .fa-cog,
      .discord-mode .fab,
      .discord-mode .fas {
        background-color: rgba(0, 0, 0, 0.8) !important;
        color: white !important;
        border-radius: 50% !important;
        padding: 10px !important;
        margin: 3px !important;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.4) !important;
        position: relative !important;
      }
      
      .discord-mode .social-icon i,
      .discord-mode .fab,
      .discord-mode .fas {
        color: white !important;
        font-size: 18px !important;
        text-shadow: 0 0 4px rgba(0, 0, 0, 0.9) !important;
      }
      
      /* Ensure icons are visible even in dark Discord theme */
      .discord-mode .social-icon:after,
      .discord-mode .fab:after,
      .discord-mode .fas:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  };
  
  // Run immediately and also after a short delay to catch dynamically added icons
  enhanceIcons();
  setTimeout(enhanceIcons, 1000);
  
  // Also run when window is fully loaded
  window.addEventListener('load', enhanceIcons);
  
  // Set up a mutation observer to catch dynamically added icons
  const observer = new MutationObserver((mutations) => {
    let shouldEnhance = false;
    
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        shouldEnhance = true;
      }
    });
    
    if (shouldEnhance) {
      enhanceIcons();
    }
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
};
