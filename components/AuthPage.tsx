
import React, { useState } from 'react';
import { AuraIcon } from './icons';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for a more realistic UX
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (isSignUp) {
          // --- Sign Up Logic ---
          if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
          }
          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters long.");
          }

          const existingUser = users.find((user: any) => user.email === email);
          if (existingUser) {
            throw new Error("An account with this email already exists.");
          }
          
          // NOTE: In a real backend, the password would be hashed with bcrypt here.
          const newUser = { email, password };
          const updatedUsers = [...users, newUser];
          localStorage.setItem('users', JSON.stringify(updatedUsers));
          
          // Successfully signed up, now log in.
          onLogin();

        } else {
          // --- Sign In Logic ---
          const user = users.find((user: any) => user.email === email);
          if (!user || user.password !== password) {
            throw new Error("Invalid email or password.");
          }
          
          // Successfully signed in.
          onLogin();
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center auth-bg p-4">
      <div className="auth-card-wrapper w-full max-w-sm">
        <div className="auth-card-content bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl text-white">
          <div className="text-center p-6 border-b border-white/10">
            <AuraIcon className="w-10 h-10 text-white mx-auto mb-3" />
            <h1 className="text-2xl font-bold">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h1>
            <p className="text-gray-400 mt-2 text-sm">
              {isSignUp ? 'Join ENGIPLEX AURA to continue.' : 'Sign in to access ENGIPLEX AURA.'}
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {isSignUp && (
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}
              
              {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="px-4 py-2 rounded-md text-sm font-semibold text-blue-300 bg-transparent border border-blue-500/50 hover:bg-blue-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {isSignUp ? 'Sign In' : 'Register'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (isSignUp ? 'Sign Up' : 'Login')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
