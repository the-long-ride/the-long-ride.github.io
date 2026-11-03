import snapshotData from "../data/github-snapshot.json";

export type LatestRelease = { tag: string; url: string; publishedAt: string };

export type RepositoryMetadata = {
  slug: string;
  name: string;
  url: string;
  stars: number;
  primaryLanguage: string | null;
  latestRelease: LatestRelease | null;
  hasRelease: boolean;
  totalDownloads: number;
  logoUrl: string | null;
  updatedAt: string;
};

export type RepositoryMetadataSnapshot = Record<string, RepositoryMetadata>;

type GithubRepositoryResponse = {
  name: string;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
};

type GithubAssetResponse = { download_count: number };

type GithubReleaseResponse = {
  tag_name: string;
  html_url: string;
  published_at: string;
  assets?: GithubAssetResponse[];
};

export const portfolioRepositories = {
  engram: "engram",
  aevra: "aevra",
  "aevra-desktop-use": "aevra-desktop-use",
  "aevra-browser-use": "aevra-browser-use",
  "markdown-explorer": "markdown-explorer",
  quotashift: "QuotaShift",
  "markdown-them": "markdown-them",
  voxveil: "Voxveil",
  "know-your-project": "know-your-project",
} as const;

export const repositoryLogos: Record<string, string> = {
  engram:
    "https://raw.githubusercontent.com/the-long-ride/engram/main/media/logo/engram-logo-black-transparent.svg",
  aevra: "https://raw.githubusercontent.com/the-long-ride/aevra/main/assets/aevra-logo.png",
  "aevra-desktop-use":
    "https://raw.githubusercontent.com/the-long-ride/aevra-desktop-use/main/packaging/icons/aevra-logo.png",
  "aevra-browser-use":
    "https://raw.githubusercontent.com/the-long-ride/aevra-browser-use/main/shared/aevra/apps/extension/icons/icon-128.png",
  "markdown-explorer":
    "https://raw.githubusercontent.com/the-long-ride/markdown-explorer/main/ui/assets/logos/logo.png",
  quotashift:
    "https://raw.githubusercontent.com/the-long-ride/QuotaShift/main/assets/icons/quota-shift-logo.png",
  "markdown-them":
    "https://raw.githubusercontent.com/the-long-ride/markdown-them/main/assets/markdown-them-logo.png",
  voxveil: "https://raw.githubusercontent.com/the-long-ride/Voxveil/master/assets/voxveil-logo.png",
};

export type PortfolioRepositorySlug = keyof typeof portfolioRepositories;

const defaultSnapshot = snapshotData as RepositoryMetadataSnapshot;

export function normalizeRepositoryMetadata(
  slug: string,
  repo: GithubRepositoryResponse,
  releases: GithubReleaseResponse[] | GithubReleaseResponse | null,
): RepositoryMetadata {
  const releasesList = Array.isArray(releases) ? releases : releases ? [releases] : [];
  const latest = releasesList[0] ?? null;
  const totalDownloads = releasesList.reduce((acc, rel) => {
    const assets = rel.assets ?? [];
    return acc + assets.reduce((sum, asset) => sum + (asset.download_count ?? 0), 0);
  }, 0);

  return {
    slug,
    name: repo.name,
    url: repo.html_url,
    stars: repo.stargazers_count,
    primaryLanguage: repo.language,
    latestRelease: latest
      ? { tag: latest.tag_name, url: latest.html_url, publishedAt: latest.published_at }
      : null,
    hasRelease: Boolean(latest),
    totalDownloads,
    logoUrl: repositoryLogos[slug] ?? null,
    updatedAt: repo.updated_at,
  };
}

async function githubJson<T>(
  url: string,
  fetcher: typeof fetch,
  allow404 = false,
): Promise<T | null> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env?.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetcher(url, { headers });
  if (allow404 && response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub request failed (${response.status}) for ${url}`);
  return (await response.json()) as T;
}

export async function getRepositoryMetadata(
  slug: string,
  fetcher: typeof fetch = fetch,
  snapshot: RepositoryMetadataSnapshot = defaultSnapshot,
): Promise<RepositoryMetadata> {
  const repoName = portfolioRepositories[slug as PortfolioRepositorySlug];
  if (!repoName) {
    const fallback = snapshot[slug];
    if (fallback) return fallback;
    throw new Error(`No metadata available for repository: ${slug}`);
  }
  try {
    const repoUrl = `https://api.github.com/repos/the-long-ride/${repoName}`;
    const releasesUrl = `${repoUrl}/releases`;
    const repo = await githubJson<GithubRepositoryResponse>(repoUrl, fetcher);
    const releases = await githubJson<GithubReleaseResponse[]>(releasesUrl, fetcher, true);
    if (!repo) throw new Error(`GitHub returned no repository payload for ${slug}`);
    return normalizeRepositoryMetadata(slug, repo, releases);
  } catch (error) {
    const fallback = snapshot[slug];
    if (fallback) {
      console.warn(
        `[github-metadata] using snapshot for ${slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return fallback;
    }
    throw new Error(`No metadata available for repository: ${slug}`, { cause: error });
  }
}

export async function loadPortfolioMetadata(
  fetcher: typeof fetch = fetch,
  snapshot: RepositoryMetadataSnapshot = defaultSnapshot,
): Promise<RepositoryMetadataSnapshot> {
  const entries = await Promise.all(
    Object.keys(portfolioRepositories).map(
      async (slug) => [slug, await getRepositoryMetadata(slug, fetcher, snapshot)] as const,
    ),
  );
  return Object.fromEntries(entries);
}
