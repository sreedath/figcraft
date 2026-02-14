"use client";

import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

export function Toasts() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "animate-slide-up flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg max-w-sm",
            {
              "bg-green-600 text-white": toast.type === "success",
              "bg-red-600 text-white": toast.type === "error",
              "bg-slate-800 text-white": toast.type === "info",
            }
          )}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
