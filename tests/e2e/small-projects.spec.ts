import { expect, test } from "@playwright/test";

const repos = [
  "ai-chatweb-supporter",
  "focus-multi-view-chrome-xtenstion",
  "SnapZip",
  "svg-skills",
  "antigravity-quota-quickcheck",
  "chromium-extensions-random-string-generator",
];

test("projects page lists small projects with repository links only", async ({ page }) => {
  await page.goto("/projects/");
  const section = page.locator(".small-section");
  await expect(section.getByRole("heading", { name: "Small projects" })).toBeVisible();
  await expect(section.locator(".small-item")).toHaveCount(repos.length);
  const hrefs = await section
    .locator("a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(hrefs).toEqual(repos.map((repo) => `https://github.com/the-long-ride/${repo}`));
});

test("small projects sit between released work and contributions", async ({ page }) => {
  await page.goto("/projects/");
  const order = await page
    .locator(".project-list, .small-section, .contrib-section")
    .evaluateAll((nodes) => nodes.map((node) => node.className.split(" ")[0]));
  expect(order).toEqual(["project-list", "small-section", "contrib-section"]);
});
