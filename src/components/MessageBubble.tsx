import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { User, Bot, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
}

const CodeBlock = ({ children, className, node, ...rest }: any) => {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  
  // In react-markdown v9+, check if it's inline by looking at the node or if it has newlines
  const isInline = !className && !code.includes('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
    return <code className={className} {...rest}>{children}</code>;
  }

  return (
    <div className="relative group/code">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 opacity-100 sm:opacity-40 sm:hover:opacity-100 transition-all duration-200 z-10"
        title="Copy code"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
      </button>
      <pre className={className}>
        <code className={className} {...rest}>{children}</code>
      </pre>
    </div>
  );
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const groundingChunks = message.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.4 }
      }}
      className={cn(
        "flex w-full gap-4 mb-8 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110",
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
            : "bg-white/10 border border-white/10"
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-indigo-400" />}
      </div>

      <div
        className={cn(
          "max-w-[90%] sm:max-w-[80%] flex flex-col gap-2 relative min-w-0",
          isUser ? "items-end" : "items-start"
        )}
      >
        {message.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl w-full sm:w-auto"
          >
            <img
              src={message.image}
              alt="Uploaded context"
              className="w-full sm:max-w-full max-h-[300px] sm:max-h-[400px] object-contain bg-black/20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </motion.div>
        )}

        <div className="relative group/bubble flex flex-col gap-2 min-w-0 w-full">
          <div
            className={cn(
              "px-6 py-4 rounded-[2rem] text-sm leading-relaxed relative overflow-hidden",
              isUser
                ? "bg-white/10 text-white rounded-tr-none border border-white/5"
                : "glass text-white/90 rounded-tl-none border-white/10 shadow-xl"
            )}
          >
            <div className="markdown-body break-words overflow-hidden">
              <ReactMarkdown
                components={{
                  code: CodeBlock,
                  pre: ({ children }) => <>{children}</>,
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          </div>

          {groundingChunks && groundingChunks.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 mt-1">
              {groundingChunks.map((chunk, i) => (
                <a
                  key={i}
                  href={chunk.web?.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all text-[10px] text-white/40 hover:text-indigo-300 group/link"
                >
                  <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover/link:opacity-100" />
                  <span className="truncate max-w-[150px]">{chunk.web?.title}</span>
                </a>
              ))}
            </div>
          )}

          <div className={cn(
            "flex items-center gap-4 px-2",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="text-[10px] text-white/20 font-medium tracking-widest uppercase">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            
            <button
              onClick={handleCopy}
              className="opacity-100 sm:opacity-0 sm:group-hover/bubble:opacity-100 transition-all duration-300 p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white flex items-center gap-1.5"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
