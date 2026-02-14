"use client";

import { useState, useRef, useCallback } from "react";
import {
  Send,
  RefreshCw,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useCanvasStore } from "@/stores/canvas-store";
import { useMemoryStore } from "@/stores/memory-store";
import { useUiStore } from "@/stores/ui-store";
import { generateFigureSchema, refineFigureSchema } from "@/lib/ai/schema-generator";
import { generateFigureId } from "@/lib/utils/id";
import type { FigureSchema } from "@/types/figure";

export function PromptBar() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentFigure = useCanvasStore((s) => s.currentFigure);
  const isLoading = useCanvasStore((s) => s.isLoading);
  const pushFigure = useCanvasStore((s) => s.pushFigure);
  const setLoading = useCanvasStore((s) => s.setLoading);
  const setError = useCanvasStore((s) => s.setError);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.canUndo);
  const canRedo = useCanvasStore((s) => s.canRedo);

  const apiKey = useMemoryStore((s) => s.apiKey);
  const preferences = useMemoryStore((s) => s.preferences);
  const addHistoryRecord = useMemoryStore((s) => s.addHistoryRecord);
  const addToast = useUiStore((s) => s.addToast);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);

  const handleSubmit = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    if (!apiKey) {
      setSettingsOpen(true);
      addToast({ message: "Please add your OpenAI API key first", type: "info" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let schema: FigureSchema;

      if (currentFigure) {
        // Refine existing figure
        schema = await refineFigureSchema(currentFigure, prompt, apiKey);
      } else {
        // Generate new figure
        schema = await generateFigureSchema(prompt, apiKey, preferences);
      }

      // Ensure the schema has required fields
      if (!schema.id) schema.id = generateFigureId();
      if (!schema.version) schema.version = 1;
      if (!schema.meta) {
        schema.meta = {
          title: "",
          prompt,
          createdAt: new Date().toISOString(),
        };
      }
      if (!schema.canvas) {
        schema.canvas = {
          width: 1200,
          height: 1500,
          background: "#ffffff",
          padding: 80,
        };
      }
      if (!schema.style) {
        schema.style = {
          palette: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
          fontFamily: "Inter",
          headingSize: 32,
          bodySize: 16,
          borderRadius: 12,
          shadow: false,
        };
      }

      pushFigure(schema);

      addHistoryRecord({
        id: schema.id,
        prompt,
        schema,
        editPrompt: currentFigure ? prompt : undefined,
        parentId: currentFigure?.id,
        createdAt: new Date().toISOString(),
      });

      setInput("");
      addToast({
        message: currentFigure ? "Figure updated" : "Figure generated",
        type: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
      addToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [
    input,
    isLoading,
    apiKey,
    currentFigure,
    preferences,
    setLoading,
    setError,
    pushFigure,
    addHistoryRecord,
    addToast,
    setSettingsOpen,
  ]);

  const handleRegenerate = useCallback(async () => {
    if (!currentFigure || isLoading || !apiKey) return;

    setLoading(true);
    setError(null);

    try {
      const schema = await generateFigureSchema(
        currentFigure.meta.prompt,
        apiKey,
        preferences
      );
      schema.id = generateFigureId();
      schema.version = (currentFigure.version || 0) + 1;
      pushFigure(schema);
      addToast({ message: "Regenerated with a new variation", type: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Regeneration failed";
      setError(message);
      addToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [currentFigure, isLoading, apiKey, preferences, setLoading, setError, pushFigure, addToast]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Toolbar row */}
        {currentFigure && (
          <div className="flex items-center gap-1 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo()}
              title="Undo"
            >
              <Undo2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo()}
              title="Redo"
            >
              <Redo2 size={16} />
            </Button>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={isLoading}
              title="Regenerate"
            >
              <RefreshCw size={16} />
              <span className="text-xs">Regenerate</span>
            </Button>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                currentFigure
                  ? "Describe changes... (e.g., 'make the title bigger', 'add a loss function block')"
                  : "Describe your figure... (e.g., 'Explain the VL-JEPA architecture')"
              }
              rows={1}
              className={cn(
                "w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white",
                "min-h-[44px] max-h-[120px]"
              )}
              style={{
                height: "auto",
                overflow: "hidden",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="mt-2">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-shimmer bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-[length:200%_100%]" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentFigure ? "Refining your figure..." : "Generating your figure..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
