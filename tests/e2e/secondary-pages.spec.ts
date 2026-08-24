import { test, expect } from "@playwright/test";

const portrait = "https://avatars.githubusercontent.com/u/73347418?v=4";
const email = "thelong1406@gmail.com";

test("about shows the GitHub portrait without inventing work history", async ({ page }) => {
  await page.goto("/about/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Build it\. Use it\. Improve it\./i }),
  ).toBeVisible();
  const img = page.locator("img[data-profile-portrait]");
  await expect(img).toHaveCount(1);
  await expect(img).toHaveAttribute("src", portrait);
  await expect(img).toHaveAttribute("alt", "Portrait of Thế Long");
  await expect(page.getByText(/company|employer/i)).toHaveCount(0);
});

test("contact uses direct public links and no form", async ({ page }) => {
  await page.goto("/contact/");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator("main").getByRole("link", { name: new RegExp(email) })).toHaveAttribute(
    "href",
    `mailto:${email}`,
  );
  await expect(page.getByRole("link", { name: "GitHub / @the-long-ride" })).toHaveAttribute(
    "href",
    "https://github.com/the-long-ride",
  );
});

test("contact lists the public social profiles", async ({ page }) => {
  await page.goto("/contact/");
  const hrefs = await page
    .locator(".contact-socials a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(hrefs).toEqual([
    "https://github.com/the-long-ride",
    "https://www.linkedin.com/in/the-long-ride",
    "https://www.youtube.com/channel/UC5uBESnspRQfqJpIV5L_RFg",
    "https://open.spotify.com/user/313ixsy5guzfocysyrizeomfutsa",
    "https://www.paypal.com/paypalme/thelongride",
    "https://www.instagram.com/the.long.ride/",
  ]);
});

test("footer offers the email address on every page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("footer").getByRole("link", { name: email })).toHaveAttribute(
    "href",
    `mailto:${email}`,
  );
});

test("writing renders an honest empty state", async ({ page }) => {
  await page.goto("/writing/");
  await expect(page.getByRole("heading", { level: 1, name: /Writing/i })).toBeVisible();
  await expect(page.getByText(/No published notes yet/i)).toBeVisible();
});
