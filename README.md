# FigCraft

Turn plain English into publication-quality LinkedIn figures.

FigCraft generates professional schematic diagrams, architecture visualizations, and technical illustrations from natural language descriptions. Powered by OpenAI GPT-4o for schema generation and DALL-E 3 for image generation, rendered on an Excalidraw canvas with full drag-and-drop editing.

## Features

- **Natural Language → Figure**: Describe what you want, get a professional figure
- **Excalidraw Canvas**: Full drag-and-drop editing of generated figures
- **Refinement**: Tell the tool what to change, it updates the figure
- **Regeneration**: Not happy? Get a new variation with one click
- **Style Memory**: Upload example figures you like — the tool learns your style
- **Export**: PNG (LinkedIn-ready), SVG, or JSON
- **Persistent Preferences**: Your style preferences survive across sessions
- **BYO API Key**: Bring your own OpenAI API key — stored locally, never on our servers

## Quick Start

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste your OpenAI API key.

## Requirements

- Node.js 22+
- OpenAI API key (for GPT-4o and DALL-E 3)

## Custom Commands (Claude Code)

| Command | Description |
|---------|-------------|
| `/prd` | Brainstorm sprint requirements, break into atomic tasks |
| `/dev` | Pick highest priority task, implement with TDD + browser screenshots |
| `/walkthrough` | Generate sprint review report documenting all code changes |
| `/codex` | Code review, test validation, and architectural feedback |

## Architecture

Built with Next.js 16, TypeScript (strict), Tailwind CSS, Excalidraw, and Zustand.

See [CLAUDE.md](./CLAUDE.md) for full architecture documentation.

## License

MIT
