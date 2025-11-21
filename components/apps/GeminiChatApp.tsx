
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat, GenerateContentResponse } from '@google/genai';
import AppContainer from '../AppContainer';
import { createChat } from '../../services/geminiService';
import { saveFile } from '../../services/googleApiService';
import MicrophoneIcon from '../icons/MicrophoneIcon';
import SaveIcon from '../icons/SaveIcon';
import ChatIcon from '../icons/ChatIcon'; // Reusing ChatIcon or you can add a Sparkle icon
import { User } from '../../types';

interface GeminiChatAppProps {
  onExit: () => void;
  isVisible: boolean;
  user?: User | null;
}

interface WebSource {
  uri: string;
  title: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: WebSource[];
  isStreaming?: boolean;
}

// FIX: Cast window to any to access vendor-prefixed SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const GeminiChatApp: React.FC<GeminiChatAppProps> = ({ onExit, isVisible, user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  }, [messages, isLoading]);

  const initializeChat = useCallback(() => {
    try {
      chatRef.current = createChat();
      setMessages([{ 
        id: 'init',
        sender: 'ai', 
        text: 'Xin chào! Tôi là Gemini 2.5 Flash phiên bản mới nhất.\nTôi có thể giúp bạn tìm kiếm thông tin thời gian thực trên Internet, phân tích dữ liệu và viết nội dung. Bạn cần hỗ trợ gì không?' 
      }]);
      setError(null);
    } catch (e) {
      console.error("Failed to initialize chat:", e);
      setError("Failed to initialize Gemini API. Please check your API key.");
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      if (!chatRef.current) {
        initializeChat();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // Cleanup recognition on unmount
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
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError("Microphone permission denied.");
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

    const userMsgId = Date.now().toString();
    const userMessage: Message = { id: userMsgId, sender: 'user', text: input };
    
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    const aiMsgId = (Date.now() + 1).toString();
    // Add placeholder for AI message
    setMessages((prev) => [...prev, { id: aiMsgId, sender: 'ai', text: '', isStreaming: true }]);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: currentInput });
      
      let accumulatedText = '';
      let accumulatedSources: WebSource[] = [];

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse; // Type assertion
        
        // Extract Text
        if (c.text) {
            accumulatedText += c.text;
        }

        // Extract Grounding Metadata (Search Sources)
        const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          groundingChunks.forEach((chunk: any) => {
             if (chunk.web) {
                accumulatedSources.push({
                   uri: chunk.web.uri,
                   title: chunk.web.title
                });
             }
          });
        }

        // Update UI
        setMessages((prev) => {
          const newMessages = [...prev];
          const index = newMessages.findIndex(m => m.id === aiMsgId);
          if (index !== -1) {
             newMessages[index] = {
                ...newMessages[index],
                text: accumulatedText,
                sources: accumulatedSources.length > 0 ? accumulatedSources : undefined
             };
          }
          return newMessages;
        });
      }
      
      // Mark streaming as done
      setMessages((prev) => {
          const newMessages = [...prev];
          const index = newMessages.findIndex(m => m.id === aiMsgId);
          if (index !== -1) {
             newMessages[index].isStreaming = false;
          }
          return newMessages;
      });

    } catch (e) {
      console.error("Gemini API error:", e);
      const errorMessage = "Sorry, something went wrong. Please try again.";
      setError(errorMessage);
      setMessages((prev) => {
        const newMessages = [...prev];
        const index = newMessages.findIndex(m => m.id === aiMsgId);
        if (index !== -1) {
            newMessages[index].text = errorMessage;
            newMessages[index].isStreaming = false;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveChat = async () => {
    if (!user) {
        alert("Please sign in on the home screen to save the chat.");
        return;
    }
    if (messages.length <= 1) {
        alert("There is nothing to save yet.");
        return;
    }

    setIsSaving(true);
    try {
        const chatHistory = messages
          .map(msg => {
            let content = `${msg.sender === 'user' ? 'You' : 'Gemini'}: ${msg.text}`;
            if (msg.sources && msg.sources.length > 0) {
                content += `\n[Sources: ${msg.sources.map(s => s.uri).join(', ')}]`;
            }
            return content;
          })
          .join('\n\n---\n\n');
        const fileName = `Gemini Chat - ${new Date().toLocaleString()}`;
        await saveFile(fileName, chatHistory);
    } catch (error: any) {
        console.error("Save failed:", error);
        alert(`Could not save chat: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <AppContainer appName="Gemini Chat 2.5" onExit={onExit} isVisible={isVisible} user={user}>
      <div className="flex flex-col flex-grow h-full overflow-hidden bg-slate-900/50 rounded-xl">
        
        {/* Chat Area */}
        <div className="flex-grow p-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.sender === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 mr-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <ChatIcon className="w-5 h-5 text-white" />
                  </div>
              )}

              <div className={`flex flex-col max-w-[85%] md:max-w-[75%]`}>
                <div
                  className={`px-5 py-3.5 shadow-md backdrop-blur-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-slate-800/90 border border-slate-700/50 text-slate-100 rounded-2xl rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
                </div>

                {/* Sources Section (Grounding) */}
                {msg.sources && msg.sources.length > 0 && (
                   <div className="mt-2 flex flex-wrap gap-2 ml-1">
                      {msg.sources.slice(0, 3).map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-300 px-2 py-1 rounded-md transition-colors truncate max-w-[200px] flex items-center"
                          >
                             <span className="mr-1">🔗</span> {source.title || 'Source'}
                          </a>
                      ))}
                   </div>
                )}
              </div>

            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.sender === 'user' && (
            <div className="flex justify-start w-full animate-fade-in">
               <div className="flex-shrink-0 w-8 h-8 mr-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <ChatIcon className="w-5 h-5 text-white" />
               </div>
               <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-slate-800/90 border border-slate-700/50 flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
          
          {/* Error Banner */}
          {error && (
             <div className="mb-2 text-xs text-red-400 bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-900/50 flex items-center">
                ⚠️ {error}
             </div>
          )}

          <div className="flex items-end space-x-2 bg-slate-800 p-1.5 rounded-3xl border border-slate-700 shadow-lg focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            
            <button
              onClick={handleSaveChat}
              disabled={isLoading || isSaving || !user}
              className="p-3 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30"
              title="Save to Drive"
            >
              <SaveIcon className="w-5 h-5" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nhập tin nhắn hoặc hỏi về tin tức mới nhất..."
              className="flex-grow bg-transparent text-white placeholder-slate-500 px-2 py-3 focus:outline-none max-h-32 resize-none overflow-y-auto scrollbar-hide"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '44px' }}
            />

            <button
              onClick={handleToggleListen}
              disabled={isLoading}
              className={`p-3 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 animate-pulse ring-1 ring-red-500/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
               </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-500 mt-2">
             Được hỗ trợ bởi Gemini 2.5 Flash & Google Search
          </p>
        </div>
      </div>
    </AppContainer>
  );
};

export default GeminiChatApp;
