import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTeleprompter } from '@/store/use-teleprompter';
import { useLocation } from 'wouter';
import { 
  Play, Pause, X, RotateCcw, Plus, Minus, Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reader() {
  const [, setLocation] = useLocation();
  const {
    text, speed, setSpeed, fontSize, setFontSize,
    bgColor, textColor, isMirrored, lineHeight
  } = useTeleprompter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const mouseTimeoutRef = useRef<NodeJS.Timeout>();

  // Format text into paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim() !== '');

  // Handle exiting back to editor
  const handleExit = useCallback(() => {
    setIsPlaying(false);
    setLocation('/');
  }, [setLocation]);

  // Handle resetting position
  const handleReset = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setProgress(0);
      setIsFinished(false);
    }
  }, []);

  // Smooth scrolling logic using requestAnimationFrame
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined && isPlaying && containerRef.current) {
      const deltaTime = time - previousTimeRef.current;
      
      // Calculate scroll amount based on speed
      // Speed 1 = very slow, Speed 10 = very fast
      // This multiplier might need tuning based on feel
      const pixelsPerSecond = speed * 15; 
      const scrollAmount = pixelsPerSecond * (deltaTime / 1000);
      
      containerRef.current.scrollTop += scrollAmount;

      // Calculate progress
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const maxScroll = scrollHeight - clientHeight;
      
      if (maxScroll > 0) {
        const currentProgress = (scrollTop / maxScroll) * 100;
        setProgress(Math.min(100, currentProgress));
        
        // Auto-stop at the end
        if (scrollTop >= maxScroll - 1) { // -1 pixel threshold to ensure it triggers
          setIsPlaying(false);
          setIsFinished(true);
        }
      }
    }
    
    previousTimeRef.current = time;
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, speed]);

  // Start/Stop animation loop
  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined; // Reset time so we don't jump when resuming
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animate]);

  // Handle manual scrolling to update progress
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setProgress((scrollTop / maxScroll) * 100);
      if (scrollTop < maxScroll - 10) {
        setIsFinished(false);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isFinished) {
          handleReset();
          setIsPlaying(true);
        } else {
          setIsPlaying(p => !p);
        }
      } else if (e.code === 'Escape') {
        handleExit();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSpeed(speed + 1);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSpeed(speed - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFinished, speed, setSpeed, handleExit, handleReset]);

  // Mouse idle detection to hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
      mouseTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 2500); // Hide after 2.5s of inactivity
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, [isPlaying]);


  return (
    <div 
      className="fixed inset-0 w-full h-full flex flex-col"
      style={{ backgroundColor: bgColor }}
    >
      {/* 
        Reader Area
        Using a wide max-width to keep lines from getting too long to read easily,
        but allowing it to scale up on huge screens.
      */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar px-4 md:px-12 lg:px-24"
      >
        <div 
          ref={contentRef}
          className="max-w-5xl mx-auto w-full pt-[40vh] pb-[60vh]"
          style={{
            transform: isMirrored ? 'scaleX(-1)' : 'none',
          }}
        >
          {paragraphs.map((p, i) => (
            <p 
              key={i} 
              className="mb-8 font-sans font-bold tracking-tight text-center"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                color: textColor,
                textShadow: bgColor === '#000000' || bgColor === '#111827' 
                  ? '0 4px 24px rgba(0,0,0,0.8)' 
                  : 'none'
              }}
            >
              {p}
            </p>
          ))}
          
          <AnimatePresence>
            {isFinished && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-24"
              >
                <div 
                  className="inline-block px-8 py-4 rounded-3xl border-2"
                  style={{ borderColor: textColor, color: textColor }}
                >
                  <span className="text-2xl uppercase tracking-widest font-bold opacity-50">End of script</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Overlay Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel rounded-full px-6 py-4 flex items-center gap-6 z-50 pointer-events-auto"
          >
            {/* Quick Settings (Left) */}
            <div className="flex items-center gap-3 pr-6 border-r border-white/10">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Size</span>
                <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
                  <button onClick={() => setFontSize(fontSize - 4)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-mono text-xs w-6 text-center">{fontSize}</span>
                  <button onClick={() => setFontSize(fontSize + 4)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Speed</span>
                <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
                  <button onClick={() => setSpeed(speed - 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-primary font-mono font-bold text-sm w-6 text-center">{speed}</span>
                  <button onClick={() => setSpeed(speed + 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Playback Controls (Center) */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handleReset}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Restart (Go to top)"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button 
                onClick={() => {
                  if (isFinished) handleReset();
                  setIsPlaying(!isPlaying);
                }}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] active:scale-95 transition-all duration-200"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1" />
                )}
              </button>

              <button 
                onClick={handleExit}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Exit Reader (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar Container */}
      <div className="fixed bottom-0 left-0 w-full h-1.5 bg-black/20 z-50">
        <div 
          className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Focus Indicator Guidelines (Optional, nice touch for prompters) */}
      <div className="fixed top-1/2 left-0 w-full h-[120px] -translate-y-1/2 pointer-events-none z-0 flex justify-between px-4 opacity-20">
        <div className="w-4 h-full border-y-2 border-l-2 border-white/50 rounded-l-xl" />
        <div className="w-4 h-full border-y-2 border-r-2 border-white/50 rounded-r-xl" />
      </div>
    </div>
  );
}
