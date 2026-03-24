import React from 'react';
import { useTeleprompter } from '@/store/use-teleprompter';
import { Link } from 'wouter';
import { 
  Play, Settings, Type, AlignLeft, Palette, FlipHorizontal, 
  Video, MonitorUp, Zap
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';

const PRESET_BG_COLORS = ['#000000', '#111827', '#1e1b4b', '#064e3b', '#450a0a'];
const PRESET_TEXT_COLORS = ['#ffffff', '#f8fafc', '#fef08a', '#a7f3d0', '#bfdbfe'];

export default function Editor() {
  const {
    text, setText,
    speed, setSpeed,
    fontSize, setFontSize,
    bgColor, setBgColor,
    textColor, setTextColor,
    isMirrored, setIsMirrored,
    lineHeight, setLineHeight
  } = useTeleprompter();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col h-screen max-h-screen relative z-10 border-r border-border/50">
        
        {/* Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-border/50 bg-card/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Video className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Teleprompter<span className="text-primary">Pro</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider hidden sm:block">
              {text.split(/\s+/).filter(w => w.length > 0).length} Words
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

        {/* Text Area */}
        <div className="flex-1 p-6 md:p-10 relative overflow-hidden bg-gradient-to-b from-background to-card/20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full relative"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your speech script here..."
              className="w-full h-full bg-transparent resize-none outline-none text-foreground/90 placeholder:text-muted-foreground/50 font-sans leading-relaxed text-lg md:text-xl p-4 rounded-xl border border-transparent focus:border-border/50 focus:bg-card/30 transition-colors duration-300"
              spellCheck="false"
            />
          </motion.div>
        </div>
      </div>

      {/* Settings Sidebar */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 h-screen overflow-y-auto bg-card/40 backdrop-blur-xl border-l border-white/5 relative z-20">
        <div className="p-6 space-y-8">
          
          <div className="flex items-center gap-2 text-foreground mb-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-lg">Display Settings</h2>
          </div>

          {/* Speed Control */}
          <div className="space-y-4 bg-background/50 p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4" /> Scroll Speed
              </label>
              <span className="text-primary font-mono text-sm font-bold bg-primary/10 px-2 py-0.5 rounded">
                {speed}
              </span>
            </div>
            <Slider 
              value={speed} 
              min={1} 
              max={10} 
              step={1} 
              onValueChange={setSpeed} 
            />
          </div>

          {/* Typography Controls */}
          <div className="space-y-6 bg-background/50 p-5 rounded-2xl border border-white/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Type className="w-4 h-4" /> Font Size
                </label>
                <span className="text-foreground font-mono text-sm">{fontSize}px</span>
              </div>
              <Slider 
                value={fontSize} 
                min={24} 
                max={120} 
                step={2} 
                onValueChange={setFontSize} 
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <AlignLeft className="w-4 h-4" /> Line Height
                </label>
                <span className="text-foreground font-mono text-sm">{lineHeight}x</span>
              </div>
              <Slider 
                value={lineHeight} 
                min={1} 
                max={3} 
                step={0.1} 
                onValueChange={setLineHeight} 
              />
            </div>
          </div>

          {/* Color Controls */}
          <div className="space-y-6 bg-background/50 p-5 rounded-2xl border border-white/5">
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Palette className="w-4 h-4" /> Background Color
              </label>
              <div className="flex gap-2">
                {PRESET_BG_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${bgColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Set background to ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Type className="w-4 h-4" /> Text Color
              </label>
              <div className="flex gap-2">
                {PRESET_TEXT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setTextColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${textColor === color ? 'border-primary scale-110' : 'border-border'}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Set text to ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="bg-background/50 p-5 rounded-2xl border border-white/5 space-y-4">
             <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <FlipHorizontal className="w-4 h-4 text-primary" /> Mirror Mode
                </label>
                <p className="text-xs text-muted-foreground">Flip text for physical teleprompters</p>
              </div>
              <Switch checked={isMirrored} onCheckedChange={setIsMirrored} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
