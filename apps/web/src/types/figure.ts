export interface FigureSchema {
  id: string;
  version: number;
  meta: {
    title: string;
    subtitle?: string;
    takeaway?: string;
    createdAt: string;
    prompt: string;
  };
  canvas: {
    width: number;
    height: number;
    background: string;
    padding: number;
  };
  elements: FigureElement[];
  style: StyleConfig;
}

export type FigureElement =
  | TextBlockElement
  | DiagramBlockElement
  | ArrowElement
  | ContainerElement
  | ImageSlotElement
  | DividerElement;

export interface TextBlockElement {
  type: "text";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: "sans" | "mono";
  fontWeight: "normal" | "bold";
  color: string;
  align: "left" | "center" | "right";
  role: "title" | "subtitle" | "label" | "body" | "takeaway";
}

export interface DiagramBlockElement {
  type: "block";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  fontSize: number;
  fontColor: string;
  shape: "rectangle" | "rounded" | "ellipse" | "diamond";
}

export interface ArrowElement {
  type: "arrow";
  id: string;
  fromId: string;
  toId: string;
  fromSide: "top" | "right" | "bottom" | "left";
  toSide: "top" | "right" | "bottom" | "left";
  label?: string;
  color: string;
  strokeWidth: number;
  style: "solid" | "dashed";
}

export interface ContainerElement {
  type: "container";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: number;
  childIds: string[];
}

export interface ImageSlotElement {
  type: "image";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt: string;
  imageUrl?: string;
}

export interface DividerElement {
  type: "divider";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  thickness: number;
}

export interface StyleConfig {
  palette: string[];
  fontFamily: string;
  headingSize: number;
  bodySize: number;
  borderRadius: number;
  shadow: boolean;
}
