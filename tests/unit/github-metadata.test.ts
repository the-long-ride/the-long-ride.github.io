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
      tag: "v0.0.29",
      url: "https://github.com/the-long-ride/engram/releases/tag/v0.0.29",
      publishedAt: "2026-10-15T12:00:00Z",
    },
    hasRelease: true,
    totalDownloads: 2,
    logoUrl:
      "https://raw.githubusercontent.com/the-long-ride/engram/main/media/logo/engram-logo-black-transparent.svg",
    updatedAt: "2026-10-15T12:00:00Z",
  },
} as const;

describe("github metadata", () => {
  it("normalizes repository, releases, asset downloads, and logo", () => {
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
        [
          {
            tag_name: "v1.0.0",
            html_url: "https://github.com/the-long-ride/engram/releases/tag/v1.0.0",
            published_at: "2026-09-27T00:00:00Z",
            assets: [{ download_count: 10 }, { download_count: 20 }],
          },
          {
            tag_name: "v0.9.0",
            html_url: "https://github.com/the-long-ride/engram/releases/tag/v0.9.0",
            published_at: "2026-09-01T00:00:00Z",
            assets: [{ download_count: 5 }],
          },
        ],
      ),
    ).toMatchObject({
      stars: 7,
      primaryLanguage: "TypeScript",
      hasRelease: true,
      latestRelease: { tag: "v1.0.0" },
      totalDownloads: 35,
      logoUrl:
        "https://raw.githubusercontent.com/the-long-ride/engram/main/media/logo/engram-logo-black-transparent.svg",
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
