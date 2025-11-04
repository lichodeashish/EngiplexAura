export enum MessageAuthor {
  USER = 'user',
  MODEL = 'model',
}

export type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  isError?: boolean;
  isWelcomeMessage?: boolean;
  groundingChunks?: { web: { uri: string; title: string } }[];
  imageUrl?: string;
  uploadedImage?: string; // For displaying user's uploaded image in chat
}

export interface SavedPrompt {
  id: string;
  name: string;
  prompt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastUpdated: number;
  messages: ChatMessage[];
  systemInstruction: string;
  useSearchGrounding: boolean;
}