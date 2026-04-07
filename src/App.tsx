/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Chat, Message } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LandingScreen from './components/LandingScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('lumina_has_started') === 'true';
  });
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('lumina_chats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved chats', e);
        return [];
      }
    }
    return [];
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const saved = localStorage.getItem('lumina_chats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed[0].id : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lumina_chats', JSON.stringify(chats));
  }, [chats]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
  };

  const handleDeleteChat = (id: string) => {
    const updatedChats = chats.filter((c) => c.id !== id);
    setChats(updatedChats);
    if (activeChatId === id) {
      setActiveChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === id ? { ...chat, title: newTitle } : chat
      )
    );
  };

  const handleUpdateChat = (messages: Message[]) => {
    if (!activeChatId) return;

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChatId) {
          // Update title if it's the first message
          let title = chat.title;
          if (chat.messages.length === 0 && messages.length > 0) {
            const firstMsg = messages[0].text;
            // Get first 5-6 words or 40 characters
            const words = firstMsg.split(/\s+/).slice(0, 6).join(' ');
            title = words.length > 40 ? words.slice(0, 37) + '...' : words;
            if (!title) title = 'New Conversation';
          }
          return { ...chat, messages, title };
        }
        return chat;
      })
    );
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans selection:bg-indigo-500/30 bg-[#030303]">
      <div className="atmosphere" />
      
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <LandingScreen key="landing" onStart={() => {
            localStorage.setItem('lumina_has_started', 'true');
            setHasStarted(true);
          }} />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ 
              duration: 1.2, 
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.8 },
              scale: { duration: 1.2 }
            }}
            className="flex h-screen w-full relative"
          >
            <Sidebar
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              onDeleteChat={handleDeleteChat}
              onRenameChat={handleRenameChat}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
              {/* Top Header with Menu Button */}
              <header className="absolute top-0 left-0 right-0 h-16 flex items-center px-6 z-30 pointer-events-none">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-3 rounded-xl glass hover:bg-white/10 transition-all duration-300 pointer-events-auto"
                  title={isSidebarOpen ? "Close Menu" : "Open Menu"}
                >
                  {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </header>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChatId || 'empty'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="flex-1 flex flex-col h-full"
                >
                  <ChatArea 
                    chat={activeChat} 
                    onUpdateChat={handleUpdateChat} 
                    onNewChat={handleNewChat}
                  />
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


