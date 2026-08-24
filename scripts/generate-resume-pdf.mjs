import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist");
const resumeHtml = path.join(root, "resume", "index.html");
try {
  await access(resumeHtml, constants.R_OK);
} catch {
  console.log("Resume data is absent; skipping PDF generation.");
  process.exit(0);
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://127.0.0.1").pathname);
    let target = path.join(root, pathname);
    if (pathname.endsWith("/")) target = path.join(target, "index.html");
    const data = await readFile(target);
    res.writeHead(200, {
      "content-type": mime[path.extname(target)] ?? "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((resolve) => server.listen(4179, "127.0.0.1", resolve));
try {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4179/resume/", { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await mkdir(root, { recursive: true });
  await page.pdf({
    path: path.join(root, "resume.pdf"),
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });
  await browser.close();
  console.log("Generated dist/resume.pdf");
} finally {
  await new Promise((resolve) => server.close(resolve));
}
