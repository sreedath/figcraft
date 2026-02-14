# Skill: Memory System

## Purpose
Remember everything the user teaches the tool. Style preferences, uploaded examples, favorite palettes, layout patterns — all persisted and applied to every future generation.

## What Gets Stored

### 1. Style Preferences
User's visual preferences extracted from uploaded examples or explicit settings.

```typescript
interface StylePreference {
  id: string;
  userId: string;
  category: 'color' | 'typography' | 'layout' | 'spacing' | 'style';
  key: string;              // e.g., 'primaryColor', 'fontFamily'
  value: string | number;   // e.g., '#3b82f6', 'Inter'
  source: 'explicit' | 'inferred';  // User set it vs. extracted from example
  confidence: number;       // 0-1, how confident we are in inferred prefs
  createdAt: string;
  updatedAt: string;
}
```

### 2. Example Images
Reference images uploaded by the user that represent "good" figures.

```typescript
interface ExampleImage {
  id: string;
  userId: string;
  url: string;              // R2/S3 URL
  thumbnailUrl: string;
  filename: string;
  analysis: {               // AI-extracted style analysis
    colors: string[];
    layout: string;         // 'grid', 'flow', 'hierarchy', etc.
    density: 'sparse' | 'moderate' | 'dense';
    style: 'clean' | 'sketch' | 'technical' | 'bold';
    fonts: string[];        // Detected font styles
    elements: string[];     // Detected element types
  };
  tags: string[];           // User-applied tags
  createdAt: string;
}
```

### 3. Generation History
Every figure generated, with its prompt and schema.

```typescript
interface GenerationRecord {
  id: string;
  userId: string;
  prompt: string;
  schema: FigureSchema;
  versions: {              // Version history for refinements
    version: number;
    schema: FigureSchema;
    editPrompt?: string;
    createdAt: string;
  }[];
  exportedAs?: string[];   // URLs of exported images
  rating?: 1 | 2 | 3 | 4 | 5;  // User rating
  createdAt: string;
}
```

## Database Schema (PostgreSQL)

```sql
CREATE TABLE style_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'explicit',
  confidence FLOAT NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, key)
);

CREATE TABLE example_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  filename TEXT NOT NULL,
  analysis JSONB,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  schema JSONB NOT NULL,
  version INT NOT NULL DEFAULT 1,
  parent_id UUID REFERENCES generation_history(id),
  edit_prompt TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prefs_user ON style_preferences(user_id);
CREATE INDEX idx_examples_user ON example_images(user_id);
CREATE INDEX idx_history_user ON generation_history(user_id);
```

## Style Learning Pipeline

When a user uploads an example image:

1. **Store** the image in R2/S3.
2. **Analyze** with Claude Vision:
   - Extract dominant colors (top 5).
   - Identify layout pattern (grid, flow, hierarchy, etc.).
   - Detect font styles (serif, sans-serif, mono).
   - Measure density (element count / canvas area).
   - Classify overall style (clean, sketch, technical, bold).
3. **Merge** extracted preferences with existing preferences:
   - If multiple examples agree on a preference → high confidence.
   - If examples conflict → keep the most recent, lower confidence.
4. **Store** analysis results in `example_images` table.
5. **Update** `style_preferences` with inferred values.

### Claude Vision Prompt for Analysis
```
Analyze this LinkedIn figure/infographic image. Extract:

1. COLOR PALETTE: List the top 5 most prominent colors as hex codes.
2. LAYOUT: Is it grid-based, flow/sequential, hierarchical, or freeform?
3. DENSITY: Sparse (few elements, lots of whitespace), moderate, or dense?
4. STYLE: Clean/minimal, hand-drawn/sketch, technical/precise, or bold/impactful?
5. TYPOGRAPHY: What font styles are used? (serif, sans-serif, monospace, size range)
6. ELEMENTS: What types of visual elements are present? (boxes, arrows, images, icons, text blocks)
7. QUALITY SCORE: Rate 1-10 how professional and visually appealing this figure is.

Return as JSON.
```

## Preference Application

When generating a new figure, the schema engine:
1. Loads all user preferences from the database.
2. Builds a `StyleConfig` from preferences.
3. Passes the `StyleConfig` to Claude as part of the generation prompt.
4. Claude generates a schema that respects these preferences.
5. Layout engine uses spacing/gap preferences.
6. Element builders use color/font preferences.

### Priority Order
1. **Explicit prompt instructions** (user said "use red") — highest priority
2. **Explicit preferences** (user set in settings panel)
3. **Inferred preferences** (extracted from examples, high confidence)
4. **Inferred preferences** (low confidence)
5. **System defaults** — lowest priority

## Memory Panel UI
- Shows current active preferences as editable cards.
- Shows uploaded examples as a thumbnail gallery.
- "Reset to defaults" button.
- "Export preferences" as JSON.
- "Import preferences" from JSON.
- Per-preference toggle: on/off (temporarily disable without deleting).

## Data Persistence
- Memory is NEVER erased unless the user explicitly requests it.
- Database backups run daily (Railway managed).
- Export functionality lets users download their preferences.
- Preferences survive server restarts, redeploys, and code updates.
