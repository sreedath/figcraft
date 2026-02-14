export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function getSideCenter(
  rect: Rect,
  side: "top" | "right" | "bottom" | "left"
): Point {
  const center = getCenter(rect);
  switch (side) {
    case "top":
      return { x: center.x, y: rect.y };
    case "right":
      return { x: rect.x + rect.width, y: center.y };
    case "bottom":
      return { x: center.x, y: rect.y + rect.height };
    case "left":
      return { x: rect.x, y: center.y };
  }
}

export function snapToGrid(value: number, gridSize: number = 20): number {
  return Math.round(value / gridSize) * gridSize;
}

export function rectsOverlap(a: Rect, b: Rect, margin: number = 0): boolean {
  return !(
    a.x + a.width + margin <= b.x ||
    b.x + b.width + margin <= a.x ||
    a.y + a.height + margin <= b.y ||
    b.y + b.height + margin <= a.y
  );
}

export function distributeHorizontally(
  rects: Rect[],
  totalWidth: number,
  gap: number,
  startX: number
): Rect[] {
  const count = rects.length;
  if (count === 0) return [];

  const totalGaps = (count - 1) * gap;
  const availableWidth = totalWidth - totalGaps;
  const itemWidth = availableWidth / count;

  return rects.map((rect, i) => ({
    ...rect,
    x: startX + i * (itemWidth + gap),
    width: itemWidth,
  }));
}

export function distributeVertically(
  rects: Rect[],
  totalHeight: number,
  gap: number,
  startY: number
): Rect[] {
  const count = rects.length;
  if (count === 0) return [];

  const totalGaps = (count - 1) * gap;
  const availableHeight = totalHeight - totalGaps;
  const itemHeight = availableHeight / count;

  return rects.map((rect, i) => ({
    ...rect,
    y: startY + i * (itemHeight + gap),
    height: itemHeight,
  }));
}

export function centerInRect(inner: Rect, outer: Rect): Rect {
  return {
    ...inner,
    x: outer.x + (outer.width - inner.width) / 2,
    y: outer.y + (outer.height - inner.height) / 2,
  };
}
