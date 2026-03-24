import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TeleprompterState {
  text: string;
  setText: (text: string) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  isMirrored: boolean;
  setIsMirrored: (mirrored: boolean) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
}

// Default placeholder text for first-time users
const DEFAULT_TEXT = `Welcome to your professional teleprompter.

This tool is designed to help you maintain eye contact with the camera while delivering your speech smoothly.

To get started, simply paste your script into the editor.

You can adjust the speed, font size, and colors using the controls on the right.

If you are using a physical teleprompter glass, make sure to enable "Mirror Mode" so the text reflects correctly.

When you're ready, hit the "Start Prompter" button.

During playback:
• Press SPACE to play or pause
• Press UP/DOWN arrows to adjust speed
• Press ESC to return to the editor

Good luck with your presentation!`;

export const useTeleprompter = create<TeleprompterState>()(
  persist(
    (set) => ({
      text: DEFAULT_TEXT,
      setText: (text) => set({ text }),
      speed: 5, // 1-10 range
      setSpeed: (speed) => set({ speed: Math.max(1, Math.min(10, speed)) }),
      fontSize: 64, // px
      setFontSize: (fontSize) => set({ fontSize: Math.max(24, Math.min(150, fontSize)) }),
      textColor: '#ffffff',
      setTextColor: (textColor) => set({ textColor }),
      bgColor: '#000000',
      setBgColor: (bgColor) => set({ bgColor }),
      isMirrored: false,
      setIsMirrored: (isMirrored) => set({ isMirrored }),
      lineHeight: 1.5,
      setLineHeight: (lineHeight) => set({ lineHeight: Math.max(1, Math.min(3, lineHeight)) }),
    }),
    {
      name: 'teleprompter-storage',
    }
  )
);
