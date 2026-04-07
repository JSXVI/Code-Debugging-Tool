import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 overflow-hidden bg-transparent"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 1.4, 
          delay: 0.2, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl"
      >
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-indigo-500/30 blur-[60px] rounded-full group-hover:bg-indigo-500/40 transition-colors duration-700" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 glass rounded-3xl flex items-center justify-center border-white/10 shadow-2xl">
            <Sparkles className="w-10 h-10 text-indigo-400" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">
          Lumina AI
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-white/50 mb-10 leading-relaxed max-w-xl">
          Next-generation versatile assistant. Powered by real-time search and visual context awareness to understand anything you throw at it.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-white text-black rounded-full font-semibold text-base sm:text-lg overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center gap-3"
        >
          <span className="relative z-10">Start New Conversation</span>
          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
