import { test, expect } from "@playwright/test";

test("capture all browser errors on page load", async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
    if (msg.type() === "warning") warnings.push(msg.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);

  // Take screenshot of what the user sees
  await page.screenshot({
    path: "tests/e2e/screenshots/debug-page-load.png",
    fullPage: true,
  });

  console.log("=== ERRORS ===");
  errors.forEach((e) => console.log(e));
  console.log("=== WARNINGS ===");
  warnings.forEach((w) => console.log(w));
  console.log("=== DONE ===");

  // This test is for debugging — we want to see the errors
  expect(true).toBe(true);
});
