

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { UserIcon, AuraIcon, CopyIcon, CheckIcon, ErrorIcon, SearchIcon, DownloadIcon } from './icons';

declare const marked: any;

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.author === MessageAuthor.USER;
  const isModel = message.author === MessageAuthor.MODEL;
  const isError = message.isError;
  const contentRef = useRef<HTMLDivElement>(null);

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isModel && !isError && !message.imageUrl && contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll('pre');
      
      codeBlocks.forEach(block => {
        if (block.parentElement?.classList.contains('relative')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'relative group';
        block.parentNode?.insertBefore(wrapper, block);
        wrapper.appendChild(block);

        const button = document.createElement('button');
        button.className = 'code-copy-btn absolute top-2 right-2 p-1.5 bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-400 dark:hover:bg-gray-700';
        button.setAttribute('aria-label', 'Copy code');
        
        const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"></path></svg>`;
        
        button.innerHTML = copyIconSVG;

        let copyTimeout: number;

        button.addEventListener('click', () => {
            const code = block.querySelector('code')?.innerText || '';
            navigator.clipboard.writeText(code).then(() => {
                const checkWithText = `<div class="flex items-center gap-1 text-xs font-semibold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg><span>Copied</span></div>`;
                button.innerHTML = checkWithText;
                button.className += ' bg-green-600 text-white px-2 py-1';
                
                window.clearTimeout(copyTimeout);
                copyTimeout = window.setTimeout(() => {
                    button.innerHTML = copyIconSVG;
                    button.className = 'code-copy-btn absolute top-2 right-2 p-1.5 bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-400 dark:hover:bg-gray-700';
                }, 2000);
            });
        });

        wrapper.appendChild(button);
      });
    }
  }, [message.text, isModel, isError, message.imageUrl]);

  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(message.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => console.error('Failed to copy text: ', err));
  };
  
  const createFilename = (prefix: string) => {
     return `${prefix}-${message.text.substring(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated'}`;
  }

  const handleImageDownload = () => {
    if (!message.imageUrl) return;
    const link = document.createElement('a');
    link.href = message.imageUrl;
    link.download = `${createFilename('aura-image')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createMarkup = () => {
    if (typeof marked !== 'undefined') {
      marked.setOptions({ breaks: true, gfm: true });
      return { __html: marked.parse(message.text || '') };
    }
    return { __html: (message.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;") };
  };

  const renderGroundingChunks = () => {
    if (!isModel || !message.groundingChunks || message.groundingChunks.length === 0) return null;
    const validChunks = message.groundingChunks.filter(chunk => chunk.web && chunk.web.uri && chunk.web.title);
    if (validChunks.length === 0) return null;

    return (
      <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <SearchIcon className="w-4 h-4" />
          <span>Sources</span>
        </h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          {validChunks.map((chunk, index) => (
            <li key={index} className="truncate">
              <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" title={chunk.web.title} className="text-blue-600 dark:text-blue-400 hover:underline">
                {chunk.web.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  const renderContent = () => {
    if (isModel && !isError) {
      if (message.imageUrl) {
        return (
          <div className="relative group">
            <img src={message.imageUrl} alt={message.text} className="rounded-lg max-w-full sm:max-w-sm" />
            <button onClick={handleImageDownload} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Download image">
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
        );
      }
      return <div ref={contentRef} className="markdown-content" dangerouslySetInnerHTML={createMarkup()} />;
    }
    
    // For user messages and errors
    return (
        <div className="flex flex-col gap-3">
            {message.uploadedImage && (
                <img src={message.uploadedImage} alt="User upload" className="rounded-lg max-w-full sm:max-w-xs" />
            )}
            {message.text && <p>{message.text}</p>}
        </div>
    );
  };

  return (
    <div className={`flex items-start gap-4 my-4 animate-fade-in ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {isError ? <ErrorIcon className="w-5 h-5 text-red-500 dark:text-red-400" /> : <AuraIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
        </div>
      )}
      <div
        className={`relative group max-w-xl p-4 rounded-lg shadow-md transition-colors duration-300 ${
          isUser
            ? 'bg-blue-600 dark:bg-blue-800 text-white rounded-br-none'
            : isError
            ? 'bg-red-100 dark:bg-gray-700 text-red-800 dark:text-red-200 rounded-bl-none border border-red-300 dark:border-red-500/50'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
        } ${isUser || isError ? 'whitespace-pre-wrap' : ''}`}
      >
        {isError && <p className="font-bold text-red-700 dark:text-red-300 mb-2">Error</p>}
        
        {renderContent()}

        {renderGroundingChunks()}

        {message.text && !isError && !message.imageUrl && (
          <div className={`absolute bottom-1 ${isUser ? 'left-1' : 'right-1'}`}>
            <button
              onClick={handleCopy}
              className={`rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isCopied 
                  ? 'bg-green-600 text-white px-2 py-1.5'
                  : `p-1.5 bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 ${isUser ? 'hover:bg-blue-500 dark:hover:bg-blue-600' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}`
              }
              aria-label={isCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
            >
              {isCopied ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <CheckIcon className="w-4 h-4" />
                  <span>Copied</span>
                </div>
              ) : (
                <CopyIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default ChatMessageComponent;