"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useCanvasStore } from "@/stores/canvas-store";
import { schemaToExcalidrawElements } from "@/lib/excalidraw/schema-to-elements";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

export function ExcalidrawCanvas() {
  const [ExcalidrawComp, setExcalidrawComp] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const currentFigure = useCanvasStore((s) => s.currentFigure);

  // Dynamic import for Excalidraw (client-side only)
  useEffect(() => {
    import("@excalidraw/excalidraw").then((mod) => {
      setExcalidrawComp(() => mod.Excalidraw as unknown as React.ComponentType<Record<string, unknown>>);
    });
  }, []);

  // Update canvas when figure changes
  useEffect(() => {
    if (!currentFigure || !excalidrawRef.current) return;

    const elements = schemaToExcalidrawElements(currentFigure);
    excalidrawRef.current.updateScene({
      elements,
      appState: {
        viewBackgroundColor: currentFigure.canvas?.background || "#ffffff",
      },
    });

    // Fit to view after a brief delay to let elements render
    setTimeout(() => {
      excalidrawRef.current?.scrollToContent(undefined, { fitToViewport: true });
    }, 100);
  }, [currentFigure]);

  const handleExcalidrawRef = useCallback((api: ExcalidrawImperativeAPI) => {
    excalidrawRef.current = api;
  }, []);

  if (!ExcalidrawComp) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 text-sm">
          Loading canvas...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {!currentFigure && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Describe your figure
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Type a description in the prompt bar below and FigCraft will
              generate a professional LinkedIn figure with diagrams, text, and
              layout — all editable.
            </p>
          </div>
        </div>
      )}
      <ExcalidrawComp
        excalidrawAPI={handleExcalidrawRef}
        initialData={{
          appState: {
            viewBackgroundColor: "#ffffff",
            theme: "light",
            gridSize: 20,
          },
        }}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
            export: false,
          },
        }}
      />
    </div>
  );
}
