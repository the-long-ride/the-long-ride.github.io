import { expect, test } from "@playwright/test";

test("hero kicker names the role", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-kicker")).toHaveText(
    "Software // Agentic developer // Open-source builder",
  );
});

test("hero buttons stay put on hover and have no transition", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const button = page.locator(".hero-actions .magnetic-link").first();
  await expect(button).toHaveAttribute("data-motion-mode", "full");
  await expect(button).toHaveCSS("transition-duration", "0s");
  await button.hover();
  await page.mouse.move(
    ...(await button.boundingBox().then((b) => [b!.x + 10, b!.y + 10] as const)),
  );
  await expect(button).toHaveCSS("transform", "none");
});

test("hero buttons are framed by four corner brackets", async ({ page }) => {
  await page.goto("/");
  const frame = await page
    .locator(".hero-actions .magnetic-link")
    .first()
    .evaluate((el) => {
      const style = getComputedStyle(el, "::before");
      return {
        images: style.backgroundImage.split("linear-gradient").length - 1,
        inset: style.top,
      };
    });
  expect(frame.images).toBe(8);
  expect(frame.inset).toBe("-6px");
});
