import { describe, expect, it } from "vitest";
import snapshot from "../../src/data/github-snapshot.json";
import { approvedFeaturedSlugs } from "../../src/lib/content";
import { portfolioRepositories } from "../../src/lib/github-metadata";

describe("featured project metadata", () => {
  it("lists Markdown Them last in the approved featured order", () => {
    expect(approvedFeaturedSlugs).toEqual([
      "engram",
      "aevra",
      "markdown-explorer",
      "quotashift",
      "markdown-them",
    ]);
  });

  it("has a repository mapping and committed snapshot for every featured project", () => {
    for (const slug of approvedFeaturedSlugs) {
      expect(portfolioRepositories, slug).toHaveProperty(slug);
      expect(snapshot, slug).toHaveProperty(slug);
    }
  });
});
