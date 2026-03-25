import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Chapter {
  id: string;
  title: string;
  text: string;
}

interface TeleprompterState {
  chapters: Chapter[];
  activeChapterId: string;
  addChapter: () => void;
  deleteChapter: (id: string) => void;
  updateChapter: (id: string, updates: Partial<Pick<Chapter, 'title' | 'text'>>) => void;
  setActiveChapterId: (id: string) => void;
  moveChapter: (fromIndex: number, toIndex: number) => void;

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

const DEFAULT_CHAPTERS: Chapter[] = [
  {
    id: 'ch-1',
    title: 'Introduction',
    text: `Welcome to your professional teleprompter.

This tool is designed to help you maintain eye contact with the camera while delivering your speech smoothly.

To get started, replace this text with your own script.`,
  },
  {
    id: 'ch-2',
    title: 'Main Content',
    text: `You can adjust the speed, font size, and colors using the controls on the right.

If you are using a physical teleprompter glass, make sure to enable "Mirror Mode" so the text reflects correctly.`,
  },
  {
    id: 'ch-3',
    title: 'Closing',
    text: `During playback:
• Press SPACE to play or pause
• Press UP/DOWN arrows to adjust speed
• Press ESC to return to the editor

Good luck with your presentation!`,
  },
];

function generateId() {
  return 'ch-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const useTeleprompter = create<TeleprompterState>()(
  persist(
    (set, get) => ({
      chapters: DEFAULT_CHAPTERS,
      activeChapterId: DEFAULT_CHAPTERS[0].id,

      addChapter: () => {
        const newChapter: Chapter = {
          id: generateId(),
          title: `Section ${get().chapters.length + 1}`,
          text: '',
        };
        set(state => ({
          chapters: [...state.chapters, newChapter],
          activeChapterId: newChapter.id,
        }));
      },

      deleteChapter: (id: string) => {
        const state = get();
        if (state.chapters.length <= 1) return;
        const idx = state.chapters.findIndex(c => c.id === id);
        const remaining = state.chapters.filter(c => c.id !== id);
        const newActiveId = state.activeChapterId === id
          ? (remaining[Math.max(0, idx - 1)]?.id ?? remaining[0].id)
          : state.activeChapterId;
        set({ chapters: remaining, activeChapterId: newActiveId });
      },

      updateChapter: (id: string, updates) => {
        set(state => ({
          chapters: state.chapters.map(c => c.id === id ? { ...c, ...updates } : c),
        }));
      },

      setActiveChapterId: (id: string) => set({ activeChapterId: id }),

      moveChapter: (fromIndex: number, toIndex: number) => {
        const state = get();
        const chapters = [...state.chapters];
        const [moved] = chapters.splice(fromIndex, 1);
        chapters.splice(toIndex, 0, moved);
        set({ chapters });
      },

      speed: 5,
      setSpeed: (speed) => set({ speed: Math.max(1, Math.min(10, speed)) }),
      fontSize: 64,
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
