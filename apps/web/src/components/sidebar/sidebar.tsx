"use client";

import { useUiStore } from "@/stores/ui-store";
import { useMemoryStore } from "@/stores/memory-store";
import { useCanvasStore } from "@/stores/canvas-store";
import { cn } from "@/lib/utils/cn";
import {
  X,
  Palette,
  BookOpen,
  Clock,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useCallback } from "react";

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const sidebarTab = useUiStore((s) => s.sidebarTab);
  const setSidebarTab = useUiStore((s) => s.setSidebarTab);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const tabs = [
    { id: "style" as const, label: "Style", icon: Palette },
    { id: "examples" as const, label: "Examples", icon: ImagePlus },
    { id: "history" as const, label: "History", icon: Clock },
    { id: "memory" as const, label: "Memory", icon: BookOpen },
  ];

  return (
    <div
      className={cn(
        "fixed right-0 top-14 bottom-0 w-80 bg-white border-l border-slate-200 z-40 transition-transform duration-300 flex flex-col",
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 px-2 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors border-b-2 -mb-px",
              sidebarTab === tab.id
                ? "text-blue-600 border-blue-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
        <button
          onClick={toggleSidebar}
          className="ml-auto text-slate-400 hover:text-slate-600 p-2"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {sidebarTab === "style" && <StylePanel />}
        {sidebarTab === "examples" && <ExamplesPanel />}
        {sidebarTab === "history" && <HistoryPanel />}
        {sidebarTab === "memory" && <MemoryPanel />}
      </div>
    </div>
  );
}

function StylePanel() {
  const palettes = {
    Professional: ["#1e293b", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
    Warm: ["#1c1917", "#dc2626", "#ea580c", "#d97706", "#65a30d"],
    Cool: ["#0f172a", "#2563eb", "#7c3aed", "#06b6d4", "#14b8a6"],
    Minimal: ["#18181b", "#71717a", "#a1a1aa", "#3b82f6", "#10b981"],
    Vibrant: ["#1e1b4b", "#7c3aed", "#ec4899", "#06b6d4", "#f59e0b"],
  };

  const addPreference = useMemoryStore((s) => s.addPreference);

  function applyPalette(name: string, colors: string[]) {
    addPreference({
      id: `palette_${name}`,
      category: "color",
      key: "palette",
      value: JSON.stringify(colors),
      source: "explicit",
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">Color Palettes</h3>
      <p className="text-xs text-slate-500">
        Choose a palette for future generations.
      </p>
      {Object.entries(palettes).map(([name, colors]) => (
        <button
          key={name}
          onClick={() => applyPalette(name, colors)}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
        >
          <div className="flex gap-1">
            {colors.map((color) => (
              <div
                key={color}
                className="w-5 h-5 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">
            {name}
          </span>
        </button>
      ))}
    </div>
  );
}

function ExamplesPanel() {
  const examples = useMemoryStore((s) => s.examples);
  const addExample = useMemoryStore((s) => s.addExample);
  const removeExample = useMemoryStore((s) => s.removeExample);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          addExample({
            id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            dataUrl: reader.result as string,
            filename: file.name,
            tags: [],
            createdAt: new Date().toISOString(),
          });
        };
        reader.readAsDataURL(file);
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addExample]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">
        Example Figures
      </h3>
      <p className="text-xs text-slate-500">
        Upload figures you like. FigCraft will learn your visual style from
        these examples.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus size={14} />
        Upload Examples
      </Button>

      {examples.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          No examples yet. Upload some LinkedIn figures you admire.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {examples.map((ex) => (
            <div key={ex.id} className="relative group">
              <img
                src={ex.dataUrl}
                alt={ex.filename}
                className="w-full aspect-square object-cover rounded-lg border border-slate-200"
              />
              <button
                onClick={() => removeExample(ex.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryPanel() {
  const history = useMemoryStore((s) => s.history);
  const pushFigure = useCanvasStore((s) => s.pushFigure);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">
        Generation History
      </h3>

      {history.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          No history yet. Generate your first figure.
        </p>
      ) : (
        <div className="space-y-2">
          {history.map((record) => (
            <button
              key={record.id}
              onClick={() => pushFigure(record.schema)}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <p className="text-xs font-medium text-slate-700 truncate">
                {record.prompt}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {new Date(record.createdAt).toLocaleDateString()} at{" "}
                {new Date(record.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryPanel() {
  const preferences = useMemoryStore((s) => s.preferences);
  const removePreference = useMemoryStore((s) => s.removePreference);
  const examples = useMemoryStore((s) => s.examples);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">Stored Memory</h3>
      <p className="text-xs text-slate-500">
        Your preferences and learned styles persist across sessions.
      </p>

      <div className="bg-slate-50 rounded-lg p-3">
        <p className="text-xs font-medium text-slate-600">
          {preferences.length} preference{preferences.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-slate-500">
          {examples.length} example image{examples.length !== 1 ? "s" : ""}
        </p>
      </div>

      {preferences.length > 0 && (
        <div className="space-y-1">
          {preferences.map((pref) => (
            <div
              key={pref.id}
              className="flex items-center justify-between p-2 rounded border border-slate-100"
            >
              <div>
                <p className="text-xs font-medium text-slate-700">
                  {pref.key}
                </p>
                <p className="text-[10px] text-slate-400">
                  {typeof pref.value === "string" && pref.value.length > 30
                    ? `${pref.value.slice(0, 30)}...`
                    : String(pref.value)}
                </p>
              </div>
              <button
                onClick={() => removePreference(pref.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
