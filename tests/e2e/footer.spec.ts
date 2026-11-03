import { expect, test } from "@playwright/test";

test("footer credit reads (c) year // the-long-ride", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".footer-name")).toHaveText(
    `© ${new Date().getFullYear()} // the-long-ride`,
  );
});

test("footer renders full-bleed constellation motion canvas", async ({ page }) => {
  await page.goto("/");

  const footer = page.locator(".site-footer");
  await footer.scrollIntoViewIfNeeded();

  const motionCanvas = page.locator(".footer-grid-canvas");
  await expect(motionCanvas).toBeVisible();

  // Ensure canvas spans the full footer backdrop
  const box = await motionCanvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(300);
  expect(box!.height).toBeGreaterThanOrEqual(80);
});
