"use client";

import { Header } from "@/components/header";
import { ExcalidrawCanvas } from "@/components/canvas/excalidraw-canvas";
import { PromptBar } from "@/components/prompt-bar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SettingsDialog } from "@/components/settings-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { Toasts } from "@/components/ui/toast";
import { useUiStore } from "@/stores/ui-store";
import { useMemoryStore } from "@/stores/memory-store";
import { useEffect, useState } from "react";

export default function Home() {
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const apiKey = useMemoryStore((s) => s.apiKey);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show settings on first visit if no API key
  useEffect(() => {
    if (mounted && !apiKey) {
      setSettingsOpen(true);
    }
  }, [mounted, apiKey, setSettingsOpen]);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Loading FigCraft...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <ExcalidrawCanvas />
      </div>
      <PromptBar />
      <Sidebar />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ExportDialog />
      <Toasts />
    </div>
  );
}
