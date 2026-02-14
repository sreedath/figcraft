# Skill: Design System

## Purpose
Define the visual language that makes every figure look like it was designed by a professional. Consistency is everything.

## Design Tokens

### Colors
```typescript
const tokens = {
  // Backgrounds
  bg: {
    canvas: '#fafafa',      // Light mode canvas
    canvasDark: '#0f172a',  // Dark mode canvas
    card: '#ffffff',
    cardDark: '#1e293b',
    overlay: 'rgba(0,0,0,0.5)',
  },

  // Text
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#94a3b8',
    inverse: '#ffffff',
  },

  // Accent (customizable per user preference)
  accent: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
  },

  // Spacing scale (4px base)
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Typography
  font: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
};
```

## Figure Design Rules

### Typography Inside Figures
1. **Title:** 28-36px, bold, primary color. One line max.
2. **Subtitle:** 16-20px, regular weight, secondary color. Two lines max.
3. **Block labels:** 14-16px, medium weight, centered in block.
4. **Arrow labels:** 12-14px, regular weight, slightly muted.
5. **Takeaway:** 16-18px, italic or boxed, accent color.
6. **No font below 12px.** Must be readable in LinkedIn feed.

### Color Usage
1. **Maximum 5 colors per figure** (excluding black/white/gray).
2. **One accent color dominates** (60% usage), others are supporting (30% + 10%).
3. **Background is always neutral** — white, off-white, or dark navy.
4. **Blocks of the same "type" share a color.** Don't randomly assign colors.
5. **Arrows are always gray or very muted** — they connect, they don't attract attention.

### Layout Principles
1. **Visual hierarchy:** Title → Diagram → Takeaway (top to bottom).
2. **Breathing room:** Minimum 5% padding on all sides of the canvas.
3. **Alignment:** Every element aligns to at least one other element (left edge, center, or right edge).
4. **Grouping:** Related elements are enclosed in a subtle container (light background, rounded corners).
5. **Balance:** The figure should feel visually balanced — not heavy on one side.

### What Makes a Figure "LinkedIn-Quality"
- Clean, uncluttered — if removing an element doesn't lose meaning, remove it.
- Professional palette — no neon, no clashing colors.
- Clear reading flow — eyes move naturally from top to bottom, left to right.
- One clear takeaway — the viewer remembers one thing.
- Consistent styling — all blocks look like they belong together.
- Appropriate density — not too sparse (looks lazy), not too crowded (overwhelming).

### Anti-Patterns (What We Must Avoid)
- Rainbow color schemes
- Tiny unreadable text
- Too many arrow crossings
- Generic flowchart shapes with no visual personality
- Misaligned elements (off by a few pixels)
- Inconsistent border widths or corner radii
- AI-generated text that sounds corporate or generic
- Stock photo aesthetics in generated images

## UI Design (The App Itself)

### Visual Style
- **Minimal chrome.** The app UI should be nearly invisible.
- **Neutral palette for UI.** Gray/white tones. The figure is the color.
- **Subtle borders.** 1px, `#e2e8f0` in light mode.
- **No gradients in UI.** Flat, clean surfaces.
- **Generous whitespace.** Let the canvas breathe.

### Interaction Design
- Hover states: subtle background change (not color shift).
- Active states: slight scale (0.98) + shadow.
- Transitions: 150ms ease-out for all state changes.
- Loading: skeleton shimmer, progressive reveal.
- Success: brief green flash, not a full modal.

### Dark Mode
- Not inverted light mode. Carefully chosen dark surfaces.
- Canvas background: `#0f172a` (slate-900).
- Card surfaces: `#1e293b` (slate-800).
- Borders: `#334155` (slate-700).
- Text: `#e2e8f0` (slate-200) primary, `#94a3b8` (slate-400) secondary.
