
import React, { useRef, useEffect } from 'react';
import { SendIcon, ImageIcon, SparklesIcon, UploadIcon, CloseIcon } from './icons';
import { ImageAspectRatio } from '../types';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  mode: 'chat' | 'image';
  onModeChange: (mode: 'chat' | 'image') => void;
  aspectRatio: ImageAspectRatio;
  setAspectRatio: (ratio: ImageAspectRatio) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedImagePreview: string | null;
  onRemoveFile: () => void;
}

const imageAspectRatioOptions: { value: ImageAspectRatio; label: string }[] = [
    { value: '1:1', label: 'Square' },
    { value: '16:9', label: 'Landscape' },
    { value: '9:16', label: 'Portrait' },
    { value: '4:3', label: 'Wide' },
    { value: '3:4', label: 'Tall' },
];

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading,
  mode,
  onModeChange,
  aspectRatio,
  setAspectRatio,
  onFileUpload,
  uploadedImagePreview,
  onRemoveFile,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitDisabled) {
        onSubmit(e as any);
      }
    }
  };
  
  const getPlaceholderText = () => {
    if (uploadedImagePreview) {
        switch(mode) {
            case 'image': return 'Describe the edits for the image...';
            case 'chat':
            default: return 'Ask a question about the image...';
        }
    }
    switch(mode) {
        case 'image': return 'Describe an image to generate...';
        case 'chat':
        default: return 'Message ENGIPLEX AURA...';
    }
  }
  
  const isSubmitDisabled = isLoading || (!input.trim() && !uploadedImagePreview);

  return (
    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-2 sm:p-4 border-t border-gray-200 dark:border-blue-500/30 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Conditional controls based on mode */}
        {mode === 'image' && (
            <div className="flex items-center justify-center flex-wrap gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-full">
                {imageAspectRatioOptions.map(option => (
                    <button key={option.value} type="button" onClick={() => setAspectRatio(option.value)} disabled={isLoading}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        aspectRatio === option.value ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        aria-label={`Set aspect ratio to ${option.label}`}>
                        {option.label}
                    </button>
                ))}
            </div>
        )}

        {/* Media Previews */}
        <div className="flex gap-2">
            {uploadedImagePreview && (
                 <div className="relative w-24 h-24 rounded-lg overflow-hidden self-start">
                    <img src={uploadedImagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                        onClick={onRemoveFile}
                        disabled={isLoading}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Remove uploaded file"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>

        {/* Main Input Form */}
        <form onSubmit={onSubmit} className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-2 self-end">
              <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-full">
                  {['chat', 'image'].map(m => (
                      <button key={m} type="button" onClick={() => onModeChange(m as any)} disabled={isLoading}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${mode === m ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                          aria-label={`Switch to ${m} mode`}>
                          {m === 'chat' && <SparklesIcon className="w-4 h-4" />}
                          {m === 'image' && <ImageIcon className="w-4 h-4" />}
                          <span className="capitalize">{m}</span>
                      </button>
                  ))}
              </div>
          </div>

          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={getPlaceholderText()}
            rows={1} disabled={isLoading} className="flex-grow bg-gray-200 text-gray-800 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 max-h-48 min-w-0"
          />

          <div className="flex self-end gap-3">
            <input type="file" ref={fileInputRef} onChange={onFileUpload} accept="image/*" className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="flex-shrink-0 w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <UploadIcon className="w-6 h-6" />
            </button>
            
            <button type="submit" disabled={isSubmitDisabled}
              className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none" aria-label="Send message">
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;