import { expect, test } from "@playwright/test";

const corner = (el: Element) => {
  const style = getComputedStyle(el, "::after");
  return {
    opacity: style.opacity,
    images: style.backgroundImage.split("linear-gradient").length - 1,
    duration: style.transitionDuration,
  };
};

test("current and hovered desktop nav items get corner brackets", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects/");
  const current = page.locator('.desktop-nav a[aria-current="page"]');
  expect(await current.evaluate(corner)).toMatchObject({ opacity: "1", images: 8, duration: "0s" });
  const other = page.locator(".desktop-nav a:not([aria-current])").first();
  expect((await other.evaluate(corner)).opacity).toBe("0");
  await other.hover();
  expect((await other.evaluate(corner)).opacity).toBe("1");
});

test("mobile menu marks the current item with corner brackets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/");
  await page.locator(".mobile-menu summary").click();
  const current = page.locator('.mobile-menu nav a[aria-current="page"]');
  expect((await current.evaluate(corner)).opacity).toBe("1");
});
