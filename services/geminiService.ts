

import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage, MessageAuthor, ImageAspectRatio } from '../types';

// FIX: Removed the 'declare global' block for window.aistudio.
// The TypeScript compiler reported that this was a re-declaration and conflicted
// with an existing global type named 'AIStudio', causing errors TS2717 and TS2322.
// The application will rely on the pre-existing global type definition.

// FIX: Use process.env.API_KEY directly instead of a module-level const.
// This ensures that the most up-to-date API key is used for every API call,
// which is critical for features like Veo video generation where the user can
// select a key at runtime.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generationConfig = {
  // FIX: Lowered temperature for potentially faster, more deterministic responses.
  temperature: 0.5,
  topP: 0.95,
  topK: 64,
};

// Helper to map app's message format to Gemini's content format
const mapMessagesToContents = (messages: ChatMessage[]) => {
  return messages
    // Filter out the initial welcome message and any errors
    .filter(msg => !msg.isWelcomeMessage && !msg.isError)
    .map(msg => {
        const parts = [];
        if (msg.text) {
            parts.push({ text: msg.text });
        }
        if (msg.author === MessageAuthor.USER && msg.uploadedImage) {
            // This is for display only, the actual image data is passed separately.
            // But if we wanted to support history of images, we'd handle it here.
        }
        return {
            role: msg.author === MessageAuthor.USER ? 'user' : 'model',
            parts: parts,
        }
    }).filter(c => c.parts.length > 0);
};

export async function sendMessageStream(
  history: ChatMessage[],
  newMessage: string,
  systemInstruction: string,
  useGrounding: boolean,
  image?: { data: string; mimeType: string }
) {
  const contents = mapMessagesToContents(history);
  
  const userParts: any[] = [];
  if (image) {
      userParts.push({
          inlineData: { data: image.data, mimeType: image.mimeType }
      });
  }
  userParts.push({ text: newMessage });

  contents.push({ role: 'user', parts: userParts });

  const config: { [key: string]: any } = {
    ...generationConfig,
    systemInstruction,
  };

  if (useGrounding) {
    config.tools = [{ googleSearch: {} }];
  }

  return ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: config
  });
}

export async function editImage(prompt: string, image: { data: string; mimeType: string }): Promise<string> {
    const imagePart = {
        inlineData: {
            data: image.data,
            mimeType: image.mimeType,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            // FIX: Use Modality.IMAGE enum member instead of a string literal for type safety.
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    
    throw new Error('Image editing failed. The API did not return an image. This may be due to safety policy restrictions.');
}


export async function generateImage(prompt: string, aspectRatio: ImageAspectRatio): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } else {
        console.error("Image generation API response was invalid:", JSON.stringify(response, null, 2));
        // Throw a more informative error that can be caught and handled in App.tsx.
        // A common reason for an empty result is a safety block.
        throw new Error('Image generation failed. This may be due to safety policy restrictions. The API did not return an image.');
    }
}