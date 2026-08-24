import { expect, test } from "@playwright/test";

for (const path of ["/", "/projects/", "/lab/"]) {
  test(`project cards are spaced apart on phones: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(path);
    const cards = page.locator(".project-card");
    expect(await cards.count()).toBeGreaterThan(1);
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    if (!first || !second) throw new Error("project cards have no box");
    expect(second.y - (first.y + first.height)).toBeGreaterThanOrEqual(48);
  });
}

for (const width of [320, 375, 414]) {
  test(`project logo never covers the coordinate label at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("/");
    const visuals = page.locator("[data-featured-project] .project-visual");
    const count = await visuals.count();
    for (let i = 0; i < count; i += 1) {
      const logo = await visuals.nth(i).locator(".project-logo").boundingBox();
      const label = await visuals.nth(i).locator(".project-coordinate").boundingBox();
      if (!logo || !label) throw new Error("missing logo or label box");
      const overlaps =
        logo.x < label.x + label.width &&
        label.x < logo.x + logo.width &&
        logo.y < label.y + label.height &&
        label.y < logo.y + logo.height;
      expect(overlaps, `card ${i + 1}`).toBe(false);
    }
  });
}
