import { describe, expect, it } from "vitest";
import { siteConfig } from "../../src/config/site";

describe("siteConfig", () => {
  it("targets the root GitHub Pages user site without a base path", () => {
    expect(siteConfig.url).toBe("https://the-long-ride.github.io");
    expect(siteConfig.basePath).toBe("/");
  });

  it("publishes the owner-supplied email and GitHub portrait", () => {
    expect(siteConfig.email).toBe("thelong1406@gmail.com");
    expect(siteConfig.portrait).toBe("https://avatars.githubusercontent.com/u/73347418?v=4");
  });

  it("does not expose a theme toggle", () => {
    expect(siteConfig.features.themeToggle).toBe(false);
  });
});
