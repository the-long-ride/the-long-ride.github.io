// Renders the TLR favicon (black Orbitron ExtraBold on white) into public/.
// Run: npm run favicon:generate (needs network for Google Fonts).
import { chromium } from "@playwright/test";

const sizes = [
  { file: "public/assets/favicon/favicon-32.png", size: 32 },
  { file: "public/assets/favicon/favicon-192.png", size: 192 },
  { file: "public/assets/favicon/apple-touch-icon.png", size: 180 },
];

// Share of the icon width the letters should fill.
const FILL = 0.8;

const html = (size) => `<!doctype html>
<html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@800&display=block">
<style>
  html, body { margin: 0; background: #ffffff; }
  #icon {
    width: ${size}px; height: ${size}px; display: grid; place-items: center;
    background: #ffffff; color: #000000; overflow: hidden;
  }
  #mark { font: 800 100px/1 "Orbitron", sans-serif; white-space: nowrap; }
</style></head>
<body><div id="icon"><span id="mark">TLR</span></div></body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const { file, size } of sizes) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(html(size), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => document.fonts.check('800 16px "Orbitron"'));
    if (!loaded) throw new Error("Orbitron did not load; check network access.");
    // Size the letters from their measured width so they fill the icon.
    await page.evaluate(
      ({ size, fill }) => {
        const mark = document.getElementById("mark");
        const width = mark.getBoundingClientRect().width;
        mark.style.fontSize = `${(100 * size * fill) / width}px`;
      },
      { size, fill: FILL },
    );
    await page.locator("#icon").screenshot({ path: file });
    console.log(`wrote ${file}`);
  }
} finally {
  await browser.close();
}
