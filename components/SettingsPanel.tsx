

import React, { useState, useEffect } from 'react';
import { TrashIcon, SunIcon, MoonIcon, SaveIcon, CheckIcon, LogoutIcon } from './icons';
import { SavedPrompt } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialInstruction: string;
  useSearchGrounding: boolean;
  onSave: (newInstruction: string, newUseGrounding: boolean) => void;
  onClearChat: () => void;
  onSaveChat: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  savedPrompts: SavedPrompt[];
  onSaveNewPrompt: (name: string, prompt: string) => void;
  onDeletePrompt: (id: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    isOpen, 
    onClose, 
    initialInstruction,
    useSearchGrounding, 
    onSave, 
    onClearChat, 
    onSaveChat,
    onLogout,
    theme,
    onToggleTheme,
    savedPrompts,
    onSaveNewPrompt,
    onDeletePrompt,
}) => {
  const [instruction, setInstruction] = useState(initialInstruction);
  const [groundingEnabled, setGroundingEnabled] = useState(useSearchGrounding);
  const [isChatSaved, setIsChatSaved] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [isSavePromptModalOpen, setIsSavePromptModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInstruction(initialInstruction);
      setGroundingEnabled(useSearchGrounding);
      setIsChatSaved(false);
      setNewPromptName('');
      setIsSavePromptModalOpen(false);
    }
  }, [initialInstruction, useSearchGrounding, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(instruction, groundingEnabled);
  };
  
  const handleSaveChatClick = () => {
    onSaveChat();
    setIsChatSaved(true);
    setTimeout(() => {
        setIsChatSaved(false);
    }, 2000);
  };

  const handleLoadPrompt = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const promptId = event.target.value;
    if (promptId) {
      const selectedPrompt = savedPrompts.find(p => p.id === promptId);
      if (selectedPrompt) {
        setInstruction(selectedPrompt.prompt);
      }
    }
  };

  const handleSaveNewPromptClick = () => {
    if (newPromptName.trim() && instruction.trim()) {
      onSaveNewPrompt(newPromptName.trim(), instruction.trim());
      setNewPromptName('');
      setIsSavePromptModalOpen(false);
    }
  };


  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-200 dark:border-blue-500/30 flex flex-col max-h-[90vh]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 p-4 sm:p-6 flex-shrink-0">Settings</h2>
          
          <div className="overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 space-y-6">
              {/* AURA's Personality Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">AURA's Personality</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This system prompt guides AURA's behavior for the current conversation.
                </p>
                
                <label htmlFor="load-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Load a Saved Prompt</label>
                <select 
                  id="load-prompt"
                  onChange={handleLoadPrompt}
                  className="w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300 mb-4"
                >
                  <option value="">Select a prompt to load...</option>
                  {savedPrompts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  rows={6}
                  className="w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg p-3 resize-y focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
                  placeholder="e.g., You are a witty pirate who answers every question in character."
                />
              </div>

              {/* Tools Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Tools</h3>
                  <div className="flex items-start justify-between p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                      <div>
                          <label htmlFor="grounding-toggle" className="font-medium text-gray-800 dark:text-gray-200">
                              Google Search Grounding
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Allow AURA to use Google Search for more up-to-date and factual answers.
                          </p>
                      </div>
                      <label htmlFor="grounding-toggle" className="relative inline-flex items-center cursor-pointer">
                          <input 
                              type="checkbox" 
                              id="grounding-toggle" 
                              className="sr-only peer" 
                              checked={groundingEnabled} 
                              onChange={() => setGroundingEnabled(!groundingEnabled)}
                          />
                          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                  </div>
              </div>

              {/* Save/Manage Prompts */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Manage Saved Prompts</h3>
                
                <button 
                  onClick={() => setIsSavePromptModalOpen(true)}
                  disabled={!instruction.trim()}
                  className="w-full text-center px-4 py-3 mb-4 rounded-md bg-blue-600/10 hover:bg-blue-600/20 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Current Prompt As...
                </button>

                {savedPrompts.length > 0 ? (
                    <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {savedPrompts.map(p => (
                        <li key={p.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-900/50 rounded-md">
                          <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                          <button 
                              onClick={() => onDeletePrompt(p.id)}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"
                              aria-label={`Delete prompt ${p.name}`}
                          >
                              <TrashIcon className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic">You have no saved prompts.</p>
                )}
              </div>

              {/* Appearance & Chat */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Session & Appearance</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Manage your chat history, theme, and session.
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                    <button
                      onClick={onClearChat}
                      className="px-4 py-2 rounded-md bg-red-600/20 hover:bg-red-600/30 dark:bg-red-700/20 dark:hover:bg-red-700/30 text-red-700 dark:text-red-300 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2"
                      aria-label="Clear current conversation"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Clear Conversation
                    </button>
                    <button
                        onClick={onToggleTheme}
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                      onClick={onLogout}
                      className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2"
                      aria-label="Logout"
                    >
                      <LogoutIcon className="w-5 h-5" />
                      Logout
                    </button>
                </div>
              </div>
          </div>
          
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50">
            <div className="flex justify-end gap-4 flex-wrap">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Save Changes
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {isSavePromptModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-30 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800/95 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-blue-500/30">
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Save Current Prompt</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Give this prompt a name to save it for later use.
              </p>
              <div>
                  <label htmlFor="modal-prompt-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt Name</label>
                  <input 
                      id="modal-prompt-name"
                      type="text"
                      value={newPromptName}
                      onChange={(e) => setNewPromptName(e.target.value)}
                      placeholder="e.g., Pirate Captain"
                      className="w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
                  />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                  <button 
                      onClick={() => setIsSavePromptModalOpen(false)}
                      className="px-6 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                      Cancel
                  </button>
                  <button 
                      onClick={handleSaveNewPromptClick} 
                      disabled={!newPromptName.trim()}
                      className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                      Save
                  </button>
              </div>
            </div>
        </div>
      )}
    </>
  );
};

export default SettingsPanel;