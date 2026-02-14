# Skill: Schema Engine (NL → Figure Schema)

## Purpose
Convert plain English descriptions into structured FigureSchema JSON that the canvas can render. This is the brain of the tool.

## How It Works

```
User input (plain English)
  → Intent classification (what kind of figure?)
  → Entity extraction (what concepts/elements?)
  → Template selection (which layout template?)
  → Element composition (build the element tree)
  → Style application (apply user preferences from memory)
  → FigureSchema output
```

## Intent Classification

The engine recognizes these figure types:

| Intent | Description | Example Prompt |
|--------|-------------|----------------|
| `model-explainer` | Explain an ML model architecture | "Explain VL-JEPA" |
| `architecture` | System/software architecture | "Show microservice architecture for e-commerce" |
| `comparison` | Side-by-side comparison | "Compare transformers vs RNNs" |
| `pipeline` | Sequential process/pipeline | "Show the RAG pipeline" |
| `concept-map` | Related concepts with connections | "Map out attention mechanisms" |
| `timeline` | Chronological progression | "Evolution of language models" |
| `hierarchy` | Tree/org-chart structure | "Taxonomy of neural networks" |
| `custom` | Freeform, no template | "Create a figure about X" |

## Claude API Integration

### System Prompt for Schema Generation
```
You are a technical figure designer for LinkedIn posts. Given a description,
generate a FigureSchema JSON that creates a professional, visually striking
schematic diagram.

Rules:
1. Maximum 8 top-level elements. Simplicity is key.
2. Every text must be concise — max 10 words for labels, max 20 for descriptions.
3. Use the provided color palette consistently.
4. Assign clear visual hierarchy: title > diagram > takeaway.
5. Include a title, the main schematic, and a takeaway.
6. Text must sound human-written, not AI-generated. No buzzwords.
7. Arrow labels should be verbs or short phrases (e.g., "encodes", "predicts").
8. Group related elements with containers.
```

### Structured Output
Use Claude's tool_use / structured output to ensure valid JSON:

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  system: SCHEMA_SYSTEM_PROMPT,
  messages: [{ role: 'user', content: userPrompt }],
  tools: [{
    name: 'generate_figure',
    description: 'Generate a FigureSchema for the LinkedIn figure',
    input_schema: figureSchemaJsonSchema,
  }],
  tool_choice: { type: 'tool', name: 'generate_figure' },
});
```

## Templates

### Model Explainer Template
```
┌─────────────────────────────────┐
│  TITLE (model name)             │
│  Subtitle (one-line summary)    │
├─────────────────────────────────┤
│                                 │
│   ┌─────┐    ┌─────┐    ┌───┐  │
│   │Block│───→│Block│───→│Out│  │
│   │  1  │    │  2  │    │put│  │
│   └─────┘    └─────┘    └───┘  │
│       ↑                         │
│   ┌─────┐                       │
│   │Input│     [Image]           │
│   └─────┘                       │
│                                 │
├─────────────────────────────────┤
│  💡 Key Takeaway               │
│  One sentence summary           │
└─────────────────────────────────┘
```

### Architecture Template
```
┌─────────────────────────────────┐
│  TITLE                          │
├─────────────────────────────────┤
│  ┌──────────────────────────┐   │
│  │       Top Layer          │   │
│  └──────────────────────────┘   │
│         ↕         ↕             │
│  ┌──────────┐ ┌──────────┐     │
│  │ Service A│ │ Service B│     │
│  └──────────┘ └──────────┘     │
│         ↕         ↕             │
│  ┌──────────────────────────┐   │
│  │     Bottom Layer         │   │
│  └──────────────────────────┘   │
├─────────────────────────────────┤
│  Key Takeaway                   │
└─────────────────────────────────┘
```

## Refinement Mode

When the user provides edit instructions on an existing figure:

1. Receive current FigureSchema + edit instruction.
2. Claude identifies which elements to modify.
3. Generate a JSON patch (RFC 6902) to apply.
4. Apply patch to current schema.
5. Re-render.

This avoids regenerating the entire figure for small edits.

## Quality Validation

Before returning a schema:
1. Validate against Zod schema (structural correctness).
2. Check element count (≤ 20 elements).
3. Check text lengths (no element text > 50 chars).
4. Check for overlapping positions.
5. Check color count (≤ 5 unique colors).
6. Verify all required sections exist (title, diagram, takeaway).
