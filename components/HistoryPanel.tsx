
import React, { useState, useMemo } from 'react';
import { ChatSession } from '../types';
import { PlusIcon, ChatBubbleIcon, TrashIcon, CloseIcon, SearchIcon } from './icons';

interface HistoryPanelProps {
  isOpen: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  sessions,
  activeSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const sortedSessions = useMemo(() => 
    [...sessions].sort((a, b) => b.lastUpdated - a.lastUpdated),
    [sessions]
  );

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) {
      return sortedSessions;
    }
    const query = searchQuery.toLowerCase();
    return sortedSessions.filter(session => {
      const titleMatch = session.title.toLowerCase().includes(query);
      if (titleMatch) return true;
      const messageMatch = session.messages.some(msg => 
        msg.text && !msg.isWelcomeMessage && msg.text.toLowerCase().includes(query)
      );
      return messageMatch;
    });
  }, [sortedSessions, searchQuery]);

  return (
    <div className={`
      absolute lg:relative h-full z-40 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    `}>
      <div 
        className={`fixed inset-0 bg-black/30 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside className={`relative flex flex-col h-full w-4/5 sm:w-72 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-blue-500/20 z-40`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-blue-500/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">History</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Close history panel"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-2 flex-shrink-0">
          <button 
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <PlusIcon className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="px-2 pb-2 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
            />
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length > 0 ? (
            filteredSessions.map(session => (
              <div key={session.id} className="group relative">
                <button
                  onClick={() => onSelectChat(session.id)}
                  className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    activeSessionId === session.id 
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <ChatBubbleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="truncate flex-1">{session.title}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(session.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label={`Delete chat "${session.title}"`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 px-4 py-8">No chats found.</p>
          )}
        </nav>
      </aside>
    </div>
  );
};

export default HistoryPanel;