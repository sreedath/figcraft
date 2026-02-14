import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  StylePreference,
  ExampleImage,
  GenerationRecord,
} from "@/types/memory";

interface MemoryState {
  apiKey: string;
  preferences: StylePreference[];
  examples: ExampleImage[];
  history: GenerationRecord[];

  setApiKey: (key: string) => void;
  getApiKey: () => string;

  addPreference: (pref: StylePreference) => void;
  updatePreference: (id: string, value: string | number) => void;
  removePreference: (id: string) => void;

  addExample: (example: ExampleImage) => void;
  removeExample: (id: string) => void;

  addHistoryRecord: (record: GenerationRecord) => void;
  clearHistory: () => void;
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      apiKey: "",
      preferences: [],
      examples: [],
      history: [],

      setApiKey: (key) => set({ apiKey: key }),
      getApiKey: () => get().apiKey,

      addPreference: (pref) =>
        set({
          preferences: [
            ...get().preferences.filter((p) => p.key !== pref.key),
            pref,
          ],
        }),

      updatePreference: (id, value) =>
        set({
          preferences: get().preferences.map((p) =>
            p.id === id ? { ...p, value, updatedAt: new Date().toISOString() } : p
          ),
        }),

      removePreference: (id) =>
        set({
          preferences: get().preferences.filter((p) => p.id !== id),
        }),

      addExample: (example) =>
        set({ examples: [...get().examples, example] }),

      removeExample: (id) =>
        set({ examples: get().examples.filter((e) => e.id !== id) }),

      addHistoryRecord: (record) =>
        set({ history: [record, ...get().history].slice(0, 100) }),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "figcraft-memory",
      partialize: (state) => ({
        apiKey: state.apiKey,
        preferences: state.preferences,
        examples: state.examples,
        history: state.history,
      }),
    }
  )
);
