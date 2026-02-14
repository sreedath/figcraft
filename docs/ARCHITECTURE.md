# Architecture

## System Overview

FigCraft is a Next.js application that converts natural language descriptions into publication-quality LinkedIn figures using a combination of:

1. **Schema Engine** — Claude API converts text → structured FigureSchema JSON
2. **Layout Engine** — Positions elements with geometric precision
3. **Excalidraw** — Renders the schematic diagram layer
4. **Image Generation** — DALL-E/FLUX generates contextual illustrations
5. **Memory System** — PostgreSQL stores preferences, examples, and history

## Request Flow

```
Browser → Next.js API Route → Claude API → FigureSchema JSON
                                                    ↓
                                            Layout Engine
                                                    ↓
                                         Excalidraw Elements
                                                    ↓
                                            Canvas Render
```

## Key Design Decisions

### Why Excalidraw?
- Hand-drawn aesthetic is distinctive and appealing on LinkedIn
- Built-in drag-and-drop editing
- Rich element model (shapes, arrows, text, groups)
- MIT licensed, actively maintained
- Can be embedded as a React component

### Why Separate Schema and Layout Engines?
- Schema engine focuses on *what* elements to create (Claude's strength)
- Layout engine focuses on *where* to place them (algorithmic, deterministic)
- This separation means layout is always geometrically correct, regardless of AI output quality

### Why PostgreSQL for Memory?
- Structured data (preferences have a schema)
- JSONB for flexible analysis data
- Reliable, battle-tested
- Railway provides managed Postgres

### Why Railway?
- Git-based deploys (push to branch → auto-deploy)
- Supports multiple services from one repo
- Built-in PostgreSQL
- Affordable for hobby/startup scale
- Easy environment variable management

## Package Boundaries

- `apps/web` — The Next.js application. All UI and API routes.
- `packages/schema-engine` — Pure logic for NL → schema conversion. No UI dependencies.
- `packages/layout-engine` — Pure math for element positioning. No UI dependencies.
- `packages/ui-kit` — Design tokens and shared primitives. No app-specific logic.
