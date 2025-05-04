import React, { createContext, useState, useEffect, useContext } from 'react';
import discordAuthService from '../services/DiscordAuthService';

// Create a context for Discord authentication
const DiscordAuthContext = createContext();

// Custom hook to use the Discord auth context
export const useDiscordAuth = () => {
  const context = useContext(DiscordAuthContext);
  if (!context) {
    throw new Error('useDiscordAuth must be used within a DiscordAuthProvider');
  }
  return context;
};

// Discord Auth Provider component
export const DiscordAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Initialize Discord auth service on component mount
  useEffect(() => {
    const initDiscordAuth = async () => {
      try {
        setIsLoading(true);
        await discordAuthService.initialize();
        
        // Check if we're on the callback page
        if (window.location.pathname === '/callback') {
          await handleCallback();
        }
        
        // Check if we're authenticated
        if (discordAuthService.authState === 'authenticated') {
          setIsAuthenticated(true);
          try {
            const profile = await discordAuthService.getProfile();
            setUser(profile);
          } catch (err) {
            console.error('Failed to get user profile:', err);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Discord auth:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    initDiscordAuth();
  }, []);
  
  // Handle OAuth callback
  const handleCallback = async () => {
    try {
      await discordAuthService.handleCallback(window.location.href);
      setIsAuthenticated(true);
      
      // Get user profile
      const profile = await discordAuthService.getProfile();
      setUser(profile);
      
      // Redirect to home page
      window.history.replaceState({}, document.title, '/');
    } catch (err) {
      console.error('Failed to handle callback:', err);
      setError(err.message);
      
      // Redirect to home page
      window.history.replaceState({}, document.title, '/');
    }
  };
  
  // Login with Discord
  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await discordAuthService.linkAccount();
      setIsAuthenticated(true);
      
      // Get user profile
      const profile = await discordAuthService.getProfile();
      setUser(profile);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to login with Discord:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      await discordAuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to logout:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    logout,
    isDiscordEnvironment: discordAuthService.isDiscordEnvironment
  };

  return (
    <DiscordAuthContext.Provider value={value}>
      {children}
    </DiscordAuthContext.Provider>
  );
};

export default DiscordAuthContext;
