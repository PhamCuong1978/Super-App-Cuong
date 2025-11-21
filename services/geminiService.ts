
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
    model: 'gemini-2.5-flash', // Upgraded to the latest Flash model for speed and quality
    config: {
      systemInstruction: systemInstruction || 'Bạn là một trợ lý AI thông minh, hữu ích và thân thiện. Bạn có khả năng tìm kiếm thông tin trên internet để đưa ra câu trả lời chính xác và cập nhật nhất. Hãy trả lời ngắn gọn, đi thẳng vào vấn đề trừ khi được yêu cầu giải thích chi tiết.',
      tools: [{ googleSearch: {} }], // Enable Google Search Grounding
    },
  });
  return chat;
}

export async function generateContent(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });
  return response.text || '';
}
