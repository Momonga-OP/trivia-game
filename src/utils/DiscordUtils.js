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
  
  // Add background to social icons for better visibility
  const socialIcons = document.querySelectorAll('.social-icon, .icon-youtube, .icon-discord, .icon-close');
  socialIcons.forEach(icon => {
    icon.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    icon.style.borderRadius = '50%';
    icon.style.padding = '5px';
    
    // Ensure SVG icons are visible
    const svg = icon.querySelector('svg');
    if (svg) {
      svg.style.fill = 'white';
      svg.style.stroke = 'white';
    }
    
    // Ensure image icons are visible
    const img = icon.querySelector('img');
    if (img) {
      img.style.filter = 'brightness(1.2)';
    }
  });
};
