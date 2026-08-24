import { expect, test } from "@playwright/test";

test("pages link the TLR favicon files and they are served", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(hrefs).toEqual([
    "/assets/favicon/favicon-32.png",
    "/assets/favicon/favicon-192.png",
    "/assets/favicon/apple-touch-icon.png",
  ]);
  for (const href of hrefs) {
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
});
