# Skill: Image Generation

## Purpose
Generate contextually relevant images that enhance figure schematics. Images are supplementary — they illustrate concepts, not replace diagrams.

## When to Generate Images

Images should be generated when the figure needs:
- A visual metaphor (e.g., "neural network" → stylized brain/network illustration)
- A concept illustration (e.g., "self-supervised learning" → visual of masking)
- An icon or symbol that doesn't exist in standard sets
- A decorative element that adds visual interest without distracting

Images should NOT be generated for:
- Diagrams or flowcharts (Excalidraw handles this)
- Text content (we render text directly)
- Simple shapes or icons (use SVG/Excalidraw)

## Image Generation Pipeline

```
User prompt → Schema Engine identifies image slots
  → For each slot:
     1. Generate image description (concise, specific)
     2. Call image API (DALL-E 3 or FLUX)
     3. Post-process (resize, crop, adjust colors to match palette)
     4. Place in canvas at designated position
```

## API Strategy

### Primary: OpenAI DALL-E 3
```typescript
const response = await openai.images.generate({
  model: 'dall-e-3',
  prompt: imageDescription,
  n: 1,
  size: '1024x1024',
  quality: 'hd',
  style: 'natural',  // Not 'vivid' — we want clean, not flashy
});
```

### Fallback: Replicate (FLUX)
```typescript
const output = await replicate.run('black-forest-labs/flux-1.1-pro', {
  input: {
    prompt: imageDescription,
    width: 1024,
    height: 1024,
    num_inference_steps: 28,
  },
});
```

## Image Description Generation

The schema engine generates image descriptions using Claude. Rules for descriptions:
1. Be specific about the visual content, not abstract concepts.
2. Specify art style: "clean vector illustration" or "minimal line art" or "isometric 3D".
3. Specify background: "on white background" or "on transparent background".
4. Specify color scheme to match figure palette.
5. Avoid text in images — text is rendered separately.
6. Keep descriptions under 200 words.

### Example
Bad: "A picture of machine learning"
Good: "Clean vector illustration of a neural network with three layers, nodes connected by thin lines, blue and teal color scheme, white background, minimal style, no text"

## Post-Processing

After generation:
1. **Resize** to fit the image slot dimensions in the figure.
2. **Background removal** if needed (transparent for overlays).
3. **Color adjustment** to match the figure's palette (hue shift if needed).
4. **Crop** to focus on the relevant content area.
5. **Compress** for web delivery (WebP format, quality 85).

## Image Caching
- Cache generated images by prompt hash.
- Store in R2/S3 blob storage.
- Reuse cached images when the same concept appears.
- Cache TTL: 30 days.

## Rate Limiting
- Max 3 images per figure generation.
- Max 10 image generations per user per hour.
- Queue excess requests with "generating..." placeholder.

## Quality Checks
- Reject images with visible text artifacts (DALL-E sometimes generates gibberish text).
- Reject images that are mostly blank/white.
- Reject images with obvious distortions.
- If rejected, retry once with a refined prompt. If still bad, use a placeholder icon.
