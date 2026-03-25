import React, { useState, useRef } from 'react';
import { useTeleprompter } from '@/store/use-teleprompter';
import { Link } from 'wouter';
import {
  Play, Settings, Type, AlignLeft, Palette, FlipHorizontal,
  Video, Zap, Plus, Trash2, BookOpen, ChevronUp, ChevronDown,
  Pencil, Check, X
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_BG_COLORS = ['#000000', '#111827', '#1e1b4b', '#064e3b', '#450a0a', '#ffffff'];
const PRESET_TEXT_COLORS = ['#ffffff', '#f8fafc', '#fef08a', '#a7f3d0', '#bfdbfe', '#000000'];

type SidebarTab = 'sections' | 'settings';

export default function Editor() {
  const {
    chapters, activeChapterId,
    addChapter, deleteChapter, updateChapter, setActiveChapterId, moveChapter,
    speed, setSpeed,
    fontSize, setFontSize,
    bgColor, setBgColor,
    textColor, setTextColor,
    isMirrored, setIsMirrored,
    lineHeight, setLineHeight,
  } = useTeleprompter();

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('sections');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const activeChapter = chapters.find(c => c.id === activeChapterId) ?? chapters[0];
  const totalWords = chapters.reduce((sum, c) => {
    return sum + c.text.split(/\s+/).filter(w => w.length > 0).length;
  }, 0);

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
    setTimeout(() => editInputRef.current?.select(), 50);
  };

  const commitEdit = () => {
    if (editingId && editingTitle.trim()) {
      updateChapter(editingId, { title: editingTitle.trim() });
    }
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div className="min-h-screen bg-background flex flex-row overflow-hidden">

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col h-screen max-h-screen relative z-10 min-w-0">

        {/* Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-border/50 bg-card/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Video className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">
              Teleprompter<span className="text-primary">Pro</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {totalWords} Words &middot; {chapters.length} Sections
            </span>
            <Link
              href="/read"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm bg-primary text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Prompter
            </Link>
          </div>
        </header>

        {/* Active Section Label */}
        <div className="h-10 px-6 flex items-center gap-2 border-b border-border/30 bg-card/10 shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground/70">
            {activeChapter?.title ?? ''}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {activeChapter?.text.split(/\s+/).filter(w => w.length > 0).length ?? 0} words
          </span>
        </div>

        {/* Text Area */}
        <div className="flex-1 px-6 py-6 md:px-10 md:py-8 relative overflow-hidden bg-gradient-to-b from-background to-card/20">
          <motion.div
            key={activeChapterId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <textarea
              value={activeChapter?.text ?? ''}
              onChange={(e) => updateChapter(activeChapterId, { text: e.target.value })}
              placeholder="Type or paste this section's script here..."
              className="w-full h-full bg-transparent resize-none outline-none text-foreground/90 placeholder:text-muted-foreground/40 font-sans leading-relaxed text-lg md:text-xl p-4 rounded-xl border border-transparent focus:border-border/50 focus:bg-card/30 transition-colors duration-300"
              spellCheck="false"
            />
          </motion.div>
        </div>
      </div>

      {/* Right Sidebar — always visible on the right */}
      <div className="w-80 shrink-0 h-screen flex flex-col bg-card/40 backdrop-blur-xl border-l border-white/5 relative z-20">

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-white/5">
          <button
            onClick={() => setSidebarTab('sections')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
              sidebarTab === 'sections'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Sections
          </button>
          <button
            onClick={() => setSidebarTab('settings')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
              sidebarTab === 'settings'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* Sections Tab */}
          {sidebarTab === 'sections' && (
            <motion.div
              key="sections"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="p-4 shrink-0">
                <button
                  onClick={addChapter}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/20 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {chapters.map((chapter, idx) => {
                  const isActive = chapter.id === activeChapterId;
                  const isEditing = editingId === chapter.id;
                  const wordCount = chapter.text.split(/\s+/).filter(w => w.length > 0).length;

                  return (
                    <motion.div
                      key={chapter.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group relative rounded-xl border transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-primary/10 border-primary/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                          : 'bg-background/40 border-white/5 hover:bg-background/60 hover:border-white/10'
                      }`}
                      onClick={() => !isEditing && setActiveChapterId(chapter.id)}
                    >
                      <div className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold w-5 text-center shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`}>
                            {idx + 1}
                          </span>

                          {isEditing ? (
                            <input
                              ref={editInputRef}
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-background/80 border border-primary/50 rounded-md px-2 py-0.5 text-sm font-semibold text-foreground outline-none"
                              autoFocus
                            />
                          ) : (
                            <span className={`flex-1 text-sm font-semibold truncate ${isActive ? 'text-foreground' : 'text-foreground/70'}`}>
                              {chapter.title}
                            </span>
                          )}

                          <div className="flex items-center gap-1 shrink-0">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); commitEdit(); }}
                                  className="w-6 h-6 flex items-center justify-center rounded-md text-green-400 hover:bg-green-400/10"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                                  className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-white/10"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); startEditing(chapter.id, chapter.title); }}
                                  className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                                  title="Rename"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                {chapters.length > 1 && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteChapter(chapter.id); }}
                                    className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1.5 pl-7">
                          <span className="text-xs text-muted-foreground/60">
                            {wordCount > 0 ? `${wordCount} words` : '(empty)'}
                          </span>
                          {!isEditing && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); if (idx > 0) moveChapter(idx, idx - 1); }}
                                disabled={idx === 0}
                                className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Move up"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); if (idx < chapters.length - 1) moveChapter(idx, idx + 1); }}
                                disabled={idx === chapters.length - 1}
                                className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Move down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {sidebarTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {/* Speed */}
              <div className="space-y-4 bg-background/50 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4" /> Scroll Speed
                  </label>
                  <span className="text-primary font-mono text-sm font-bold bg-primary/10 px-2 py-0.5 rounded">
                    {speed}
                  </span>
                </div>
                <Slider value={speed} min={1} max={10} step={1} onValueChange={setSpeed} />
              </div>

              {/* Typography */}
              <div className="space-y-6 bg-background/50 p-5 rounded-2xl border border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <Type className="w-4 h-4" /> Font Size
                    </label>
                    <span className="text-foreground font-mono text-sm">{fontSize}px</span>
                  </div>
                  <Slider value={fontSize} min={24} max={120} step={2} onValueChange={setFontSize} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <AlignLeft className="w-4 h-4" /> Line Height
                    </label>
                    <span className="text-foreground font-mono text-sm">{lineHeight}x</span>
                  </div>
                  <Slider value={lineHeight} min={1} max={3} step={0.1} onValueChange={setLineHeight} />
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-6 bg-background/50 p-5 rounded-2xl border border-white/5">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Palette className="w-4 h-4" /> Background Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_BG_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setBgColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${bgColor === color ? 'border-primary scale-110' : 'border-white/20'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Type className="w-4 h-4" /> Text Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TEXT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${textColor === color ? 'border-primary scale-110' : 'border-white/20'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Mirror Mode */}
              <div className="bg-background/50 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <FlipHorizontal className="w-4 h-4 text-primary" /> Mirror Mode
                    </label>
                    <p className="text-xs text-muted-foreground">Flip text for physical teleprompter glass</p>
                  </div>
                  <Switch checked={isMirrored} onCheckedChange={setIsMirrored} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
