# FigCraft — LinkedIn Figure Builder

## What This Is

A web tool that turns plain English descriptions into publication-quality LinkedIn figures — the kind that get 1,000+ likes. Figures combine Excalidraw-style schematics, AI-generated images, structured text, and precise geometric layouts into a single composable canvas.

This is NOT a flowchart maker. The output must look like hand-crafted technical illustrations — think architecture diagrams from top ML papers, not Mermaid charts.

---

## Non-Negotiables

1. **No broken deploys.** Every PR runs full E2E tests. If tests fail, the PR is blocked.
2. **No AI-looking text.** All generated copy must be concise, human-sounding, and technically precise.
3. **No vibe-coded garbage.** Clean architecture, typed throughout, no `any`, no dead code, no TODO-littered files.
4. **Geometric consistency.** Elements must align to grid, maintain proportional spacing, and respect visual hierarchy.
5. **Works on first try.** Users should never see a runtime error. Every edge case is handled gracefully.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  Next.js 14 (App Router) + TypeScript               │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Canvas      │ │ Prompt   │ │ Style Memory     │  │
│  │ (Excalidraw │ │ Input    │ │ Panel            │  │
│  │  + Custom   │ │ Bar      │ │                  │  │
│  │  Renderer)  │ │          │ │                  │  │
│  └─────────────┘ └──────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────┤
│                    API LAYER                          │
│  Next.js Route Handlers                              │
│  /api/generate   — NL → figure schema                │
│  /api/refine     — edit instructions on existing fig  │
│  /api/images     — AI image generation                │
│  /api/memory     — store/retrieve preferences         │
│  /api/export     — PNG/SVG/PDF export                 │
│  /api/promote    — staging → production promotion     │
├─────────────────────────────────────────────────────┤
│                  CORE ENGINES                         │
│  ┌────────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ Schema Engine  │ │ Layout     │ │ Style        │  │
│  │ NL → Elements  │ │ Engine     │ │ Engine       │  │
│  │ (Claude API)   │ │ (Grid/Auto)│ │ (From Memory)│  │
│  └────────────────┘ └────────────┘ └──────────────┘  │
├─────────────────────────────────────────────────────┤
│                  PERSISTENCE                          │
│  PostgreSQL (via Supabase or Railway Postgres)        │
│  - User preferences & style memory                   │
│  - Example image library (S3/R2 for blobs)           │
│  - Generated figure history + versioning             │
│  - Session data                                      │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | SSR, API routes, great DX |
| Language | TypeScript (strict mode) | No `any`. Ever. |
| Canvas | Excalidraw (embedded) + custom overlay renderer | Drag-drop editing, schematic look |
| Styling | Tailwind CSS + Radix UI primitives | Clean, accessible, fast |
| State | Zustand | Simple, no boilerplate |
| AI - Text/Schema | Claude API (claude-sonnet-4-5-20250929) | Best at structured output |
| AI - Images | OpenAI DALL-E 3 or Replicate (FLUX) | High-quality image gen |
| Database | PostgreSQL (Railway) | Persistent memory, versioning |
| Blob Storage | Cloudflare R2 or S3 | Example images, exports |
| Hosting | Railway (staging + production) | Git-based deploys, easy promote |
| CI/CD | GitHub Actions | PR checks, auto-deploy |
| Testing | Vitest (unit) + Playwright (E2E) | Full coverage |
| Monorepo | Turborepo | Shared packages, fast builds |

---

## Folder Structure

