import React from 'react';
import { SettingsIcon, HistoryIcon, AuraIcon } from './icons';

interface HeaderProps {
  onToggleSettings: () => void;
  onToggleHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSettings, onToggleHistory }) => {
  return (
    <header className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-blue-500/30 fixed top-0 left-0 right-0 z-10 flex items-center justify-between transition-colors duration-300">
      <button 
        onClick={onToggleHistory}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Open chat history"
      >
        <HistoryIcon className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <AuraIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">
          ENGIPLEX AURA
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleSettings}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;