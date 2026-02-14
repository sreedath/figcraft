# Skill: Excalidraw Integration

## Purpose
Use Excalidraw as the rendering and editing engine for figure schematics. Excalidraw gives us the hand-drawn aesthetic, drag-drop editing, and a rich element model — but we need to extend it significantly.

## How We Use Excalidraw

### Embedded, Not Standalone
- We embed `@excalidraw/excalidraw` as a React component.
- We control which tools and features are exposed.
- We overlay our own UI on top (image slots, rich text blocks).
- We programmatically create and position elements — users don't manually draw.

### Element Types We Use
From Excalidraw's native elements:
- **Rectangle** — blocks, containers, cards
- **Ellipse** — nodes, highlights
- **Diamond** — decision points
- **Arrow** — data flow, connections
- **Line** — dividers, connectors
- **Text** — labels, titles (but we enhance this)

Custom elements we overlay:
- **ImageSlot** — positioned div over canvas with AI-generated image
- **RichTextBlock** — styled text with markdown support
- **BadgeElement** — small colored tags/labels

### Excalidraw MCP Integration
We use the Excalidraw MCP server for:
- `read_me` — get element format reference before generating
- `create_view` — render diagrams with draw-on animations
- `export_to_excalidraw` — get shareable URLs
- `save_checkpoint` / `read_checkpoint` — state persistence

### Programmatic Element Creation
All elements are created via typed builder functions, never manually:

```typescript
// element-builders.ts
function createBlock(opts: {
  x: number; y: number;
  width: number; height: number;
  label: string;
  color: string;
  style?: 'solid' | 'dashed' | 'dotted';
}): ExcalidrawElement[]  // Returns rect + text

function createArrow(opts: {
  from: { id: string; side: 'top' | 'right' | 'bottom' | 'left' };
  to: { id: string; side: 'top' | 'right' | 'bottom' | 'left' };
  label?: string;
  style?: 'normal' | 'thick' | 'dashed';
}): ExcalidrawElement[]  // Returns arrow + optional label

function createGroup(opts: {
  elements: ExcalidrawElement[];
  label?: string;
  background?: string;
  padding?: number;
}): ExcalidrawElement[]  // Returns group container + children
```

## Style Presets

### Color Palettes
```typescript
const PALETTES = {
  professional: ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  warm: ['#1c1917', '#dc2626', '#ea580c', '#d97706', '#65a30d', '#0891b2'],
  cool: ['#0f172a', '#2563eb', '#7c3aed', '#06b6d4', '#14b8a6', '#6366f1'],
  minimal: ['#18181b', '#71717a', '#a1a1aa', '#3b82f6', '#10b981', '#f59e0b'],
};
```

### Schematic Styles
- **Clean** — solid fills, rounded corners, subtle shadows
- **Sketch** — Excalidraw's hand-drawn style, roughness=1
- **Technical** — sharp corners, thin borders, monospace labels
- **Bold** — thick borders, large text, high contrast

## Geometric Rules
1. **Grid snapping:** All elements snap to 20px grid.
2. **Minimum spacing:** 40px between elements, 20px within groups.
3. **Consistent sizing:** Blocks in the same row have equal height.
4. **Arrow routing:** Arrows avoid overlapping elements (simple orthogonal routing).
5. **Text alignment:** All text within blocks is centered. Labels on arrows are centered on the arrow midpoint.
6. **Proportional scaling:** When canvas resizes, elements scale proportionally.

## Canvas Dimensions
- Default: 1200 x 1500px (LinkedIn optimal for carousel-style posts)
- Also support: 1200 x 1200 (square), 1200 x 628 (link preview)
- Background is always solid color (no gradients for clean look).

## Export Pipeline
1. Render Excalidraw elements to SVG
2. Overlay custom elements (images, rich text) onto SVG
3. Convert to PNG using canvas API (for LinkedIn upload)
4. Optional: PDF export for presentations
