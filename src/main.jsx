import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
// Import Font Awesome library setup
import './utils/fontAwesome';
// Import Font Awesome CSS
import '@fortawesome/fontawesome-svg-core/styles.css';
import discordService from './services/DiscordService';
import richPresenceService from './services/RichPresenceService';

// Try to import the Discord SDK - this won't crash if the package isn't installed
let DiscordSDK;
try {
  const discord = require('@discord/embedded-app-sdk');
  DiscordSDK = discord.DiscordSDK;
  // Make it available globally for our service to use
  window.DiscordSDK = DiscordSDK;
} catch (err) {
  console.warn('Discord SDK not available:', err.message);
}

function RootApp() {
  // Track Discord connection status
  const [discordStatus, setDiscordStatus] = useState('idle');
  const [discordParticipants, setDiscordParticipants] = useState([]);

  useEffect(() => {
    // Skip Discord integration if SDK isn't available
    if (!DiscordSDK) {
      console.log('Discord SDK not available - skipping integration');
      return;
    }

    // Check if we're in an environment where Discord SDK can work
    const isDiscordEnvironment = 
      window.discord || 
      window.__DISCORD__ || 
      window.location.hostname.includes('discord.com');
    
    if (!isDiscordEnvironment) {
      console.log('Not running in Discord environment - skipping SDK initialization');
      
      // Initialize Rich Presence if we're not in Discord
      // This is for standalone web app usage
      try {
        richPresenceService.initialize().then(() => {
          console.log('Rich Presence initialized successfully');
        }).catch(error => {
          console.warn('Could not initialize Rich Presence:', error);
        });
      } catch (error) {
        console.warn('Rich Presence initialization error:', error);
      }
      
      return;
    }

    // Initialize Discord Activity SDK
    const initDiscord = async () => {
      try {
        setDiscordStatus('connecting');
        console.log('Initializing Discord Activity SDK...');
        
        // Initialize Discord Activity SDK through our service
        const success = await discordService.initializeActivitySDK();
        
        if (success) {
          setDiscordStatus('connected');
          console.log('✅ Discord Activity SDK initialized successfully');
          
          // Set up event listeners for Discord Activity events
          window.addEventListener('discord:participants-changed', (event) => {
            setDiscordParticipants(event.detail.participants);
          });
          
          window.addEventListener('discord:activity-state-changed', (event) => {
            console.log('Activity state changed:', event.detail.state);
          });
        } else {
          setDiscordStatus('limited');
          console.log('⚠️ Discord SDK initialized with limited functionality');
        }
      } catch (err) {
        console.error('❌ Discord SDK init failed:', err);
        setDiscordStatus('failed');
        // App continues to work even with Discord failure
      }
    };

    initDiscord();
    
    // Cleanup function
    return () => {
      window.removeEventListener('discord:participants-changed', () => {});
      window.removeEventListener('discord:activity-state-changed', () => {});
      
      // Clean up Rich Presence when component unmounts
      richPresenceService.destroy();
    };
  }, []);

  // Pass Discord status and participants to App
  return <App 
    discordStatus={discordStatus} 
    discordParticipants={discordParticipants} 
  />;
}

// Handle rendering errors at the root level
const rootElement = document.getElementById('root');

try {
  createRoot(rootElement).render(
    <StrictMode>
      <RootApp />
    </StrictMode>
  );
} catch (err) {
  console.error('Failed to render application:', err);
  // Fallback error display
  rootElement.innerHTML = `
    <div style="color: red; padding: 20px; text-align: center;">
      <h1>Application Error</h1>
      <p>${err.message}</p>
      <button onclick="location.reload()">Reload</button>
    </div>
  `;
}
