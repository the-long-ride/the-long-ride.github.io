import { expect, test } from "@playwright/test";

test("reduced-motion visitors receive reduced decorative motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-motion-ambient]")).toHaveAttribute(
    "data-motion-mode",
    "reduced",
  );
  await expect(page.locator("[data-cursor-follower]")).toHaveAttribute(
    "data-motion-mode",
    "reduced",
  );
  await expect(page.locator("[data-cursor-follower]")).toHaveCSS("display", "none");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});

test("touch visitors keep content usable without cursor effects", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-motion-ambient]")).toHaveAttribute("data-motion-mode", "static");
  await expect(page.locator("[data-cursor-follower]")).toHaveAttribute(
    "data-motion-mode",
    "static",
  );
  await expect(page.locator("[data-cursor-follower]")).toHaveCSS("display", "none");
  await expect(page.getByRole("link", { name: /the-long-ride — home/ })).toBeVisible();
  await context.close();
});

test("desktop cursor follower trails the mouse and marks project cards", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const follower = page.locator("[data-cursor-follower]");
  await expect(follower).toHaveAttribute("data-motion-mode", "full");
  await expect(page.locator("html")).toHaveAttribute("data-cursor", "full");

  await page.mouse.move(200, 200);
  await page.mouse.move(640, 420, { steps: 8 });
  await expect(follower).toHaveClass(/is-active/);
  await expect(page.locator(".cursor-dot")).toHaveAttribute("style", /translate3d\(640px, 420px/);
  await expect
    .poll(() => page.locator(".cursor-ring").getAttribute("style"))
    .toMatch(/translate3d\(640px, 420px/);

  const card = page.locator('[data-featured-project="engram"] .project-card-main');
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  if (!box) throw new Error("engram card has no box");
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.5, { steps: 4 });
  await expect(follower).toHaveClass(/is-card/);

  // The system cursor is never replaced.
  await expect(page.locator("body")).not.toHaveCSS("cursor", "none");
});
