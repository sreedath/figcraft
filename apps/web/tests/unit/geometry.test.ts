import { describe, it, expect } from "vitest";
import {
  getCenter,
  getSideCenter,
  snapToGrid,
  rectsOverlap,
  distributeHorizontally,
  centerInRect,
} from "@/lib/utils/geometry";

describe("getCenter", () => {
  it("returns the center of a rectangle", () => {
    const center = getCenter({ x: 100, y: 200, width: 300, height: 400 });
    expect(center).toEqual({ x: 250, y: 400 });
  });

  it("handles zero-size rectangles", () => {
    const center = getCenter({ x: 50, y: 50, width: 0, height: 0 });
    expect(center).toEqual({ x: 50, y: 50 });
  });
});

describe("getSideCenter", () => {
  const rect = { x: 100, y: 100, width: 200, height: 100 };

  it("returns top center", () => {
    expect(getSideCenter(rect, "top")).toEqual({ x: 200, y: 100 });
  });

  it("returns right center", () => {
    expect(getSideCenter(rect, "right")).toEqual({ x: 300, y: 150 });
  });

  it("returns bottom center", () => {
    expect(getSideCenter(rect, "bottom")).toEqual({ x: 200, y: 200 });
  });

  it("returns left center", () => {
    expect(getSideCenter(rect, "left")).toEqual({ x: 100, y: 150 });
  });
});

describe("snapToGrid", () => {
  it("snaps to nearest grid point", () => {
    expect(snapToGrid(23, 20)).toBe(20);
    expect(snapToGrid(37, 20)).toBe(40);
    expect(snapToGrid(40, 20)).toBe(40);
  });

  it("uses default grid size of 20", () => {
    expect(snapToGrid(15)).toBe(20);
    expect(snapToGrid(9)).toBe(0);
  });
});

describe("rectsOverlap", () => {
  it("detects overlapping rectangles", () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 50, y: 50, width: 100, height: 100 };
    expect(rectsOverlap(a, b)).toBe(true);
  });

  it("detects non-overlapping rectangles", () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 200, y: 200, width: 100, height: 100 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it("detects overlap with margin", () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 110, y: 0, width: 100, height: 100 };
    expect(rectsOverlap(a, b, 0)).toBe(false);
    expect(rectsOverlap(a, b, 20)).toBe(true);
  });
});

describe("distributeHorizontally", () => {
  it("distributes 3 rects evenly", () => {
    const rects = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 0, y: 0, width: 50, height: 50 },
    ];
    const result = distributeHorizontally(rects, 300, 20, 0);
    expect(result).toHaveLength(3);
    // All should have equal width
    const widths = result.map((r) => r.width);
    expect(new Set(widths).size).toBe(1);
  });

  it("handles empty array", () => {
    expect(distributeHorizontally([], 300, 20, 0)).toEqual([]);
  });
});

describe("centerInRect", () => {
  it("centers a smaller rect in a larger rect", () => {
    const inner = { x: 0, y: 0, width: 50, height: 50 };
    const outer = { x: 100, y: 100, width: 200, height: 200 };
    const result = centerInRect(inner, outer);
    expect(result.x).toBe(175);
    expect(result.y).toBe(175);
  });
});
