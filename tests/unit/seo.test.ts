import { describe, expect, it } from "vitest";
import { canonicalUrl, pageTitle } from "../../src/lib/seo";

describe("SEO helpers", () => {
  it("builds root-site canonical URLs without a repository prefix", () => {
    expect(canonicalUrl("/projects/engram/")).toBe(
      "https://the-long-ride.github.io/projects/engram/",
    );
    expect(canonicalUrl("/projects/engram/")).not.toContain("/the-long-ride/");
  });

  it("keeps human-readable page titles", () => {
    expect(pageTitle("Engram")).toBe("Engram — Thế Long");
  });
});
