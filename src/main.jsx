import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
// Import Font Awesome library setup first
import './utils/fontAwesome';
// Then explicitly import Font Awesome CSS after config
import '@fortawesome/fontawesome-svg-core/styles.css';
// Apply FontAwesome styles manually for Discord compatibility
import './styles/fontawesome-fix.css';

// Try to import the Discord SDK - this won't crash if the package isn't installed
let DiscordSDK;
try {
  const discord = require('@discord/embedded-app-sdk');
  DiscordSDK = discord.DiscordSDK;
} catch (err) {
  console.warn('Discord SDK not available:', err.message);
}

function RootApp() {
  // Track Discord connection status
  const [discordStatus, setDiscordStatus] = useState('idle');

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
      return;
    }

    const discordSdk = new DiscordSDK('1367687677092167770');
    
    const initDiscord = async () => {
      try {
        setDiscordStatus('connecting');
        console.log('Initializing Discord SDK...');
        
        // Wait for SDK to be ready with timeout
        const readyPromise = discordSdk.ready();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Discord SDK ready timeout')), 5000)
        );
        
        await Promise.race([readyPromise, timeoutPromise]);
        
        // Attempt authorization with fallback
        try {
          const { code } = await discordSdk.commands.authorize({
            client_id: '1367687677092167770',
            response_type: 'code',
            state: '',
            prompt: 'none', // Don't force login prompt
            scope: ['identify', 'guilds'],
          });

          await discordSdk.commands.authenticate({ code });
          console.log('✅ Discord SDK authenticated successfully');
        } catch (authErr) {
          console.warn('Discord authentication skipped:', authErr.message);
          // Continue app execution even without authentication
        }
        
        setDiscordStatus('connected');
        console.log('✅ Discord SDK initialized successfully');
      } catch (err) {
        console.error('❌ Discord SDK init failed:', err);
        setDiscordStatus('failed');
        // App continues to work even with Discord failure
      }
    };

    initDiscord();
    
    // Cleanup function
    return () => {
      // Any cleanup needed for Discord SDK
    };
  }, []);

  // App now manages its own Discord status internally
  return <App />;
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
    <div style="color: red; padding: 20px;">
      <h2>Application Error</h2>
      <p>${err.message}</p>
      <p>Please refresh the page or contact support if the issue persists.</p>
    </div>
  `;
}
