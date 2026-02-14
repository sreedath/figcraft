"use client";

import {
  Settings,
  Download,
  PanelRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { useCanvasStore } from "@/stores/canvas-store";
import { useMemoryStore } from "@/stores/memory-store";

export function Header() {
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const setExportOpen = useUiStore((s) => s.setExportOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const currentFigure = useCanvasStore((s) => s.currentFigure);
  const apiKey = useMemoryStore((s) => s.apiKey);

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">
            FigCraft
          </h1>
          <p className="text-[10px] text-slate-400 leading-tight">
            LinkedIn Figure Builder
          </p>
        </div>
      </div>

      {/* Center: Figure title */}
      {currentFigure?.meta?.title && (
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <span className="text-sm font-medium text-slate-600 truncate max-w-[300px] block">
            {currentFigure.meta.title}
          </span>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {!apiKey && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            Add API Key
          </Button>
        )}

        {currentFigure && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExportOpen(true)}
            title="Export"
          >
            <Download size={16} />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          title="Toggle sidebar"
        >
          <PanelRight size={16} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
        >
          <Settings size={16} />
        </Button>
      </div>
    </header>
  );
}
