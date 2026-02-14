import type { FigureSchema } from "@/types/figure";
import type { StylePreference } from "@/types/memory";

const SYSTEM_PROMPT = `You are a technical figure designer for LinkedIn posts. Given a description, you generate a structured JSON schema that creates a professional, visually striking schematic diagram.

You output ONLY valid JSON matching the FigureSchema format. No markdown, no code fences, no explanation.

Design Rules:
1. Maximum 12 top-level elements. Simplicity is key.
2. Every text must be concise — max 10 words for labels, max 25 words for descriptions.
3. Use the provided color palette consistently.
4. Assign clear visual hierarchy: title at top, main diagram in middle, takeaway at bottom.
5. Always include: a title (role:"title"), the main schematic, and a takeaway (role:"takeaway").
6. Text must sound human-written, not AI-generated. No buzzwords or filler.
7. Arrow labels should be verbs or short phrases like "encodes", "predicts", "feeds into".
8. Group related blocks inside container elements.
9. Use shape:"rounded" for most blocks, "ellipse" for special nodes, "diamond" for decisions.
10. Position elements so they don't overlap. Use x,y coordinates on a 1200x1500 canvas.
11. Leave 80px padding on all sides.
12. Title y should be around 40-80, takeaway y should be near the bottom.

FigureSchema format:
{
  "id": "string",
  "version": 1,
  "meta": {
    "title": "string",
    "subtitle": "string (optional)",
    "takeaway": "string (optional)",
    "createdAt": "ISO string",
    "prompt": "original user prompt"
  },
  "canvas": { "width": 1200, "height": 1500, "background": "#ffffff", "padding": 80 },
  "elements": [
    // TextBlockElement: { type:"text", id, x, y, width, height, text, fontSize, fontFamily:"sans"|"mono", fontWeight:"normal"|"bold", color, align:"left"|"center"|"right", role:"title"|"subtitle"|"label"|"body"|"takeaway" }
    // DiagramBlockElement: { type:"block", id, x, y, width, height, label, backgroundColor, borderColor, borderWidth, borderRadius, fontSize, fontColor, shape:"rectangle"|"rounded"|"ellipse"|"diamond" }
    // ArrowElement: { type:"arrow", id, fromId, toId, fromSide:"top"|"right"|"bottom"|"left", toSide:"top"|"right"|"bottom"|"left", label (optional), color, strokeWidth, style:"solid"|"dashed" }
    // ContainerElement: { type:"container", id, x, y, width, height, label (optional), backgroundColor, borderColor, borderRadius, childIds:[] }
    // DividerElement: { type:"divider", id, x, y, width, height, color, thickness }
    // ImageSlotElement: { type:"image", id, x, y, width, height, prompt:"description for image generation" }
  ],
  "style": { "palette": ["5 hex colors"], "fontFamily": "Inter", "headingSize": 32, "bodySize": 16, "borderRadius": 12, "shadow": false }
}`;

export async function generateFigureSchema(
  prompt: string,
  apiKey: string,
  stylePrefs?: StylePreference[]
): Promise<FigureSchema> {
  const styleContext = stylePrefs?.length
    ? `\n\nUser style preferences:\n${stylePrefs
        .map((p) => `- ${p.key}: ${p.value}`)
        .join("\n")}`
    : "";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + styleContext },
        {
          role: "user",
          content: `Create a LinkedIn figure for: "${prompt}"\n\nReturn ONLY the JSON. No markdown fences.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as Record<string, Record<string, string>>)?.error?.message ||
        `OpenAI API error: ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  const schema = JSON.parse(content) as FigureSchema;

  if (!schema.elements || !Array.isArray(schema.elements)) {
    throw new Error("Invalid schema: missing elements array");
  }

  return schema;
}

export async function refineFigureSchema(
  currentSchema: FigureSchema,
  instruction: string,
  apiKey: string
): Promise<FigureSchema> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here is the current figure schema:\n${JSON.stringify(currentSchema, null, 2)}\n\nApply this edit: "${instruction}"\n\nReturn the COMPLETE updated schema as JSON. No markdown fences.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as Record<string, Record<string, string>>)?.error?.message ||
        `OpenAI API error: ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  return JSON.parse(content) as FigureSchema;
}
