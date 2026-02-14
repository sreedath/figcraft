"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemoryStore } from "@/stores/memory-store";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const storedKey = useMemoryStore((s) => s.apiKey);
  const setApiKey = useMemoryStore((s) => s.setApiKey);

  const [key, setKey] = useState(storedKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKey(storedKey);
  }, [storedKey]);

  function handleSave() {
    setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onOpenChange(false);
    }, 1000);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-slide-up">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                Settings
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  OpenAI API Key
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Your key stays in your browser. Never sent to our servers.
                </p>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  FigCraft uses your OpenAI API key for GPT-4o (schema
                  generation) and DALL-E 3 (image generation). Get your key
                  from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={!key.trim()}
                className="w-full"
              >
                {saved ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} /> Saved
                  </span>
                ) : (
                  "Save API Key"
                )}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
