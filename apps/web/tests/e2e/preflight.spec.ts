import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.join(__dirname, "screenshots", "preflight");

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.describe("Preflight Check", () => {
  test("1. App loads with zero console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`PAGE_ERROR: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`CONSOLE_ERROR: ${msg.text()}`);
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-initial-load.png"),
      fullPage: true,
    });

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("ResizeObserver") &&
        !e.includes("favicon") &&
        !e.includes("hydration")
    );

    if (criticalErrors.length > 0) {
      console.error("ERRORS FOUND:", criticalErrors);
    }
    expect(criticalErrors).toHaveLength(0);
  });

  test("2. Settings dialog renders correctly", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const dialog = page.getByText("OpenAI API Key", { exact: true });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02-settings-dialog.png"),
      fullPage: true,
    });
  });

  test("3. API key can be saved", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const input = page.getByPlaceholder("sk-...");
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill("sk-test-1234567890");

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-api-key-entered.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: /save/i }).click();
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04-api-key-saved.png"),
      fullPage: true,
    });
  });

  test("4. Canvas loads after closing settings", async ({ page }) => {
    await page.goto("/");
    // Set a fake key so settings doesn't auto-open
    await page.evaluate(() => {
      localStorage.setItem(
        "figcraft-memory",
        JSON.stringify({
          state: {
            apiKey: "sk-test-key",
            preferences: [],
            examples: [],
            history: [],
          },
          version: 0,
        })
      );
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Excalidraw canvas should be present
    const canvas = page.locator(".excalidraw");
    await expect(canvas).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05-canvas-loaded.png"),
      fullPage: true,
    });

    // Prompt bar should be visible
    const promptBar = page.getByPlaceholder(/describe your figure/i);
    await expect(promptBar).toBeVisible();

    // Header should be visible
    await expect(page.getByRole("heading", { name: "FigCraft" })).toBeVisible();
  });

  test("5. Prompt bar accepts input", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "figcraft-memory",
        JSON.stringify({
          state: {
            apiKey: "sk-test-key",
            preferences: [],
            examples: [],
            history: [],
          },
          version: 0,
        })
      );
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    const promptBar = page.getByPlaceholder(/describe your figure/i);
    await promptBar.fill("Explain the VL-JEPA architecture");

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-prompt-filled.png"),
      fullPage: true,
    });

    // Send button should be enabled
    const sendButton = page.locator("button").last();
    await expect(sendButton).toBeEnabled();
  });

  test("6. Sidebar opens with all tabs", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "figcraft-memory",
        JSON.stringify({
          state: {
            apiKey: "sk-test-key",
            preferences: [],
            examples: [],
            history: [],
          },
          version: 0,
        })
      );
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    await page.getByTitle("Toggle sidebar").click();
    await page.waitForTimeout(500);

    await expect(page.getByText("Style")).toBeVisible();
    await expect(page.getByText("Examples")).toBeVisible();
    await expect(page.getByText("History")).toBeVisible();
    await expect(page.getByText("Memory")).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "07-sidebar-style.png"),
      fullPage: true,
    });

    // Click Examples tab
    await page.getByText("Examples").click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "08-sidebar-examples.png"),
      fullPage: true,
    });

    // Click History tab
    await page.getByText("History").click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "09-sidebar-history.png"),
      fullPage: true,
    });
  });

  test("7. Health API responds", async ({ page }) => {
    const response = await page.goto("/api/health");
    expect(response?.status()).toBe(200);
    const body = await response?.json();
    expect(body.status).toBe("ok");
  });

  test("8. No layout shifts or broken elements", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "figcraft-memory",
        JSON.stringify({
          state: {
            apiKey: "sk-test-key",
            preferences: [],
            examples: [],
            history: [],
          },
          version: 0,
        })
      );
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Check viewport dimensions make sense
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(0);
    expect(viewport?.height).toBeGreaterThan(0);

    // Check no elements overflow viewport badly
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual((viewport?.width ?? 0) + 20);

    // Check header height is reasonable
    const header = page.locator("header");
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBeGreaterThan(40);
    expect(headerBox?.height).toBeLessThan(80);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "10-final-state.png"),
      fullPage: true,
    });
  });
});
