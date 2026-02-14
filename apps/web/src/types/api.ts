import type { FigureSchema } from "./figure";

export interface GenerateRequest {
  prompt: string;
  apiKey: string;
  style?: {
    palette?: string[];
    layout?: string;
    density?: string;
  };
  canvasSize?: {
    width: number;
    height: number;
  };
}

export interface GenerateResponse {
  schema?: FigureSchema;
  error?: string;
}

export interface RefineRequest {
  currentSchema: FigureSchema;
  instruction: string;
  apiKey: string;
}

export interface RefineResponse {
  schema?: FigureSchema;
  error?: string;
}

export interface ImageGenerateRequest {
  prompt: string;
  apiKey: string;
  size?: "1024x1024" | "1024x1792" | "1792x1024";
}

export interface ImageGenerateResponse {
  url: string;
  error?: string;
}
