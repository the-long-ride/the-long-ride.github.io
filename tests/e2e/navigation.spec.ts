import { test, expect } from "@playwright/test";

test("internal navigation resolves and release status remains honest", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const hrefs = await page
    .locator('a[href^="/"]')
    .evaluateAll(
      (links) => [...new Set(links.map((a) => a.getAttribute("href")).filter(Boolean))] as string[],
    );
  for (const href of hrefs) {
    if (href.startsWith("/#")) continue;
    const response = await request.get(href);
    expect(response.status(), href).toBeLessThan(400);
  }
  await page.goto("/projects/");
  await expect(page.locator(".status-released")).toHaveCount(5);
  await page.goto("/lab/");
  await expect(page.locator(".status-in-development")).toHaveCount(2);
  await page.goto("/contact/");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /theme/i })).toHaveCount(0);
});
