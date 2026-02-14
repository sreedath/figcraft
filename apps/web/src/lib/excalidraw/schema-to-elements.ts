import type { FigureSchema, FigureElement } from "@/types/figure";
import { getSideCenter } from "@/lib/utils/geometry";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

type MutableElement = Record<string, unknown>;

function makeBaseElement(overrides: MutableElement): MutableElement {
  return {
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    ...overrides,
  };
}

function convertTextBlock(el: FigureElement & { type: "text" }): MutableElement[] {
  const fontSizeMap: Record<string, number> = {
    title: 36,
    subtitle: 22,
    label: 16,
    body: 16,
    takeaway: 20,
  };

  const fontSize = el.fontSize || fontSizeMap[el.role] || 16;

  return [
    makeBaseElement({
      type: "text",
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height || fontSize * 1.5,
      text: el.text,
      fontSize,
      fontFamily: el.fontFamily === "mono" ? 3 : 1,
      textAlign: el.align || "center",
      verticalAlign: "top",
      strokeColor: el.color || "#1e1e1e",
      originalText: el.text,
      autoResize: true,
      lineHeight: 1.35,
    }),
  ];
}

function convertBlock(
  el: FigureElement & { type: "block" }
): MutableElement[] {
  const elements: MutableElement[] = [];
  const shapeType =
    el.shape === "ellipse"
      ? "ellipse"
      : el.shape === "diamond"
        ? "diamond"
        : "rectangle";

  const roundness =
    el.shape === "rounded" || el.shape === "rectangle"
      ? { type: 3, value: el.borderRadius || 12 }
      : null;

  const rectId = `${el.id}_rect`;
  const textId = `${el.id}_text`;

  elements.push(
    makeBaseElement({
      type: shapeType,
      id: rectId,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      strokeColor: el.borderColor || "#1e1e1e",
      backgroundColor: el.backgroundColor || "transparent",
      strokeWidth: el.borderWidth || 2,
      fillStyle: "solid",
      roundness,
      boundElements: [{ id: textId, type: "text" }],
    })
  );

  elements.push(
    makeBaseElement({
      type: "text",
      id: textId,
      x: el.x + 10,
      y: el.y + el.height / 2 - (el.fontSize || 16) / 2,
      width: el.width - 20,
      height: el.fontSize || 16,
      text: el.label,
      fontSize: el.fontSize || 16,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      strokeColor: el.fontColor || "#1e1e1e",
      originalText: el.label,
      autoResize: true,
      lineHeight: 1.35,
      containerId: rectId,
    })
  );

  return elements;
}

function convertArrow(
  el: FigureElement & { type: "arrow" },
  allElements: FigureElement[]
): MutableElement[] {
  const elements: MutableElement[] = [];

  const fromEl = allElements.find(
    (e) => e.id === el.fromId || `${e.id}_rect` === el.fromId
  );
  const toEl = allElements.find(
    (e) => e.id === el.toId || `${e.id}_rect` === el.toId
  );

  if (!fromEl || !toEl) return elements;

  const fromRect = {
    x: "x" in fromEl ? fromEl.x : 0,
    y: "y" in fromEl ? fromEl.y : 0,
    width: "width" in fromEl ? fromEl.width : 0,
    height: "height" in fromEl ? fromEl.height : 0,
  };
  const toRect = {
    x: "x" in toEl ? toEl.x : 0,
    y: "y" in toEl ? toEl.y : 0,
    width: "width" in toEl ? toEl.width : 0,
    height: "height" in toEl ? toEl.height : 0,
  };

  const start = getSideCenter(fromRect, el.fromSide);
  const end = getSideCenter(toRect, el.toSide);

  const fromBindingId =
    fromEl.type === "block" ? `${fromEl.id}_rect` : fromEl.id;
  const toBindingId = toEl.type === "block" ? `${toEl.id}_rect` : toEl.id;

  const arrowId = el.id;

  elements.push(
    makeBaseElement({
      type: "arrow",
      id: arrowId,
      x: start.x,
      y: start.y,
      width: end.x - start.x,
      height: end.y - start.y,
      points: [
        [0, 0],
        [end.x - start.x, end.y - start.y],
      ],
      strokeColor: el.color || "#94a3b8",
      strokeWidth: el.strokeWidth || 2,
      strokeStyle: el.style === "dashed" ? "dashed" : "solid",
      startArrowhead: null,
      endArrowhead: "arrow",
      startBinding: {
        elementId: fromBindingId,
        focus: 0,
        gap: 5,
      },
      endBinding: {
        elementId: toBindingId,
        focus: 0,
        gap: 5,
      },
    })
  );

  if (el.label) {
    const midX = start.x + (end.x - start.x) / 2;
    const midY = start.y + (end.y - start.y) / 2;

    elements.push(
      makeBaseElement({
        type: "text",
        id: `${el.id}_label`,
        x: midX - 40,
        y: midY - 10,
        width: 80,
        height: 16,
        text: el.label,
        fontSize: 13,
        fontFamily: 1,
        textAlign: "center",
        verticalAlign: "top",
        strokeColor: el.color || "#64748b",
        originalText: el.label,
        autoResize: true,
        lineHeight: 1.35,
      })
    );
  }

  return elements;
}

