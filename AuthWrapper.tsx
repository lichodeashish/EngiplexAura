import React, { useState, useEffect } from 'react';
import App from './App';
import AuthPage from './components/AuthPage';

const AuthWrapper: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for session in localStorage on initial load
    const session = localStorage.getItem('user-session');
    if (session) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    // Mock session by setting a value in localStorage
    localStorage.setItem('user-session', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user-session');
    // We can also clear other app-specific data here if needed
    // localStorage.removeItem('chatSessions');
    // localStorage.removeItem('activeSessionId');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    // Return a blank screen or a loader while checking auth status
    return <div className="w-screen h-screen bg-gray-100 dark:bg-gray-900" />;
  }

  return isAuthenticated 
    ? <App onLogout={handleLogout} /> 
    : <AuthPage onLogin={handleLogin} />;
};

export default AuthWrapper;