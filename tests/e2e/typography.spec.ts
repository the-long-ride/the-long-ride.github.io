import { expect, test, type Page } from "@playwright/test";

const fontOf = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);

test.describe("terminal typography", () => {
  test("headings and navigation use Orbitron", async ({ page }) => {
    await page.goto("/");
    expect(await fontOf(page, "#selected-work-title")).toMatch(/^"?Orbitron/);
    expect(await fontOf(page, ".desktop-nav a")).toMatch(/^"?Orbitron/);
  });

  test("body copy uses a terminal monospace face", async ({ page }) => {
    await page.goto("/");
    expect(await fontOf(page, ".hero-statement")).toMatch(/^"?JetBrains Mono/);
  });

  test("the name keeps its original sans-serif face everywhere it appears", async ({ page }) => {
    await page.goto("/");
    for (const selector of ["#hero-title"]) {
      const family = await fontOf(page, selector);
      expect(family, selector).toMatch(/^Inter/);
      expect(family, selector).not.toContain("Orbitron");
    }
  });

  test("Google Fonts stylesheet is linked", async ({ page }) => {
    await page.goto("/");
    const href = await page
      .locator('link[rel="stylesheet"][href^="https://fonts.googleapis.com/css2"]')
      .getAttribute("href");
    expect(href).toContain("family=Orbitron");
    expect(href).toContain("family=JetBrains+Mono");
    expect(href).toContain("display=swap");
  });

  test("Orbitron headings do not overflow a phone viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ["/", "/projects/markdown-explorer/", "/about/", "/lab/"]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      // body clips horizontal overflow, so measure each heading instead of the page.
      const clipped = await page.evaluate(() =>
        [...document.querySelectorAll("h1, h2, h3")]
          .filter((el) => el.getBoundingClientRect().width > 0)
          .filter(
            (el) =>
              el.scrollWidth > el.clientWidth + 1 ||
              el.getBoundingClientRect().right > innerWidth + 1,
          )
          .map((el) => el.textContent?.trim()),
      );
      expect(clipped, path).toEqual([]);
    }
  });
});
