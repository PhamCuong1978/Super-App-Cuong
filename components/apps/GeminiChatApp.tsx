import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import AppContainer from '../AppContainer';
import { createChat } from '../../services/geminiService';
import MicrophoneIcon from '../icons/MicrophoneIcon';

interface GeminiChatAppProps {
  onExit: () => void;
  isVisible: boolean;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

// FIX: Cast window to any to access vendor-prefixed SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const GeminiChatApp: React.FC<GeminiChatAppProps> = ({ onExit, isVisible }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = useCallback(() => {
    try {
      chatRef.current = createChat();
      setMessages([{ sender: 'ai', text: 'Em chào anh Cường! Em là trợ lý của anh đây. Em chúc anh ngày mới vui vẻ. Em có thể giúp gì được cho Anh.' }]);
      setError(null);
    } catch (e) {
      console.error("Failed to initialize chat:", e);
      setError("Failed to initialize Gemini API. Please check your API key.");
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      initializeChat();
    } else {
        setMessages([]);
        setInput('');
        chatRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // Cleanup recognition on unmount or visibility change
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);


  const handleToggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!SpeechRecognition) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.interimResults = true;
    recognition.lang = 'vi-VN';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError("Microphone permission denied.");
      } else {
        setError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
    }
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: input });
      let aiResponseText = '';
      setMessages((prev) => [...prev, { sender: 'ai', text: '' }]);

      for await (const chunk of stream) {
        aiResponseText += chunk.text;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = aiResponseText;
          return newMessages;
        });
      }
    } catch (e) {
      console.error("Gemini API error:", e);
      const errorMessage = "Sorry, something went wrong. Please try again.";
      setError(errorMessage);
       setMessages((prev) => [...prev, { sender: 'ai', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContainer appName="Gemini Chat" onExit={onExit} isVisible={isVisible}>
      <div className="flex flex-col flex-grow">
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-2 rounded-2xl ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="px-4 py-2 rounded-2xl bg-slate-700 text-slate-200">
                  <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={error || "Type your message..."}
              className={`flex-grow px-4 py-2 bg-slate-700 text-slate-200 rounded-full focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500 placeholder-red-400' : 'focus:ring-blue-500'}`}
              disabled={isLoading}
            />
            <button
              onClick={handleToggleListen}
              disabled={isLoading}
              className={`flex-shrink-0 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              <MicrophoneIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 px-5 py-2 bg-blue-600 text-white rounded-full font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </AppContainer>
  );
};

export default GeminiChatApp;