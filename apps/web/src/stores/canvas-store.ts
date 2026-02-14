import { create } from "zustand";
import type { FigureSchema } from "@/types/figure";

interface CanvasState {
  currentFigure: FigureSchema | null;
  history: FigureSchema[];
  historyIndex: number;
  isLoading: boolean;
  error: string | null;

  setFigure: (figure: FigureSchema) => void;
  pushFigure: (figure: FigureSchema) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  currentFigure: null,
  history: [],
  historyIndex: -1,
  isLoading: false,
  error: null,

  setFigure: (figure) => {
    set({ currentFigure: figure });
  },

  pushFigure: (figure) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(figure);
    set({
      currentFigure: figure,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      error: null,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        currentFigure: history[newIndex],
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        currentFigure: history[newIndex],
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  clear: () =>
    set({
      currentFigure: null,
      history: [],
      historyIndex: -1,
      error: null,
    }),
}));
