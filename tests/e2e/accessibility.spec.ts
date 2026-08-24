import { test, expect } from "@playwright/test";

test("primary navigation and content remain keyboard reachable", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeInViewport();
  await expect(page.locator('[data-featured-project="engram"]')).toContainText("Engram");
  await expect(page.locator('[aria-label="Primary"] a')).toHaveCount(6);
});

test("reduced motion leaves content visible and pointer decoration inert", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-motion-ambient]")).toHaveAttribute(
    "data-motion-mode",
    "reduced",
  );
  await expect(page.getByRole("heading", { level: 1, name: "Thế Long" })).toBeVisible();
});
