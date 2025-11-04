import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sendMessageStream, generateImage, editImage } from './services/geminiService';
import Header from './components/Header';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import SettingsPanel from './components/SettingsPanel';
import HistoryPanel from './components/HistoryPanel';
import { ChatMessage, MessageAuthor, SavedPrompt, ImageAspectRatio, ChatSession } from './types';

interface AppProps {
  onLogout: () => void;
}

const DEFAULT_SYSTEM_INSTRUCTION = `You are ENGIPLEX AURA, a sophisticated and helpful AI assistant. Your personality is a blend of professional, knowledgeable, and slightly futuristic. You provide clear, concise, and accurate information. You should sound elegant and intelligent. Do not use emojis.`;

const WELCOME_MESSAGE_TEXT = `Greetings. I am ENGIPLEX AURA. How may I assist you today?
---
Here are a few things you can try:
---
Brainstorm names for a new coffee brand
---
Explain the theory of relativity in simple terms
---
Write a Python script to sort a list of files
---
Write a short story about a robot who discovers music
---
Help me debug a CSS layout issue`;

const createWelcomeMessage = (): ChatMessage => ({
    id: 'initial-message-' + Date.now(),
    author: MessageAuthor.MODEL,
    text: WELCOME_MESSAGE_TEXT,
    isWelcomeMessage: true,
});

const createNewSession = (
    instruction = DEFAULT_SYSTEM_INSTRUCTION, 
    useGrounding = false
): ChatSession => ({
    id: `session-${Date.now()}`,
    title: "New Chat",
    lastUpdated: Date.now(),
    messages: [createWelcomeMessage()],
    systemInstruction: instruction,
    useSearchGrounding: useGrounding,
});

type Theme = 'light' | 'dark';
type Mode = 'chat' | 'image';

