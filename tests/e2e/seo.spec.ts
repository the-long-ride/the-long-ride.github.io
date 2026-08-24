import { test, expect } from "@playwright/test";

for (const path of [
  "/",
  "/projects/engram/",
  "/lab/voxveil/",
  "/about/",
  "/definitely-not-a-real-route/",
]) {
  test(`SEO shell for ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https:\/\/the-long-ride\.github\.io\//);
    expect(canonical).not.toContain("/the-long-ride/");
  });
}
