import { test, expect } from "@playwright/test";

const featuredSlugs = ["engram", "aevra", "markdown-explorer", "quotashift", "markdown-them"];

test("homepage tells the portfolio story without fabricated sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Thế Long" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore selected work/i })).toHaveAttribute(
    "href",
    "#selected-work",
  );
  await expect(page.getByRole("link", { name: /Start a conversation/i })).toHaveAttribute(
    "href",
    "/contact/",
  );

  const featured = page.locator("[data-featured-project]");
  await expect(featured).toHaveCount(5);
  await expect(featured).toContainText([
    "Engram",
    "Aevra",
    "Markdown Explorer",
    "QuotaShift",
    "Markdown Them",
  ]);
  await expect(page.getByRole("heading", { name: /^(Now|Currently Building)$/i })).toHaveCount(0);
  await expect(page.locator("[data-selected-experience]")).toHaveCount(0);
  await expect(page.locator("[data-writing-preview]")).toHaveCount(0);
});

test("each featured project shows its own app logo from local assets", async ({ page }) => {
  await page.goto("/");
  for (const slug of featuredSlugs) {
    const logo = page.locator(`[data-featured-project="${slug}"] img.project-logo`);
    await expect(logo, slug).toHaveCount(1);
    await expect(logo, slug).toHaveAttribute(
      "src",
      new RegExp(`^/projects/${slug}/logo\\.(png|svg)$`),
    );
    await logo.scrollIntoViewIfNeeded();
    const loaded = await logo.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
    );
    expect(loaded, `${slug} logo loads`).toBe(true);
  }
  await expect(page.locator("[data-featured-project] .project-mark")).toHaveCount(0);
});
