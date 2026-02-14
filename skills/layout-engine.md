# Skill: Layout Engine

## Purpose
Position elements on the canvas with geometric precision. No misalignment, no overlaps, no wasted space. Every element is placed intentionally.

## Layout Algorithms

### 1. Grid Layout
Default layout. Elements are placed on a defined grid.

```typescript
interface GridLayout {
  type: 'grid';
  columns: number;        // 1-4
  rows: number;           // auto-calculated
  gap: number;            // px between cells
  cellPadding: number;    // px inside each cell
  alignment: 'start' | 'center' | 'stretch';
}
```

**Algorithm:**
1. Calculate available canvas area (total - padding - header - footer).
2. Divide into grid cells based on columns.
3. Assign elements to cells in reading order (left-to-right, top-to-bottom).
4. Size each element to fit its cell with padding.
5. Center content within each cell.

### 2. Flow Layout
For sequential processes (pipelines, timelines).

```typescript
interface FlowLayout {
  type: 'flow';
  direction: 'horizontal' | 'vertical';
  gap: number;
  connectionStyle: 'arrow' | 'line' | 'dashed';
}
```

**Algorithm:**
1. Place elements sequentially along the flow direction.
2. Size all elements to equal width (vertical) or height (horizontal).
3. Add connectors (arrows/lines) between consecutive elements.
4. Center the entire flow on the canvas.

### 3. Hierarchical Layout
For tree structures, org charts.

```typescript
interface HierarchicalLayout {
  type: 'hierarchy';
  direction: 'top-down' | 'left-right';
  levelGap: number;       // Vertical gap between levels
  siblingGap: number;     // Horizontal gap between siblings
}
```

**Algorithm:**
1. Calculate tree depth and max width at each level.
2. Position root at top center.
3. Distribute children evenly below parent.
4. Draw connectors from parent bottom to child top.
5. Adjust widths to prevent overlap at any level.

### 4. Freeform with Constraints
For complex diagrams that don't fit standard layouts.

```typescript
interface FreeformLayout {
  type: 'freeform';
  constraints: Constraint[];
}

type Constraint =
  | { type: 'align'; elements: string[]; axis: 'x' | 'y' }
  | { type: 'distribute'; elements: string[]; axis: 'x' | 'y'; gap: number }
  | { type: 'contain'; parent: string; children: string[]; padding: number }
  | { type: 'connect'; from: string; to: string; style: string };
```

## Constraint Solver

The constraint solver ensures geometric consistency:

1. **Parse constraints** from the FigureSchema.
2. **Build constraint graph** (element relationships).
3. **Solve iteratively:**
   - Pass 1: Resolve size constraints (min/max width/height).
   - Pass 2: Resolve position constraints (alignment, distribution).
   - Pass 3: Resolve containment (parents must enclose children).
   - Pass 4: Route arrows (avoid element overlaps).
4. **Validate** no overlaps remain.

## Spacing Rules

| Between | Minimum | Recommended |
|---------|---------|-------------|
| Title → content | 40px | 60px |
| Blocks in same group | 20px | 30px |
| Groups | 40px | 60px |
| Content → takeaway | 40px | 60px |
| Canvas edge → content | 60px | 80px |
| Arrow → nearest element | 10px | 15px |

## Arrow Routing

Arrows between elements use orthogonal routing:

1. Determine start point (center of source element's specified side).
2. Determine end point (center of target element's specified side).
3. Route with at most 2 bends (L-shape or Z-shape).
4. Check for element intersections along the route.
5. If intersection found, add a bend to route around it.
6. Maintain minimum 10px clearance from any element.

## Responsive Scaling

When the user changes canvas dimensions:
1. Calculate scale factor: `newWidth / originalWidth`.
2. Scale all positions and sizes by this factor.
3. Clamp minimum font size to 12px.
4. Clamp minimum element size to 40x40px.
5. Adjust gap proportionally but never below minimums.

## Auto-Layout Heuristics

When the AI doesn't specify exact positions (freeform mode):
1. Identify clusters of related elements (by connections).
2. Place clusters in a grid arrangement.
3. Within each cluster, use flow layout.
4. Route inter-cluster arrows.
5. Center the entire composition on the canvas.
