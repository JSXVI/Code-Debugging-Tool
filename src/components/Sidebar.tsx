import { Plus, MessageSquare, Trash2, X, Search, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { Chat } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleStartEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditValue(chat.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editValue.trim()) {
      onRenameChat(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -280,
          width: isOpen ? 280 : 0,
          opacity: isOpen ? 1 : 0 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed lg:relative h-screen glass-dark border-r border-white/5 flex flex-col overflow-hidden z-50",
          !isOpen && "lg:w-0"
        )}
      >
        <div className="p-4 flex flex-col h-full w-[280px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Sessions
            </h2>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-white/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-2 w-full p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-sm font-medium group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              New Chat
            </button>

            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/search:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold px-2 mb-2">
              {searchQuery ? 'Search Results' : 'Recent'}
            </h3>
            <AnimatePresence mode="popLayout">
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  layout
                  initial={{ opacity: 0, x: -10, y: 5 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0, 
                    y: 0,
                    transition: {
                      delay: index * 0.05,
                      duration: 0.4,
                      ease: [0.23, 1, 0.32, 1]
                    }
                  }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                    activeChatId === chat.id
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                  onClick={() => {
                    if (editingId === chat.id) return;
                    onSelectChat(chat.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  {editingId === chat.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-sm truncate pr-16">{chat.title}</span>
                  )}
                  
                  <div className="absolute right-2 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    {editingId === chat.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                        className="p-1.5 hover:bg-green-500/20 rounded-lg text-white/40 hover:text-green-400 transition-all"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(chat);
                          }}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                          title="Rename session"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-all"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
              {filteredChats.length === 0 && searchQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-2 py-8 text-center"
                >
                  <p className="text-xs text-white/20">No sessions found</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                LA
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">Lumina AI</span>
                <span className="text-[10px] text-white/40">v1.2.0</span>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}


