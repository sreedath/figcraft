"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Download, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/stores/canvas-store";
import { useUiStore } from "@/stores/ui-store";
import { useState } from "react";

export function ExportDialog() {
  const open = useUiStore((s) => s.exportOpen);
  const setOpen = useUiStore((s) => s.setExportOpen);
  const addToast = useUiStore((s) => s.addToast);
  const currentFigure = useCanvasStore((s) => s.currentFigure);
  const [exporting, setExporting] = useState(false);

  async function handleExport(format: "png" | "svg" | "json") {
    if (!currentFigure) return;

    setExporting(true);
    try {
      if (format === "json") {
        const blob = new Blob(
          [JSON.stringify(currentFigure, null, 2)],
          { type: "application/json" }
        );
        downloadBlob(blob, `${currentFigure.meta?.title || "figure"}.json`);
        addToast({ message: "JSON exported", type: "success" });
      } else if (format === "png" || format === "svg") {
        // Export from Excalidraw canvas
        const { exportToBlob, exportToSvg } = await import(
          "@excalidraw/excalidraw"
        );

        // Get canvas element to read current elements
        const canvasEl = document.querySelector(
          ".excalidraw"
        ) as HTMLElement | null;
        if (!canvasEl) {
          addToast({ message: "Canvas not found", type: "error" });
          return;
        }

        // Access excalidraw state from the DOM
        const excalidrawElements = (
          window as unknown as Record<string, unknown>
        ).__excalidraw_elements;

        if (format === "png") {
          const blob = await exportToBlob({
            elements: (excalidrawElements as Parameters<typeof exportToBlob>[0]["elements"]) || [],
            appState: {
              viewBackgroundColor:
                currentFigure.canvas?.background || "#ffffff",
              exportWithDarkMode: false,
            },
            files: null,
          });
          downloadBlob(
            blob,
            `${currentFigure.meta?.title || "figure"}.png`
          );
          addToast({ message: "PNG exported", type: "success" });
        } else {
          const svg = await exportToSvg({
            elements: (excalidrawElements as Parameters<typeof exportToSvg>[0]["elements"]) || [],
            appState: {
              viewBackgroundColor:
                currentFigure.canvas?.background || "#ffffff",
              exportWithDarkMode: false,
            },
            files: null,
          });
          const svgString = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([svgString], { type: "image/svg+xml" });
          downloadBlob(
            blob,
            `${currentFigure.meta?.title || "figure"}.svg`
          );
          addToast({ message: "SVG exported", type: "success" });
        }
      }
    } catch {
      addToast({ message: "Export failed. Try JSON export.", type: "error" });
    } finally {
      setExporting(false);
      setOpen(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm animate-slide-up">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                Export Figure
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start gap-3 h-14"
                onClick={() => handleExport("png")}
                disabled={exporting}
              >
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Image size={16} className="text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">PNG Image</p>
                  <p className="text-xs text-slate-500">
                    Best for LinkedIn posts
                  </p>
                </div>
              </Button>

              <Button
                variant="secondary"
                className="w-full justify-start gap-3 h-14"
                onClick={() => handleExport("svg")}
                disabled={exporting}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText size={16} className="text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">SVG Vector</p>
                  <p className="text-xs text-slate-500">
                    Scalable, editable in design tools
                  </p>
                </div>
              </Button>

              <Button
                variant="secondary"
                className="w-full justify-start gap-3 h-14"
                onClick={() => handleExport("json")}
                disabled={exporting}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Download size={16} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">JSON Schema</p>
                  <p className="text-xs text-slate-500">
                    Reload later or share with others
                  </p>
                </div>
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
