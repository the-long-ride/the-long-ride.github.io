import { expect, test } from "@playwright/test";

test("footer credit reads (c) year // the-long-ride", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".footer-name")).toHaveText(
    `© ${new Date().getFullYear()} // the-long-ride`,
  );
});
