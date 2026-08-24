export type SmallProject = {
  name: string;
  repo: string;
  summary: string;
};

/** Small public projects: listed only, no detail page. */
export const smallProjects: SmallProject[] = [
  {
    name: "AI Chatweb Supporter",
    repo: "https://github.com/the-long-ride/ai-chatweb-supporter",
    summary: "Improves the user experience of AI chat web interfaces.",
  },
  {
    name: "Focus Multi View",
    repo: "https://github.com/the-long-ride/focus-multi-view-chrome-xtenstion",
    summary: "Chromium extension that opens multiple websites in the same tab.",
  },
  {
    name: "SnapZip",
    repo: "https://github.com/the-long-ride/SnapZip",
    summary:
      "VS Code extension that zips any folder from the right-click menu, aware of .gitignore and custom ignore patterns.",
  },
  {
    name: "SVG Skills",
    repo: "https://github.com/the-long-ride/svg-skills",
    summary: "AI agent skill that lets an LLM find and choose SVG icons from svgrepo.com.",
  },
  {
    name: "Antigravity Quota Quickcheck",
    repo: "https://github.com/the-long-ride/antigravity-quota-quickcheck",
    summary:
      "Antigravity quota monitor as a VS Code extension or desktop app; the predecessor of QuotaShift.",
  },
  {
    name: "Random String Generator",
    repo: "https://github.com/the-long-ride/chromium-extensions-random-string-generator",
    summary:
      "Chromium extension that quickly fills fields with random strings of a chosen length, character set, or pattern.",
  },
];
