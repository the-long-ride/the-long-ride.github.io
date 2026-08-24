import { expect, test } from "@playwright/test";

// Headless Chromium uses overlay scrollbars, so check the loaded rules instead of pixels.
test("site ships the square terminal scrollbar rules", async ({ page }) => {
  await page.goto("/projects/");
  const rules = await page.evaluate(() => {
    const found: Record<string, string> = {};
    const walk = (list: CSSRuleList) => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSStyleRule && rule.selectorText.includes("::-webkit-scrollbar")) {
          found[rule.selectorText] = rule.style.cssText;
        } else if ("cssRules" in rule) {
          walk((rule as CSSGroupingRule).cssRules);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules);
      } catch {
        // Cross-origin sheets (Google Fonts) cannot be read.
      }
    }
    return found;
  });
  expect(rules["::-webkit-scrollbar"]).toContain("width: 12px");
  expect(rules["::-webkit-scrollbar-thumb"]).toMatch(/border-radius: 0(px)?/);
  expect(rules["::-webkit-scrollbar-thumb:hover"]).toContain("--amber-deep");
});
