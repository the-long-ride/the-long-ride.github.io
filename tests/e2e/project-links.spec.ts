import { expect, test } from "@playwright/test";

const homepages = {
  engram: "https://the-long-ride.github.io/engram/",
  "markdown-explorer": "https://the-long-ride.github.io/markdown-explorer/",
  "markdown-them": "https://the-long-ride.github.io/markdown-them/",
};

for (const [slug, href] of Object.entries(homepages)) {
  test(`${slug} detail links to its homepage`, async ({ page }) => {
    await page.goto(`/projects/${slug}/`);
    const link = page.locator(".case-study-links a", { hasText: "Homepage" });
    await expect(link).toHaveAttribute("href", href);
  });
}
