import { describe, expect, it } from "vitest";
import {
  assertPortfolioEntry,
  getFeaturedProjects,
  getLabEntries,
  getReleasedProjects,
} from "../../src/lib/content";

const entry = (slug: string, overrides: Record<string, unknown> = {}) => ({
  id: slug,
  data: {
    title: slug,
    slug,
    problem: `Problem for ${slug}`,
    value: `Value for ${slug}`,
    summary: `Summary for ${slug}`,
    status: "released",
    releaseState: "released",
    featured: true,
    featuredOrder: 1,
    category: "developer-tools",
    role: "Creator",
    stack: ["TypeScript"],
    repo: `https://github.com/the-long-ride/${slug}`,
    ...overrides,
  },
});

describe("portfolio content invariants", () => {
  it("keeps exactly the approved featured project set", () => {
    const entries = [
      entry("engram", { featuredOrder: 1 }),
      entry("aevra", { featuredOrder: 2 }),
      entry("markdown-explorer", { featuredOrder: 3 }),
      entry("quotashift", { featuredOrder: 4 }),
      entry("markdown-them", { featuredOrder: 5 }),
    ];
    expect(getFeaturedProjects(entries as never).map((item) => item.data.slug)).toEqual([
      "engram",
      "aevra",
      "markdown-explorer",
      "quotashift",
      "markdown-them",
    ]);
  });

  it("rejects an in-development featured project", () => {
    expect(() =>
      assertPortfolioEntry(
        entry("prototype", {
          status: "in-development",
          releaseState: "unreleased",
          featured: true,
        }) as never,
        "lab",
      ),
    ).toThrow(/cannot be featured/i);
  });

  it("keeps Voxveil and Know Your Project in Lab only", () => {
    const entries = [
      entry("voxveil", { status: "in-development", releaseState: "unreleased", featured: false }),
      entry("know-your-project", {
        status: "in-development",
        releaseState: "unreleased",
        featured: false,
      }),
    ];
    expect(getLabEntries(entries as never).map((item) => item.data.slug)).toEqual([
      "voxveil",
      "know-your-project",
    ]);
    expect(getReleasedProjects(entries as never)).toEqual([]);
  });
});
