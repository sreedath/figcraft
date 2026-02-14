import { test, expect } from "@playwright/test";

test.describe("App Loading", () => {
  test("homepage loads without errors", async ({ page }) => {
    // Navigate to app
    await page.goto("/");

    // Verify page loads
    await expect(page).toHaveTitle(/FigCraft/);

    // Take screenshot of initial load
    await page.screenshot({
      path: "tests/e2e/screenshots/01-initial-load.png",
      fullPage: true,
    });

    // Verify header is visible
    await expect(page.getByText("FigCraft")).toBeVisible();

    // Verify canvas area exists
    await expect(page.getByText("Describe your figure")).toBeVisible();
  });

  test("settings dialog opens for first-time user", async ({ page }) => {
    // Clear localStorage to simulate first visit
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Settings dialog should auto-open
    await expect(page.getByText("OpenAI API Key")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot of settings dialog
    await page.screenshot({
      path: "tests/e2e/screenshots/02-settings-dialog.png",
      fullPage: true,
    });
  });

  test("can enter and save API key", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Wait for settings dialog
    await expect(page.getByText("OpenAI API Key")).toBeVisible({
      timeout: 5000,
    });

    // Enter a test API key
    const input = page.getByPlaceholder("sk-...");
    await input.fill("sk-test-key-12345");

    // Click save
    await page.getByRole("button", { name: /save/i }).click();

    // Verify saved feedback
    await expect(page.getByText("Saved")).toBeVisible();

    // Take screenshot after saving
    await page.screenshot({
      path: "tests/e2e/screenshots/03-api-key-saved.png",
      fullPage: true,
    });
  });

  test("prompt bar is visible and functional", async ({ page }) => {
    await page.goto("/");

    // Find the prompt textarea
    const promptBar = page.getByPlaceholder(/describe your figure/i);
    await expect(promptBar).toBeVisible();

    // Type something
    await promptBar.fill("Explain the transformer architecture");

    // Take screenshot
    await page.screenshot({
      path: "tests/e2e/screenshots/04-prompt-filled.png",
      fullPage: true,
    });

    // Verify send button exists
    await expect(page.getByRole("button").last()).toBeVisible();
  });

  test("sidebar opens and shows tabs", async ({ page }) => {
    await page.goto("/");

    // Click sidebar toggle
    const toggleButton = page.getByTitle("Toggle sidebar");
    await toggleButton.click();

    // Verify tabs are visible
    await expect(page.getByText("Style")).toBeVisible();
    await expect(page.getByText("Examples")).toBeVisible();
    await expect(page.getByText("History")).toBeVisible();
    await expect(page.getByText("Memory")).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: "tests/e2e/screenshots/05-sidebar-open.png",
      fullPage: true,
    });
  });

  test("no console errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Filter out known non-critical warnings
    const criticalErrors = errors.filter(
      (e) => !e.includes("ResizeObserver") && !e.includes("hydration")
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
