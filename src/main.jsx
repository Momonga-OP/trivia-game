import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Import the Discord SDK
import DiscordSDK from '@discord/embedded-app-sdk';

const discordSdk = new DiscordSDK('1367687677092167770');

function RootApp() {
  useEffect(() => {
    const initDiscord = async () => {
      try {
        await discordSdk.ready(); // Wait for SDK to be ready
        const { code } = await discordSdk.commands.authorize({
          client_id: '1367687677092167770',
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify', 'guilds'],
        });

        await discordSdk.commands.authenticate({ code });
        console.log('✅ Discord SDK initialized successfully.');
      } catch (err) {
        console.error('❌ Discord SDK init failed:', err);
      }
    };

    initDiscord();
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
