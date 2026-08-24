import { describe, expect, it } from "vitest";
import { getRepositoryMetadata, normalizeRepositoryMetadata } from "../../src/lib/github-metadata";

const snapshot = {
  engram: {
    slug: "engram",
    name: "engram",
    url: "https://github.com/the-long-ride/engram",
    stars: 6,
    primaryLanguage: "TypeScript",
    latestRelease: {
      tag: "v0.0.28",
      url: "https://github.com/the-long-ride/engram/releases/tag/v0.0.28",
      publishedAt: "2026-08-11T10:21:18Z",
    },
    hasRelease: true,
    updatedAt: "2026-08-22T07:40:14Z",
  },
} as const;

describe("github metadata", () => {
  it("normalizes repository and latest release data", () => {
    expect(
      normalizeRepositoryMetadata(
        "engram",
        {
          name: "engram",
          html_url: "https://github.com/the-long-ride/engram",
          stargazers_count: 7,
          language: "TypeScript",
          updated_at: "2026-09-28T00:00:00Z",
        },
        {
          tag_name: "v1.0.0",
          html_url: "https://github.com/the-long-ride/engram/releases/tag/v1.0.0",
          published_at: "2026-09-27T00:00:00Z",
        },
      ),
    ).toMatchObject({
      stars: 7,
      primaryLanguage: "TypeScript",
      hasRelease: true,
      latestRelease: { tag: "v1.0.0" },
    });
  });

  it("falls back to the committed snapshot when GitHub is unavailable", async () => {
    const failingFetch = async () => {
      throw new Error("rate limited");
    };
    await expect(
      getRepositoryMetadata("engram", failingFetch as typeof fetch, snapshot as never),
    ).resolves.toEqual(snapshot.engram);
  });

  it("throws when neither live data nor the snapshot can provide a repository", async () => {
    const failingFetch = async () => {
      throw new Error("offline");
    };
    await expect(
      getRepositoryMetadata("missing", failingFetch as typeof fetch, {}),
    ).rejects.toThrow(/No metadata available/);
  });
});