const App: React.FC<AppProps> = ({ onLogout }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [mode, setMode] = useState<Mode>('chat');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; forDisplay: string } | null>(null);

  // Derived state for the active session
  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);
  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession]);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load initial data and handle migration from old format
  useEffect(() => {
    const savedPromptsRaw = localStorage.getItem('savedPrompts');
    if (savedPromptsRaw) setSavedPrompts(JSON.parse(savedPromptsRaw));

    const savedSessionsRaw = localStorage.getItem('chatSessions');
    if (savedSessionsRaw) {
      const savedSessions = JSON.parse(savedSessionsRaw);
      setSessions(savedSessions);
      const savedActiveId = localStorage.getItem('activeSessionId');
      setActiveSessionId(savedActiveId && savedSessions.some((s: ChatSession) => s.id === savedActiveId) ? savedActiveId : savedSessions[0]?.id || null);
    } else {
      // Migration from old single-chat format
      const oldHistoryRaw = localStorage.getItem('chatHistory');
      const oldInstruction = localStorage.getItem('systemInstruction');
      const oldGrounding = localStorage.getItem('useSearchGrounding') === 'true';
      if (oldHistoryRaw) {
        const oldMessages = JSON.parse(oldHistoryRaw);
        const migratedSession = createNewSession(oldInstruction || DEFAULT_SYSTEM_INSTRUCTION, oldGrounding);
        migratedSession.messages = oldMessages;
        if (oldMessages.length > 1 && oldMessages[1].author === MessageAuthor.USER) {
            migratedSession.title = oldMessages[1].text.substring(0, 40) + '...';
        }
        setSessions([migratedSession]);
        setActiveSessionId(migratedSession.id);
        // Clean up old local storage items
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('systemInstruction');
        localStorage.removeItem('useSearchGrounding');
        localStorage.removeItem('chatInputDraft');
      } else {
        // No old data, start fresh
        const newSession = createNewSession();
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      }
    }
  }, []);

  // Save sessions to local storage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
    if (activeSessionId) {
      localStorage.setItem('activeSessionId', activeSessionId);
    }
  }, [sessions, activeSessionId]);

  const updateActiveSession = (updater: (draft: ChatSession) => ChatSession) => {
    setSessions(currentSessions =>
      currentSessions.map(session => {
        if (session.id === activeSessionId) {
          const updatedSession = updater({ ...session });
          updatedSession.lastUpdated = Date.now();
          return updatedSession;
        }
        return session;
      })
    );
  };

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions(prevSessions => [...prevSessions, newSession]);
    setActiveSessionId(newSession.id);
    setIsHistoryOpen(false);
    setMode('chat');
  };

  const handleSelectChat = (id: string) => {
    setActiveSessionId(id);
    setIsHistoryOpen(false);
    setMode('chat');
  };

  const handleDeleteChat = useCallback((id: string) => {
    let newActiveId = activeSessionId;
    const sessionsCopy = [...sessions];
    const sessionIndex = sessionsCopy.findIndex(s => s.id === id);
    if (sessionIndex === -1) return;

    sessionsCopy.splice(sessionIndex, 1);

    if (id === activeSessionId) {
      if (sessionsCopy.length > 0) {
        const nextIndex = Math.max(0, sessionIndex - 1);
        newActiveId = sessionsCopy[nextIndex].id;
      } else {
        const newSession = createNewSession();
        sessionsCopy.push(newSession);
        newActiveId = newSession.id;
      }
    }
    
    setSessions(sessionsCopy);
    setActiveSessionId(newActiveId);
  }, [sessions, activeSessionId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        const displayUrl = URL.createObjectURL(file);
        setUploadedImage({ data: base64Data, mimeType: file.type, forDisplay: displayUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage.forDisplay);
    }
    setUploadedImage(null);
  };

  const submitMessage = async (messageText: string) => {
    if (!activeSession) return;

    setIsLoading(true);
    handleRemoveFile();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: MessageAuthor.USER,
      text: messageText,
      uploadedImage: uploadedImage?.forDisplay,
    };
    
    const isNewChat = activeSession.messages.length === 1 && activeSession.messages[0].isWelcomeMessage;

    updateActiveSession(session => {
        // If it's a new chat, replace the welcome message with the user's message.
        // Otherwise, append the user's message to the existing history.
        const updatedMessages = isNewChat ? [userMessage] : [...session.messages, userMessage];
        const newTitle = isNewChat ? (messageText.substring(0, 40) || 'Untitled Chat') : session.title;
        return { ...session, messages: updatedMessages, title: newTitle };
    });
    
    try {
      if (mode === 'image') {
        const promise = uploadedImage 
            ? editImage(messageText, uploadedImage)
            : generateImage(messageText, aspectRatio);
        
        const imageUrl = await promise;
        const modelMessage: ChatMessage = {
            id: `model-${Date.now()}`,
            author: MessageAuthor.MODEL,
            text: messageText,
            imageUrl: imageUrl,
        };
        updateActiveSession(session => ({ ...session, messages: [...session.messages, modelMessage] }));
      } else { // 'chat' mode
        const stream = await sendMessageStream(messages, messageText, activeSession.systemInstruction, activeSession.useSearchGrounding, uploadedImage ?? undefined);
        
        const initialModelMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          author: MessageAuthor.MODEL,
          text: '',
        };

        // Add the empty message bubble initially
        setSessions(currentSessions => currentSessions.map(s => 
          s.id === activeSessionId 
            ? { ...s, messages: [...s.messages, initialModelMessage] } 
            : s
        ));
        
        // Stream the response and update only the last message efficiently
        for await (const chunk of stream) {
          setSessions(currentSessions => currentSessions.map(s => {
            if (s.id === activeSessionId) {
              const lastMessage = s.messages[s.messages.length - 1];
              const updatedLastMessage = {
                ...lastMessage,
                text: lastMessage.text + chunk.text,
                groundingChunks: chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || lastMessage.groundingChunks,
              };
              return { ...s, messages: [...s.messages.slice(0, -1), updatedLastMessage] };
            }
            return s;
          }));
        }

        // Final update to set the `lastUpdated` timestamp
        setSessions(currentSessions => currentSessions.map(s => 
          s.id === activeSessionId ? { ...s, lastUpdated: Date.now() } : s
        ));
      }
    } catch (e: any) {
      console.error("Error submitting message:", e);
      let errorMessage = "An unexpected error occurred.";
      if (typeof e.message === 'string') {
          if (e.message.includes('API key not valid')) {
              errorMessage = "Invalid API Key: Please check your API key in the settings.";
          } else if (e.message.includes('rate limit')) {
              errorMessage = "Rate Limit Exceeded: Please wait a moment and try again.";
          } else if (e.message.includes('Image generation failed')) {
              errorMessage = `Image Generation Error: ${e.message}`;
          } else if (e.message.includes('429')) {
             errorMessage = "Too Many Requests: You're sending requests too quickly. Please wait a bit before trying again.";
          } else {
              errorMessage = e.message;
          }
      }
      const errorResponse: ChatMessage = {
        id: `error-${Date.now()}`,
        author: MessageAuthor.MODEL,
        text: errorMessage,
        isError: true,
      };
      updateActiveSession(session => ({ ...session, messages: [...session.messages, errorResponse] }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    submitMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    submitMessage(suggestion);
    setInput('');
  };
  
  const isSubmitDisabled = isLoading || (!input.trim() && !uploadedImage);

  const handleSettingsSave = (newInstruction: string, newUseGrounding: boolean) => {
      updateActiveSession(session => ({ 
        ...session, 
        systemInstruction: newInstruction,
        useSearchGrounding: newUseGrounding 
      }));
      setIsSettingsOpen(false);
  };
  
  const handleClearChat = () => {
    if (activeSession) {
      updateActiveSession(session => ({
        ...session,
        messages: [createWelcomeMessage()],
        title: session.title.startsWith("New Chat") ? "New Chat" : session.title,
      }));
    }
  };
  
  const handleSaveChat = () => {
    // This is now handled automatically by the useEffect hook.
    // This function remains to provide feedback if needed.
    console.log("Chat saved automatically.");
  };

  const handleSaveNewPrompt = (name: string, prompt: string) => {
    const newPrompt: SavedPrompt = { id: `prompt-${Date.now()}`, name, prompt };
    const updatedPrompts = [...savedPrompts, newPrompt];
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
  };

  const handleDeletePrompt = (id: string) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
  };
  
  const handleToggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans overflow-hidden">
      <HistoryPanel
        isOpen={isHistoryOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onClose={() => setIsHistoryOpen(false)}
      />
      <div className="flex flex-col flex-1">
        <Header onToggleSettings={() => setIsSettingsOpen(true)} onToggleHistory={() => setIsHistoryOpen(true)} />
        <main className="flex-1 flex flex-col pt-16 overflow-hidden">
          <ChatHistory messages={messages} isLoading={isLoading} onSuggestionClick={handleSuggestionClick} mode={mode} />
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode={mode}
            onModeChange={setMode}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            onFileUpload={handleFileUpload}
            uploadedImagePreview={uploadedImage?.forDisplay || null}
            onRemoveFile={handleRemoveFile}
          />
        </main>
      </div>
      {activeSession && (
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialInstruction={activeSession.systemInstruction}
          useSearchGrounding={activeSession.useSearchGrounding}
          onSave={handleSettingsSave}
          onClearChat={handleClearChat}
          onSaveChat={handleSaveChat}
          onLogout={onLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          savedPrompts={savedPrompts}
          onSaveNewPrompt={handleSaveNewPrompt}
          onDeletePrompt={handleDeletePrompt}
        />
      )}
    </div>
  );
};

export default App;