function convertContainer(
  el: FigureElement & { type: "container" }
): MutableElement[] {
  const elements: MutableElement[] = [];

  elements.push(
    makeBaseElement({
      type: "rectangle",
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      strokeColor: el.borderColor || "#e2e8f0",
      backgroundColor: el.backgroundColor || "#f8fafc",
      fillStyle: "solid",
      strokeWidth: 1,
      roundness: { type: 3, value: el.borderRadius || 12 },
      strokeStyle: "solid",
    })
  );

  if (el.label) {
    elements.push(
      makeBaseElement({
        type: "text",
        id: `${el.id}_label`,
        x: el.x + 12,
        y: el.y + 8,
        width: el.width - 24,
        height: 16,
        text: el.label,
        fontSize: 13,
        fontFamily: 1,
        textAlign: "left",
        verticalAlign: "top",
        strokeColor: "#94a3b8",
        originalText: el.label,
        autoResize: true,
        lineHeight: 1.35,
      })
    );
  }

  return elements;
}

function convertDivider(
  el: FigureElement & { type: "divider" }
): MutableElement[] {
  return [
    makeBaseElement({
      type: "line",
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: 0,
      points: [
        [0, 0],
        [el.width, 0],
      ],
      strokeColor: el.color || "#e2e8f0",
      strokeWidth: el.thickness || 1,
    }),
  ];
}

function convertImageSlot(
  el: FigureElement & { type: "image" }
): MutableElement[] {
  // Render as a dashed rectangle placeholder on canvas
  return [
    makeBaseElement({
      type: "rectangle",
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      strokeColor: "#94a3b8",
      backgroundColor: "#f1f5f9",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "dashed",
      roundness: { type: 3, value: 8 },
    }),
    makeBaseElement({
      type: "text",
      id: `${el.id}_placeholder`,
      x: el.x + 10,
      y: el.y + el.height / 2 - 10,
      width: el.width - 20,
      height: 20,
      text: "🖼 Image",
      fontSize: 14,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "top",
      strokeColor: "#94a3b8",
      originalText: "🖼 Image",
      autoResize: true,
      lineHeight: 1.35,
    }),
  ];
}

export function schemaToExcalidrawElements(
  schema: FigureSchema
): ExcalidrawElement[] {
  const excalidrawElements: MutableElement[] = [];

  // Containers first (background), then blocks, text, arrows on top
  const containers = schema.elements.filter((e) => e.type === "container");
  const blocks = schema.elements.filter((e) => e.type === "block");
  const texts = schema.elements.filter((e) => e.type === "text");
  const arrows = schema.elements.filter((e) => e.type === "arrow");
  const dividers = schema.elements.filter((e) => e.type === "divider");
  const images = schema.elements.filter((e) => e.type === "image");

  for (const el of containers) {
    excalidrawElements.push(...convertContainer(el as FigureElement & { type: "container" }));
  }
  for (const el of images) {
    excalidrawElements.push(...convertImageSlot(el as FigureElement & { type: "image" }));
  }
  for (const el of dividers) {
    excalidrawElements.push(...convertDivider(el as FigureElement & { type: "divider" }));
  }
  for (const el of blocks) {
    excalidrawElements.push(...convertBlock(el as FigureElement & { type: "block" }));
  }
  for (const el of texts) {
    excalidrawElements.push(...convertTextBlock(el as FigureElement & { type: "text" }));
  }
  for (const el of arrows) {
    excalidrawElements.push(
      ...convertArrow(el as FigureElement & { type: "arrow" }, schema.elements)
    );
  }

  return excalidrawElements as unknown as ExcalidrawElement[];
}
