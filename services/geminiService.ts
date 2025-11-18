
import { GoogleGenAI, Chat } from "@google/genai";

// Assume process.env.API_KEY is configured in the environment
const apiKey = process.env.API_KEY;
if (!apiKey) {
  // In a real app, you'd have a more robust way of handling this.
  // For this example, we'll proceed, but API calls will fail.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || ' ' });

export function createChat(systemInstruction?: string): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
      systemInstruction: systemInstruction || 'You are a helpful and friendly assistant. Keep your responses concise and clear.',
    },
  });
  return chat;
}

export async function generateContent(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });
  return response.text;
}