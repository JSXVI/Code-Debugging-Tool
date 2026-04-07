import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Message, Chat } from '../types';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Sparkles, ShieldAlert, Cpu, Bot, Search, Bolt } from 'lucide-react';
import { getErrorMessage, withRetry } from '../lib/api-utils';

interface ChatAreaProps {
  chat: Chat | null;
  onUpdateChat: (messages: Message[]) => void;
  onNewChat: () => void;
}

const SYSTEM_INSTRUCTION = `You are Lumina AI, a versatile and highly capable AI assistant powered by real-time Google Search grounding.
Your goal is to provide precise, helpful, and comprehensive assistance across any topic.
When an image is provided, analyze it for:
1. General content and context.
2. Specific details requested by the user.
3. Technical or visual analysis if relevant.

SEARCH-FIRST STRATEGY:
- Always prioritize using Google Search for the latest information, facts, and real-time data.
- Be concise, direct, and versatile.
- Provide your response in clear Markdown.
- If you're unsure, ask for more context.`;

export default function ChatArea({ chat, onUpdateChat, onNewChat }: ChatAreaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chat?.messages, isLoading]);

  const handleSendMessage = async (text: string, image?: string) => {
    if (!chat) return;

    const trimmedText = text.trim().toLowerCase();
    const isSearchCommand = trimmedText.startsWith('/search');

    let cleanText = text;
    if (isSearchCommand) cleanText = text.trim().substring(7).trim();

    if (isSearchCommand && !cleanText) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `### 🔍 Search Command\nPlease provide a query after \`/search\`. For example: \`/search latest react features\``,
        timestamp: Date.now(),
      };
      onUpdateChat([...chat.messages, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      image,
      timestamp: Date.now(),
    };

    const updatedMessages = [...chat.messages, userMessage];
    onUpdateChat(updatedMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      // Use flash-lite for normal chat for maximum speed, and flash-preview for search
      const model = isSearchCommand ? 'gemini-3-flash-preview' : 'gemini-3.1-flash-lite-preview';

      const contents: any[] = [];
      
      // Add history context (last 5 messages for token efficiency)
      const history = updatedMessages.slice(-5);
      history.forEach((msg, index) => {
        let messageText = msg.text;
        
        // Clean command prefixes from all history messages
        const lowerText = messageText.trim().toLowerCase();
        if (lowerText.startsWith('/search')) {
          messageText = messageText.trim().substring(7).trim();
        }

        const parts: any[] = [{ text: messageText }];
        // Only include image for the most recent message or if it's the only message
        if (msg.image && (index === history.length - 1 || history.length === 1)) {
          const [mimeType, base64Data] = msg.image.split(';base64,');
          parts.push({
            inlineData: {
              mimeType: mimeType.split(':')[1],
              data: base64Data,
            },
          });
        }
        contents.push({ role: msg.role, parts });
      });

      const aiMessageId = (Date.now() + 1).toString();
      let fullText = '';
      let groundingMetadata: any = null;

      const tools: any[] = [];
      if (isSearchCommand) {
        tools.push({ googleSearch: {} });
      }

      // Implement retry mechanism for the stream request
      const streamResponse = await withRetry(async () => {
        let extraInstruction = "";
        if (isSearchCommand) {
          extraInstruction = `\n\n[SEARCH MODE]\nYou MUST use the 'googleSearch' tool to answer: "${cleanText}". Provide a concise, up-to-date response.`;
        }

        const config: any = {
          systemInstruction: SYSTEM_INSTRUCTION + extraInstruction,
        };

        if (tools.length > 0) {
          config.tools = tools;
        }

        return await ai.models.generateContentStream({
          model,
          contents,
          config,
        });
      }, 3, 1000);

      for await (const chunk of streamResponse) {
        if (isLoading) setIsLoading(false);
        const c = chunk as GenerateContentResponse;
        
        // Safely extract text
        let chunkText = '';
        try {
          chunkText = c.text || '';
        } catch (e) {
          // c.text throws an error if the chunk contains a function call instead of text
          console.debug('Chunk does not contain text (likely a tool call)');
        }
        fullText += chunkText;
        
        // Update grounding metadata if it arrives
        if (c.candidates?.[0]?.groundingMetadata) {
          groundingMetadata = c.candidates[0].groundingMetadata;
        }

        const streamingMessage: Message = {
          id: aiMessageId,
          role: 'model',
          text: fullText || (isLoading ? '...' : ''), // Show placeholder if still loading but no text yet
          timestamp: Date.now(),
          groundingMetadata: groundingMetadata,
        };
        onUpdateChat([...updatedMessages, streamingMessage]);
      }

      // Final check for empty response
      if (!fullText) {
        const fallbackMessage: Message = {
          id: aiMessageId,
          role: 'model',
          text: "I'm sorry, I couldn't retrieve any information for that query. Please try rephrasing it or using a different command.",
          timestamp: Date.now(),
        };
        onUpdateChat([...updatedMessages, fallbackMessage]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: getErrorMessage(error),
        timestamp: Date.now(),
      };
      onUpdateChat([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative pt-16">
      {!chat ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
            <div className="relative w-24 h-24 glass rounded-3xl flex items-center justify-center border-white/10">
              <Sparkles className="w-12 h-12 text-indigo-400" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent"
          >
            Lumina AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 max-w-md mb-8 leading-relaxed"
          >
            Next-generation versatile assistant. Powered by real-time search and visual context awareness to understand anything you throw at it.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onNewChat}
            className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 mb-12"
          >
            Start New Conversation
          </motion.button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
            {[
              { icon: <Search className="w-4 h-4" />, title: "/search Command", desc: "Real-time web facts and data" },
              { icon: <Bolt className="w-4 h-4" />, title: "Low Latency", desc: "Blazing fast responses via Flash Lite" },
              { icon: <Cpu className="w-4 h-4" />, title: "Visual Context", desc: "Analyze images and visual data" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-6 glass rounded-2xl border-white/5 text-left hover:border-white/10 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
                <p className="text-[10px] text-white/40 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar scroll-smooth w-full overflow-x-hidden"
          >
            <div className="max-w-4xl mx-auto space-y-4">
              {chat.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 border-white/10">
                    <Bot className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">New Conversation</h2>
                  <p className="text-white/40 text-sm max-w-xs">
                    Lumina AI ready. Ask me anything or upload an image to begin.
                  </p>
                </div>
              )}
              <AnimatePresence mode="popLayout">
                {chat.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 items-center px-4"
                  >
                    <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center animate-pulse">
                      <Bot className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/60 animate-pulse">
                        ...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-gradient-to-t from-[#030303] via-[#030303]/80 to-transparent pt-12">
            <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </>
      )}
    </div>
  );
}
