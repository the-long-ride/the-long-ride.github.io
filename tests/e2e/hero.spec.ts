import { expect, test } from "@playwright/test";

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`name stays on one line at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const h1 = page.locator("#hero-title");
    await expect(h1).toBeVisible();
    const lines = await h1.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    });
    expect(lines).toBe(1);
    const fits = await h1.evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
    expect(fits).toBe(true);
  });
}

test("hero signal is a terminal readout with a ticking session", async ({ page }) => {
  await page.goto("/");
  const signal = page.locator(".hero-signal");
  await expect(signal).toContainText("the-long-ride · status: building · session");
  const session = signal.locator("[data-session]");
  await expect(session).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
  await expect.poll(() => session.textContent(), { timeout: 4000 }).not.toBe("00:00:00");
  await expect(signal.locator(".hero-signal-cursor")).toHaveCSS("animation-name", "signal-blink");
});

test("reduced motion freezes the terminal readout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const signal = page.locator(".hero-signal");
  await expect(signal).toHaveAttribute("data-motion-mode", "reduced");
  await expect(signal.locator(".hero-signal-cursor")).toHaveCSS("animation-name", "none");
  await page.waitForTimeout(1500);
  await expect(signal.locator("[data-session]")).toHaveText("00:00:00");
});

test("hero copy and actions stay still when the mouse moves", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.mouse.move(100, 100);
  await page.mouse.move(1300, 800, { steps: 4 });
  for (const selector of [".hero-copy", ".hero-actions"]) {
    await expect(page.locator(selector)).toHaveCSS("transform", "none");
  }
});

test("hero constellation mesh renders and responds to mouse movement", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const grid = page.locator("[data-hero-grid]");
  await expect(grid).toHaveAttribute("data-motion-mode", "full");
  const box = await grid.boundingBox();
  if (!box) throw new Error("hero grid has no box");
  const x = box.x + 250;
  const y = box.y + 250;
  await page.mouse.move(x - 50, y - 50);
  await page.mouse.move(x, y, { steps: 4 });
  await expect(grid).toHaveAttribute("data-active-cursor", "250,250");
  const drawnPixelCount = await grid.evaluate((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let nonZero = 0;
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] > 0) nonZero++;
    }
    return nonZero;
  });
  expect(drawnPixelCount).toBeGreaterThan(100);
});

test("touch visitors see a static hero grid", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-hero-grid]")).toHaveAttribute("data-motion-mode", "static");
  await context.close();
});