```
LinkedIn-Images/
├── CLAUDE.md                          # This file — project blueprint
├── README.md                          # Public-facing documentation
├── package.json                       # Root workspace config
├── turbo.json                         # Turborepo pipeline config
├── .env.example                       # Required env vars template
├── .gitignore
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                     # Lint + type-check + test on every PR
│   │   ├── deploy-staging.yml         # Auto-deploy main → staging
│   │   └── deploy-production.yml      # Triggered by promotion API
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── skills/                            # Skill definition files
│   ├── frontend.md                    # UI/UX patterns and conventions
│   ├── excalidraw.md                  # Excalidraw integration patterns
│   ├── design-system.md               # Visual design language
│   ├── image-generation.md            # AI image generation patterns
│   ├── schema-engine.md               # NL → figure schema conversion
│   ├── layout-engine.md               # Geometric layout algorithms
│   ├── testing.md                     # Testing strategy and patterns
│   ├── deployment.md                  # CI/CD and hosting setup
│   └── memory-system.md              # Preference & style memory
│
├── apps/
│   └── web/                           # Main Next.js application
│       ├── package.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── playwright.config.ts
│       ├── vitest.config.ts
│       │
│       ├── public/
│       │   ├── fonts/                 # Self-hosted Inter + JetBrains Mono
│       │   └── examples/             # Seed example figures (JSON)
│       │
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx         # Root layout (fonts, providers)
│       │   │   ├── page.tsx           # Landing / canvas page
│       │   │   ├── globals.css
│       │   │   │
│       │   │   ├── editor/
│       │   │   │   └── page.tsx       # Main editor workspace
│       │   │   │
│       │   │   ├── gallery/
│       │   │   │   └── page.tsx       # Browse example figures
│       │   │   │
│       │   │   ├── api/
│       │   │   │   ├── generate/
│       │   │   │   │   └── route.ts   # NL → figure schema
│       │   │   │   ├── refine/
│       │   │   │   │   └── route.ts   # Edit existing figure
│       │   │   │   ├── images/
│       │   │   │   │   └── route.ts   # AI image generation
│       │   │   │   ├── memory/
│       │   │   │   │   └── route.ts   # CRUD preferences
│       │   │   │   ├── export/
│       │   │   │   │   └── route.ts   # PNG/SVG/PDF export
│       │   │   │   ├── figures/
│       │   │   │   │   └── route.ts   # Save/load/version figures
│       │   │   │   └── promote/
│       │   │   │       └── route.ts   # Staging → production
│       │   │   │
│       │   │   └── admin/
│       │   │       └── staging/
│       │   │           └── page.tsx   # Staging review + promote UI
│       │   │
│       │   ├── components/
│       │   │   ├── ui/                # Radix-based primitives
│       │   │   │   ├── button.tsx
│       │   │   │   ├── input.tsx
│       │   │   │   ├── dialog.tsx
│       │   │   │   ├── toast.tsx
│       │   │   │   ├── dropdown.tsx
│       │   │   │   └── tooltip.tsx
│       │   │   │
│       │   │   ├── canvas/
│       │   │   │   ├── excalidraw-wrapper.tsx   # Excalidraw embed + config
│       │   │   │   ├── custom-renderer.tsx      # Overlay for images/text
│       │   │   │   ├── grid-overlay.tsx         # Alignment guides
│       │   │   │   └── element-toolbar.tsx       # Per-element controls
│       │   │   │
│       │   │   ├── prompt/
│       │   │   │   ├── prompt-bar.tsx           # Main NL input
│       │   │   │   ├── prompt-suggestions.tsx   # Smart autocomplete
│       │   │   │   └── refinement-panel.tsx     # Post-gen edit input
│       │   │   │
│       │   │   ├── sidebar/
│       │   │   │   ├── style-panel.tsx          # Colors, fonts, spacing
│       │   │   │   ├── memory-panel.tsx         # Saved preferences
│       │   │   │   ├── examples-panel.tsx       # Reference images
│       │   │   │   ├── layers-panel.tsx         # Element z-ordering
│       │   │   │   └── history-panel.tsx        # Version history
│       │   │   │
│       │   │   ├── export/
│       │   │   │   └── export-dialog.tsx        # Export options
│       │   │   │
│       │   │   └── layout/
│       │   │       ├── header.tsx
│       │   │       ├── toolbar.tsx
│       │   │       └── status-bar.tsx
│       │   │
│       │   ├── lib/
│       │   │   ├── ai/
│       │   │   │   ├── schema-generator.ts      # Claude: NL → figure JSON
│       │   │   │   ├── text-generator.ts        # Claude: concise copy
│       │   │   │   ├── image-generator.ts       # DALL-E/FLUX: images
│       │   │   │   └── style-analyzer.ts        # Analyze uploaded examples
│       │   │   │
│       │   │   ├── excalidraw/
│       │   │   │   ├── element-builders.ts      # Typed element constructors
│       │   │   │   ├── layout-algorithms.ts     # Grid, flow, radial layouts
│       │   │   │   ├── style-presets.ts         # Color palettes, themes
│       │   │   │   └── export.ts                # Render to image
│       │   │   │
│       │   │   ├── memory/
│       │   │   │   ├── store.ts                 # DB operations
│       │   │   │   ├── preferences.ts           # User pref schema
│       │   │   │   └── example-library.ts       # Manage example images
│       │   │   │
│       │   │   └── utils/
│       │   │       ├── geometry.ts              # Alignment, spacing math
│       │   │       ├── colors.ts                # Color manipulation
│       │   │       └── validation.ts            # Input sanitization
│       │   │
│       │   ├── hooks/
│       │   │   ├── use-canvas.ts                # Canvas state + operations
│       │   │   ├── use-generation.ts            # AI generation workflow
│       │   │   ├── use-memory.ts                # Preferences read/write
│       │   │   └── use-history.ts               # Undo/redo + versioning
│       │   │
│       │   ├── stores/
│       │   │   ├── canvas-store.ts              # Current figure state
│       │   │   ├── generation-store.ts          # Generation pipeline state
│       │   │   └── ui-store.ts                  # Panels, modals, toasts
│       │   │
│       │   └── types/
│       │       ├── figure.ts                    # Figure schema types
│       │       ├── memory.ts                    # Preference types
│       │       └── api.ts                       # API request/response types
│       │
│       └── tests/
│           ├── e2e/
│           │   ├── generation.spec.ts           # Full generation flow
│           │   ├── editing.spec.ts              # Drag-drop, refinement
│           │   ├── export.spec.ts               # Export formats
│           │   └── memory.spec.ts               # Preference persistence
│           │
│           └── unit/
│               ├── schema-generator.test.ts
│               ├── layout-algorithms.test.ts
│               ├── geometry.test.ts
│               └── element-builders.test.ts
│
├── packages/
│   ├── schema-engine/                  # Shared: NL → structured schema
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── parser.ts              # Parse NL into intent + entities
│   │   │   ├── composer.ts            # Compose elements into figure
│   │   │   └── templates/             # Pre-built figure templates
│   │   │       ├── model-explainer.ts # "Explain VL-JEPA" style
│   │   │       ├── architecture.ts    # System architecture diagram
│   │   │       ├── comparison.ts      # Side-by-side comparison
│   │   │       └── pipeline.ts        # Data/ML pipeline
│   │   └── tests/
│   │
│   ├── layout-engine/                  # Shared: geometric layout solver
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── grid.ts               # Grid-based placement
│   │   │   ├── constraint-solver.ts   # Alignment constraints
│   │   │   ├── auto-layout.ts         # Smart auto-arrangement
│   │   │   └── spacing.ts            # Proportional spacing
│   │   └── tests/
│   │
│   └── ui-kit/                         # Shared UI primitives
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           └── tokens.ts              # Design tokens (colors, spacing, type)
│
├── docker/
│   ├── Dockerfile                      # Multi-stage production build
│   └── docker-compose.yml             # Local dev (app + postgres)
│
├── scripts/
│   ├── seed-examples.ts               # Load example figures into DB
│   ├── test-all.sh                    # Run full test suite
│   └── health-check.ts               # Verify deployment health
│
└── docs/
    ├── CONTRIBUTING.md                 # How to contribute
    ├── ARCHITECTURE.md                 # Deep-dive on system design
    └── API.md                          # API endpoint documentation
```

