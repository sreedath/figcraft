import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  sidebarTab: "style" | "memory" | "history" | "examples";
  settingsOpen: boolean;
  exportOpen: boolean;
  toasts: Toast[];

  toggleSidebar: () => void;
  setSidebarTab: (tab: UiState["sidebarTab"]) => void;
  setSettingsOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: false,
  sidebarTab: "style",
  settingsOpen: false,
  exportOpen: false,
  toasts: [],

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setSidebarTab: (tab) => set({ sidebarTab: tab, sidebarOpen: true }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setExportOpen: (open) => set({ exportOpen: open }),

  addToast: (toast) => {
    const id = `toast_${Date.now()}`;
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) =>
    set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
