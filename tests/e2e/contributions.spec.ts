import { expect, test } from "@playwright/test";

test("projects page lists open-source contributions", async ({ page }) => {
  await page.goto("/projects/");
  const section = page.locator(".contrib-section");
  await expect(section.getByRole("heading", { name: "Contributing to" })).toBeVisible();
  await expect(section.locator(".contrib-item")).toHaveCount(2);
  await expect(section.locator('a[href="https://github.com/hainguyenh/OmniTerm"]')).toBeVisible();
  await expect(section.locator('a[href="https://github.com/AprilNEA/OpenLogi"]')).toBeVisible();
});
