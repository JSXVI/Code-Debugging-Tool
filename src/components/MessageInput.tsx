import { Image as ImageIcon, Send, X, Paperclip, UploadCloud, Bot } from 'lucide-react';
import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MessageInputProps {
  onSendMessage: (text: string, image?: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 7000;

  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value.slice(0, MAX_CHARS));
    adjustHeight();
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only set dragging to false if we are leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if ((text.trim() || image) && !disabled) {
      onSendMessage(text, image || undefined);
      setText('');
      setImage(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto px-2 sm:px-4 pb-4 sm:pb-8"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {image && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-full mb-4 left-4 p-2 glass rounded-2xl border-white/10 shadow-2xl z-20 group"
          >
            <img
              src={image}
              alt="Preview"
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#030303]/90 backdrop-blur-md rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-dashed border-indigo-500"
            >
              <div className="flex flex-col items-center text-indigo-400 pointer-events-none">
                <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 mb-1 animate-bounce" />
                <span className="font-medium text-xs sm:text-sm">Drop image to upload</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[1.5rem] sm:rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        <div className="relative glass-dark rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/10 p-1 sm:p-2 flex items-end gap-1 sm:gap-2 shadow-2xl transition-all duration-300 group-focus-within:border-white/20">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 sm:p-4 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all duration-300"
            title="Upload image"
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything or drop an image..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs sm:text-sm py-3 sm:py-4 px-1 sm:px-2 min-h-[48px] sm:min-h-[56px] max-h-40 resize-none custom-scrollbar placeholder:text-white/20 overflow-y-auto"
            rows={1}
            disabled={disabled}
          />

          <button
            onClick={handleSend}
            disabled={(!text.trim() && !image) || disabled}
            className={cn(
              "p-3 sm:p-4 rounded-full transition-all duration-500 flex items-center justify-center min-w-[48px] sm:min-w-[56px]",
              (text.trim() || image) && !disabled
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 scale-100"
                : "bg-white/5 text-white/20 scale-90"
            )}
          >
            {disabled ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-2 sm:mt-3 flex justify-between items-center px-2 sm:px-4 text-[8px] sm:text-[10px] text-white/20 font-medium tracking-widest uppercase">
        <div className="flex gap-4 sm:gap-6">
          <span className="flex items-center gap-1 sm:gap-1.5"><Paperclip className="w-2 h-2 sm:w-3 sm:h-3" /> Visual Context</span>
          <span className="hidden sm:flex items-center gap-1.5">Shift + Enter for new line</span>
        </div>
        <span className={cn(
          "transition-colors",
          text.length >= MAX_CHARS ? "text-red-500 font-bold" : 
          text.length >= MAX_CHARS * 0.9 ? "text-orange-400" : ""
        )}>
          {text.length} / {MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
