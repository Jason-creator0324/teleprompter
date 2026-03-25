import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTeleprompter } from '@/store/use-teleprompter';
import { useLocation } from 'wouter';
import {
  Play, Pause, X, RotateCcw, Plus, Minus, BookOpen, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reader() {
  const [, setLocation] = useLocation();
  const {
    chapters,
    speed, setSpeed, fontSize, setFontSize,
    bgColor, textColor, isMirrored, lineHeight,
  } = useTeleprompter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showChapters, setShowChapters] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const mouseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Use a ref to always have the latest isPlaying value inside rAF
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const handleExit = useCallback(() => {
    setIsPlaying(false);
    setLocation('/');
  }, [setLocation]);

  const handleReset = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setProgress(0);
      setIsFinished(false);
      setActiveChapterIdx(0);
    }
  }, []);

  // Instant jump — works even while playing because we just set scrollTop directly.
  // The rAF loop reads the new scrollTop on the very next frame and continues from there.
  const jumpToChapter = useCallback((idx: number) => {
    const el = chapterRefs.current[idx];
    if (!el || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    // Calculate position relative to the container's scroll
    const targetScrollTop = containerRef.current.scrollTop + (elRect.top - containerRect.top);
    containerRef.current.scrollTop = targetScrollTop;
    setActiveChapterIdx(idx);
    setIsFinished(false);
  }, []);

  // Smooth scrolling via rAF
  const animate = useCallback((time: number) => {
    if (!containerRef.current) return;
    if (previousTimeRef.current !== undefined && isPlayingRef.current) {
      const deltaTime = time - previousTimeRef.current;
      const pixelsPerSecond = speed * 15;
      containerRef.current.scrollTop += pixelsPerSecond * (deltaTime / 1000);

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll > 0) {
        setProgress(Math.min(100, (scrollTop / maxScroll) * 100));
        if (scrollTop >= maxScroll - 1) {
          setIsPlaying(false);
          setIsFinished(true);
        }
      }
    }
    previousTimeRef.current = time;
    if (isPlayingRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [speed]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isPlaying, animate]);

  // Track active chapter based on scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setProgress((scrollTop / maxScroll) * 100);
      if (scrollTop < maxScroll - 10) setIsFinished(false);
    }
    const containerRect = containerRef.current.getBoundingClientRect();
    const threshold = containerRect.top + clientHeight * 0.4;
    let currentIdx = 0;
    chapterRefs.current.forEach((el, idx) => {
      if (el && el.getBoundingClientRect().top <= threshold) {
        currentIdx = idx;
      }
    });
    setActiveChapterIdx(currentIdx);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isFinished) { handleReset(); setIsPlaying(true); }
        else setIsPlaying(p => !p);
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

  // Mouse idle — auto-hide bottom controls only, chapter panel stays
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        if (isPlayingRef.current) setShowControls(false);
      }, 2500);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full flex" style={{ backgroundColor: bgColor }}>

      {/* Scroll Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 h-full overflow-y-auto overflow-x-hidden no-scrollbar"
      >
        <div
          className="max-w-4xl mx-auto w-full pt-[40vh] pb-[60vh] px-4 md:px-12"
          style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
        >
          {chapters.map((chapter, idx) => (
            <div
              key={chapter.id}
              ref={el => { chapterRefs.current[idx] = el; }}
            >
              {/* Section divider */}
              <div className="flex items-center gap-4 mb-8 mt-2">
                <div className="flex-1 h-px opacity-20" style={{ backgroundColor: textColor }} />
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border opacity-40"
                  style={{ color: textColor, borderColor: textColor }}
                >
                  {chapter.title}
                </span>
                <div className="flex-1 h-px opacity-20" style={{ backgroundColor: textColor }} />
              </div>

              {/* Section text */}
              {chapter.text.split('\n').filter(p => p.trim() !== '').map((p, i) => (
                <p
                  key={i}
                  className="mb-8 font-sans font-bold tracking-tight text-center"
                  style={{ fontSize: `${fontSize}px`, lineHeight, color: textColor }}
                >
                  {p}
                </p>
              ))}

              {chapter.text.trim() === '' && (
                <p
                  className="mb-8 text-center opacity-30 italic"
                  style={{ fontSize: `${Math.max(fontSize * 0.5, 24)}px`, color: textColor }}
                >
                  (This section is empty)
                </p>
              )}
            </div>
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
                  <span className="text-2xl uppercase tracking-widest font-bold opacity-50">End of Script</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chapter Navigator — always visible, clicking works even while playing */}
      <AnimatePresence>
        {showChapters && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.25 }}
            className="w-44 shrink-0 h-full flex flex-col py-6 px-3 gap-2 overflow-y-auto no-scrollbar"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-1 px-2"
              style={{ color: textColor, opacity: 0.4 }}
            >
              Jump to Section
            </div>
            {chapters.map((chapter, idx) => {
              const isActive = idx === activeChapterIdx;
              return (
                <button
                  key={chapter.id}
                  onClick={() => jumpToChapter(idx)}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2"
                  style={{
                    backgroundColor: isActive ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isActive ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {isActive
                    ? <ChevronRight className="w-3 h-3 shrink-0" style={{ color: '#3b82f6' }} />
                    : <span className="w-3 h-3 shrink-0 text-center text-[10px] font-mono" style={{ color: textColor, opacity: 0.4 }}>{idx + 1}</span>
                  }
                  <span
                    className="text-xs font-semibold truncate leading-tight"
                    style={{ color: textColor, opacity: isActive ? 1 : 0.6 }}
                  >
                    {chapter.title}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle chapter panel */}
      <button
        onClick={() => setShowChapters(v => !v)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 w-6 h-14 flex items-center justify-center rounded-l-lg transition-all"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: textColor, opacity: 0.5 }}
        title={showChapters ? 'Hide sections' : 'Show sections'}
      >
        <BookOpen className="w-3 h-3" />
      </button>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel rounded-full px-6 py-4 flex items-center gap-6 z-50"
          >
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

            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => { if (isFinished) handleReset(); setIsPlaying(!isPlaying); }}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] active:scale-95 transition-all duration-200"
              >
                {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </button>

              <button
                onClick={handleExit}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Exit (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 w-full h-1.5 bg-black/20 z-50">
        <div
          className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Focus guides */}
      <div className="fixed top-1/2 left-0 w-full h-[120px] -translate-y-1/2 pointer-events-none z-0 flex justify-between px-4 opacity-20">
        <div className="w-4 h-full border-y-2 border-l-2 border-white/50 rounded-l-xl" />
        <div className="w-4 h-full border-y-2 border-r-2 border-white/50 rounded-r-xl" />
      </div>
    </div>
  );
}
