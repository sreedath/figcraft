# Skill: Testing

## Purpose
Guarantee that the tool works before any user touches it. Every deploy is tested. No manual QA required.

## Testing Philosophy
- If a user could encounter a bug, there should be a test that catches it first.
- Tests are not afterthoughts — they're written alongside features.
- Flaky tests are bugs. Fix or delete them immediately.

## Testing Stack

| Type | Tool | Location | When |
|------|------|----------|------|
| Unit | Vitest | `tests/unit/` | Every PR |
| E2E | Playwright | `tests/e2e/` | Every PR |
| Visual | Playwright screenshot comparison | `tests/e2e/` | UI-changing PRs |
| Type | `tsc --noEmit` | Root | Every PR |
| Lint | ESLint + Prettier | Root | Every PR |
| Build | `next build` | Root | Every PR |

## CI Pipeline (GitHub Actions)

```yaml
# Runs on every PR to staging
jobs:
  quality:
    steps:
      - pnpm install
      - pnpm typecheck        # TypeScript strict
      - pnpm lint              # ESLint + Prettier
      - pnpm test              # Vitest unit tests
      - pnpm build             # Next.js production build
      - pnpm test:e2e          # Playwright E2E
```

All steps must pass. One failure blocks the PR.

## Unit Tests

### What to Test
- Schema engine: NL input → valid FigureSchema output
- Layout algorithms: element positions are correct and non-overlapping
- Geometry utilities: alignment, spacing, bounding box calculations
- Element builders: correct Excalidraw element structure
- API route handlers: correct responses for valid/invalid input
- Memory store: CRUD operations on preferences

### Conventions
- File naming: `*.test.ts` next to the source file OR in `tests/unit/`.
- Use `describe` blocks grouped by function.
- Use `it` with behavior descriptions ("creates a rectangle with correct dimensions").
- Mock external APIs (Claude, DALL-E) with fixture responses.
- No `console.log` in tests.

### Example
```typescript
// layout-algorithms.test.ts
describe('gridLayout', () => {
  it('distributes 4 elements in a 2x2 grid with equal spacing', () => {
    const elements = createMockElements(4);
    const result = gridLayout(elements, { columns: 2, gap: 20 });

    expect(result[0].x).toBe(result[1].x - result[1].width - 20);
    expect(result[0].y).toBe(result[2].y - result[2].height - 20);
  });

  it('centers the grid on the canvas', () => {
    const elements = createMockElements(2);
    const result = gridLayout(elements, { columns: 2, gap: 20 });
    const totalWidth = result[1].x + result[1].width - result[0].x;
    const expectedLeft = (CANVAS_WIDTH - totalWidth) / 2;

    expect(result[0].x).toBeCloseTo(expectedLeft, 1);
  });
});
```

## E2E Tests

### Critical Flows (Must Always Pass)
1. **Generate figure:** Type prompt → see figure rendered on canvas.
2. **Drag element:** Click and drag a block → it moves, others don't.
3. **Refine figure:** Type refinement → see figure update.
4. **Export PNG:** Click export → download starts, file is valid PNG.
5. **Upload example:** Upload image → see it in memory panel.
6. **Regenerate:** Click regenerate → get a different figure.
7. **Version history:** Generate → refine → undo → see original.

### Setup
- Use Playwright's `page.goto` with the local dev server.
- Mock AI APIs with MSW (Mock Service Worker) for deterministic results.
- Use Playwright's `expect(page).toHaveScreenshot()` for visual regression.
- Tests run in headless Chromium.

### Example
```typescript
// generation.spec.ts
test('generates a figure from a text prompt', async ({ page }) => {
  await page.goto('/editor');

  const promptBar = page.getByRole('textbox', { name: /describe/i });
  await promptBar.fill('Explain the transformer architecture');
  await promptBar.press('Enter');

  // Wait for generation to complete
  await expect(page.getByTestId('canvas')).toBeVisible();
  await expect(page.getByText('Transformer')).toBeVisible({ timeout: 15000 });

  // Verify elements exist on canvas
  const elements = await page.evaluate(() => {
    return document.querySelectorAll('[data-testid="figure-element"]').length;
  });
  expect(elements).toBeGreaterThan(3);
});
```

## Pre-Deploy Health Check

After every deployment, an automated health check runs:
1. Hit `/api/health` — verify API is responding.
2. Hit `/editor` — verify page loads without JS errors.
3. Hit `/api/generate` with a test prompt — verify generation works.
4. If any check fails, auto-rollback to previous deploy.

## Test Data
- Fixture prompts stored in `tests/fixtures/prompts.json`.
- Fixture schemas stored in `tests/fixtures/schemas/`.
- Fixture API responses in `tests/fixtures/api-responses/`.
- Screenshot baselines in `tests/e2e/screenshots/`.
