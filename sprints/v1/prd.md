# Sprint v1 — MVP: Core Figure Generation

## Goal
Ship a working web app where users type a description and get a professional LinkedIn figure rendered on an Excalidraw canvas, with drag-drop editing, export, and memory.

## Success Criteria
- User can enter an OpenAI API key
- User types a prompt → gets a rendered figure in < 15s
- Figure has title, diagram blocks, arrows, and takeaway
- User can drag/drop elements to rearrange
- User can refine with follow-up instructions
- User can regenerate for a new variation
- User can export as PNG/SVG/JSON
- User can upload example images to memory
- Memory persists across sessions (localStorage)
- App builds with zero errors
- Playwright E2E tests pass

## Tasks

### T1: Project setup and build verification (5 min)
- [x] Initialize Next.js with TypeScript, Tailwind, Excalidraw
- [x] Verify production build passes with zero errors
- **Status:** DONE

### T2: API key onboarding (5 min)
- [x] Settings dialog with OpenAI API key input
- [x] Key stored in localStorage (zustand persist)
- [x] Auto-open on first visit
- **Status:** DONE

### T3: Schema generation (10 min)
- [x] GPT-4o prompt for NL → FigureSchema JSON
- [x] Client-side API call (no server proxy needed for MVP)
- [x] Structured output with json_object mode
- **Status:** DONE

### T4: Schema → Excalidraw renderer (10 min)
- [x] Convert FigureSchema elements to Excalidraw elements
- [x] Handle text, blocks, arrows, containers, dividers, image placeholders
- [x] Geometric positioning with grid snapping
- **Status:** DONE

### T5: Canvas integration (10 min)
- [x] Embed Excalidraw with custom config
- [x] Hide default toolbars
- [x] Update scene when figure changes
- [x] Fit to viewport after render
- **Status:** DONE

### T6: Prompt bar with refinement (10 min)
- [x] Text input at bottom of viewport
- [x] Generate new figure on first submit
- [x] Refine existing figure on subsequent submits
- [x] Regenerate button
- [x] Undo/redo support
- **Status:** DONE

### T7: Export (5 min)
- [x] PNG export (via Excalidraw)
- [x] SVG export
- [x] JSON schema export
- **Status:** DONE

### T8: Sidebar with memory (10 min)
- [x] Style panel with color palettes
- [x] Examples panel with image upload
- [x] History panel with past generations
- [x] Memory panel showing stored preferences
- **Status:** DONE

### T9: E2E testing with Playwright (10 min)
- [ ] Install Playwright with Chromium
- [ ] Test: app loads without errors
- [ ] Test: settings dialog opens on first visit
- [ ] Test: can enter API key
- [ ] Test: canvas renders
- **Status:** TODO

### T10: GitHub repo + CI (10 min)
- [ ] Initialize git repo
- [ ] Create GitHub repo
- [ ] Push code
- [ ] Set up CI workflow
- **Status:** TODO