---

## Figure Schema (Core Data Model)

Every generated figure is represented as a `FigureSchema`:

```typescript
interface FigureSchema {
  id: string;
  version: number;
  meta: {
    title: string;
    subtitle?: string;
    takeaway?: string;
    createdAt: string;
    prompt: string;          // Original NL prompt
  };
  canvas: {
    width: number;           // Default: 1200 (LinkedIn optimal)
    height: number;          // Default: 1500
    background: string;      // Hex color
    padding: number;
  };
  elements: FigureElement[];
  layout: LayoutConfig;
  style: StyleConfig;
}

type FigureElement =
  | TextBlock          // Title, subtitle, labels, takeaway
  | DiagramGroup       // Excalidraw elements (shapes, arrows, connectors)
  | ImageSlot          // AI-generated or uploaded image
  | Divider            // Horizontal/vertical separators
  | Badge;             // Small accent elements

interface LayoutConfig {
  type: 'grid' | 'flow' | 'freeform';
  columns?: number;
  rows?: number;
  gap: number;
  alignment: 'center' | 'left' | 'right';
}

interface StyleConfig {
  palette: string[];         // Color palette
  fontFamily: string;
  headingSize: number;
  bodySize: number;
  borderRadius: number;
  shadow: boolean;
}
```

---

## Key User Flows

### 1. Generate from Prompt
```
User types: "Explain VL-JEPA architecture with encoder, predictor, and target blocks"
→ Schema Engine parses intent (model-explainer template)
→ Claude generates structured FigureSchema JSON
→ Layout Engine places elements on grid
→ Image Generator creates relevant diagrams
→ Canvas renders with Excalidraw + overlays
→ User sees complete figure, can drag/edit
```

