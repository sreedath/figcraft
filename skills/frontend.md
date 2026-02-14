# Skill: Frontend Development

## Purpose
Build a world-class UI that feels effortless. Users should never think about "how" to use the tool — it should be obvious.

## Core Principles

### 1. Simplicity Over Features
- The main screen is a canvas + a prompt bar. That's it.
- Advanced features live in collapsible sidebars, never cluttering the default view.
- Every interaction should complete in ≤ 2 clicks.

### 2. Visual Hierarchy
- The canvas is the hero. It takes 80% of the viewport.
- The prompt bar is always visible at the bottom (like a chat input).
- Sidebars slide in from the right only when needed.

### 3. Responsive But Canvas-First
- Optimized for desktop (1200px+). This is a creation tool, not a mobile app.
- Tablet support is secondary but should not break.
- Mobile shows a "use desktop for best experience" message.

## Tech Conventions

### Component Structure
```
components/
├── ui/          # Atomic primitives (Button, Input, Dialog)
│                # Built on Radix UI. Never style from scratch.
├── canvas/      # Canvas-specific components
├── prompt/      # Input and suggestion components
├── sidebar/     # All sidebar panels
├── export/      # Export-related UI
└── layout/      # Page-level layout components
```

### State Management
- **Zustand** for all global state. No prop drilling past 2 levels.
- Three stores: `canvas-store`, `generation-store`, `ui-store`.
- Each store is a single file with typed actions.

### Styling Rules
- Tailwind CSS only. No CSS modules, no styled-components.
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes.
- Design tokens defined in `packages/ui-kit/src/tokens.ts`.
- Dark mode support from day 1 (Tailwind `dark:` prefix).

### Animations
- Use Framer Motion for panel transitions and element appearance.
- Canvas interactions (drag, resize) must be 60fps — use CSS transforms, not layout properties.
- Loading states use skeleton shimmer, never spinners.

### Fonts
- **Inter** for UI text (clean, professional).
- **JetBrains Mono** for code/technical labels inside figures.
- Self-hosted in `public/fonts/` — no Google Fonts CDN.

## Key Components

### PromptBar
- Fixed at bottom of viewport.
- Supports multiline input (auto-grows).
- Shows generation progress inline (streaming).
- Has a "regenerate" button after first generation.
- Shows contextual suggestions based on current canvas state.

### ExcalidrawWrapper
- Wraps `@excalidraw/excalidraw` React component.
- Disables Excalidraw's default toolbar (we provide our own).
- Intercepts element changes to sync with our canvas store.
- Handles custom rendering for image slots and text blocks.

### StagingPromoteButton
- Only visible in staging environment.
- Shows diff summary of changes since last production deploy.
- Requires confirmation dialog before promoting.
- Shows real-time deployment status after clicking.

## Accessibility
- All interactive elements have focus styles.
- Keyboard navigation for all panels.
- Screen reader labels on all buttons and inputs.
- Color contrast ratio ≥ 4.5:1 for all text.

## Error Handling
- API errors show toast notifications with retry buttons.
- Canvas errors show inline recovery UI, never crash the page.
- Network errors show offline indicator with auto-reconnect.
- Never show raw error messages or stack traces to users.
