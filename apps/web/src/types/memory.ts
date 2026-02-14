export interface StylePreference {
  id: string;
  category: "color" | "typography" | "layout" | "spacing" | "style";
  key: string;
  value: string | number;
  source: "explicit" | "inferred";
  updatedAt: string;
}

export interface ExampleImage {
  id: string;
  dataUrl: string;
  filename: string;
  analysis?: ImageAnalysis;
  tags: string[];
  createdAt: string;
}

export interface ImageAnalysis {
  colors: string[];
  layout: string;
  density: "sparse" | "moderate" | "dense";
  style: "clean" | "sketch" | "technical" | "bold";
  elements: string[];
}

export interface GenerationRecord {
  id: string;
  prompt: string;
  schema: import("./figure").FigureSchema;
  parentId?: string;
  editPrompt?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export interface UserMemory {
  preferences: StylePreference[];
  examples: ExampleImage[];
  history: GenerationRecord[];
  apiKey?: string;
}
