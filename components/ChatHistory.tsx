import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import ChatMessageComponent from './ChatMessage';
import WelcomeMessage from './WelcomeMessage';
import { AuraIcon } from './icons';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: string) => void;
  mode: 'chat' | 'image';
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, onSuggestionClick, mode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const isWelcomeState = messages.length === 1 && messages[0].isWelcomeMessage;

  const getLoadingMessage = () => {
      switch(mode) {
          case 'image':
              return <p className="text-sm font-semibold">Generating image...</p>;
          case 'chat':
          default:
              return (
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              );
      }
  }

  return (
    <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto">
      {isWelcomeState ? (
        <WelcomeMessage 
          message={messages[0]}
          onSuggestionClick={onSuggestionClick}
        />
      ) : (
        messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))
      )}
      {isLoading && !isWelcomeState && messages[messages.length - 1]?.author === 'user' && (
         <div className="flex items-start gap-4 my-4 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <AuraIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-pulse" />
            </div>
            <div className="max-w-xl p-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                {getLoadingMessage()}
            </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
