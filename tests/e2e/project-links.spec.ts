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

test("featured project case study links to dynamic release and downloads", async ({ page }) => {
  await page.goto("/projects/markdown-explorer/");
  const releaseLink = page.locator(".case-study-links a", { hasText: /Release v/ });
  await expect(releaseLink).toHaveAttribute(
    "href",
    /^https:\/\/github\.com\/the-long-ride\/markdown-explorer\/releases\/tag\/v/,
  );
  const downloadLink = page.locator(".case-study-links a", { hasText: /downloads/ });
  await expect(downloadLink).toHaveAttribute(
    "href",
    "https://github.com/the-long-ride/markdown-explorer/releases",
  );
  const logoLink = page.locator(".case-study-logo-link");
  await expect(logoLink).toHaveAttribute(
    "href",
    "https://github.com/the-long-ride/markdown-explorer",
  );
});
