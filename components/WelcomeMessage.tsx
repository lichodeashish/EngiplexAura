
import React from 'react';
import { ChatMessage } from '../types';
import { AuraIcon, SparklesIcon } from './icons';

interface WelcomeMessageProps {
  message: ChatMessage;
  onSuggestionClick: (suggestion: string) => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ message, onSuggestionClick }) => {
  const [greeting, subtitle, ...suggestions] = message.text.split('---').map(s => s.trim());

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 dark:text-gray-400">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-blue-500/30 dark:border-blue-500/50 mb-6 transition-colors duration-300">
        <AuraIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-200 mb-2">Welcome to ENGIPLEX AURA</h1>
      <p className="text-base sm:text-lg mb-8">{greeting}</p>
      
      <div className="w-full max-w-2xl animate-fade-in">
        <p className="mb-4 text-gray-700 dark:text-gray-300">{subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50/70 dark:hover:bg-gray-700/70 p-4 rounded-lg text-left transition-all duration-200 border border-gray-300 dark:border-gray-700/50 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;