import { test, expect } from "@playwright/test";

test("production build hides resume until factual data exists", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Résumé" })).toHaveCount(0);
  await expect(page.locator("[data-selected-experience]")).toHaveCount(0);
});