### 2. Refine Existing Figure
```
User types: "Make the title bigger and move the encoder block to the left"
→ Refinement engine diffs current schema
→ Applies targeted mutations
→ Canvas re-renders
```

### 3. Upload Example → Learn Style
```
User uploads 5 example LinkedIn figures they like
→ Style Analyzer extracts: colors, fonts, spacing, layout patterns
→ Stores in Memory as "style preferences"
→ All future generations use this style by default
```

### 4. Promote Staging → Production
```
User visits /admin/staging
→ Sees diff of what changed since last deploy
→ Clicks "Approve & Deploy" button
→ GitHub Action triggers production deploy
→ Status badge shows deployment progress
```

---

## Environment Configuration

Required environment variables (never commit these):

```
# AI
ANTHROPIC_API_KEY=           # Claude API for schema generation
OPENAI_API_KEY=              # DALL-E for image generation
# OR
REPLICATE_API_TOKEN=         # FLUX for image generation

# Database
DATABASE_URL=                # PostgreSQL connection string

# Storage
R2_ACCOUNT_ID=               # Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Deployment
RAILWAY_TOKEN=               # Railway API for promotion
GITHUB_TOKEN=                # GitHub API for PR creation

# App
NEXT_PUBLIC_APP_URL=         # Public URL
STAGING_SECRET=              # Auth for staging promote action
```

---

## Development Commands

```bash
# Install
pnpm install

# Dev server
pnpm dev

# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build

# Seed example data
pnpm seed
```

---

## Git Workflow

1. **main** branch = production. Auto-deploys to production Railway service.
2. **staging** branch = staging. Auto-deploys to staging Railway service.
3. All work happens on feature branches off `staging`.
4. PRs target `staging`. CI must pass (lint + typecheck + tests).
5. Staging → production promotion happens via the web UI button or API call.
6. Every PR must have: description, test plan, screenshots (if UI change).

### Branch naming
- `feat/description` — new features
- `fix/description` — bug fixes
- `refactor/description` — code improvements
- `chore/description` — tooling, deps, config

---

## Code Quality Rules

- **TypeScript strict mode.** No `any`, no `as` casts without justification.
- **No unused imports or variables.** ESLint enforces this.
- **Components under 200 lines.** Split if larger.
- **One responsibility per file.** No god-files.
- **All API routes validate input** with Zod schemas.
- **All async operations have error boundaries** — no unhandled promise rejections.
- **No inline styles.** Tailwind only.
- **Test every user-facing flow** with Playwright.
- **Test every utility function** with Vitest.
- **Commit messages follow Conventional Commits** (feat:, fix:, refactor:, etc.).

---

## Testing Strategy

### Before Any Deploy
1. `pnpm typecheck` — zero errors
2. `pnpm lint` — zero warnings
3. `pnpm test` — all unit tests pass
4. `pnpm test:e2e` — all E2E tests pass
5. `pnpm build` — production build succeeds

### E2E Test Coverage (Minimum)
- [ ] Can generate a figure from a text prompt
- [ ] Can drag and reposition elements on canvas
- [ ] Can refine a figure with follow-up instructions
- [ ] Can export figure as PNG
- [ ] Can upload example image and see it saved to memory
- [ ] Can regenerate a figure (get a new version)
- [ ] Memory persists across page reloads
- [ ] Staging promote button works (mocked in test)

---

## Deployment Architecture

```
GitHub Repo
    │
    ├── PR merged to staging ──→ GitHub Action ──→ Railway (staging)
    │                                                 │
    │                                                 ├── staging.figcraft.app
    │                                                 │   └── /admin/staging
    │                                                 │       └── [Approve ✓] button
    │                                                 │
    └── Promote API called ────→ GitHub Action ──→ Railway (production)
                                                      │
                                                      └── figcraft.app
```

Both staging and production use the same Docker image, differentiated by env vars.

---

## Performance Targets

- **First Contentful Paint:** < 1.5s
- **Figure generation:** < 8s for simple, < 15s for complex
- **Canvas interaction:** 60fps drag/drop
- **Export to PNG:** < 3s
- **Memory operations:** < 200ms

---

## What "Good" Looks Like

A generated figure for "Explain the VL-JEPA model" should have:
- Clean title bar at top with model name
- Subtitle explaining what the model does in one line
- 2-3 clearly labeled architectural blocks (encoder, predictor, target)
- Arrows showing data flow between blocks
- A small AI-generated illustration showing the concept visually
- Color-coded sections with consistent palette
- A "Key Takeaway" box at the bottom
- All elements geometrically aligned, nothing looks "off"
- Professional enough that a VP of Engineering would repost it
