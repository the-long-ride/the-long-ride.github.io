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
type GithubReleaseResponse = { tag_name: string; html_url: string; published_at: string };
export const portfolioRepositories = {
  engram: "engram",
  aevra: "aevra",
  "markdown-explorer": "markdown-explorer",
  quotashift: "QuotaShift",
  "markdown-them": "markdown-them",
  voxveil: "Voxveil",
  "know-your-project": "know-your-project",
} as const;
export type PortfolioRepositorySlug = keyof typeof portfolioRepositories;
const defaultSnapshot = snapshotData as RepositoryMetadataSnapshot;
export function normalizeRepositoryMetadata(
  slug: string,
  repo: GithubRepositoryResponse,
  release: GithubReleaseResponse | null,
): RepositoryMetadata {
  return {
    slug,
    name: repo.name,
    url: repo.html_url,
    stars: repo.stargazers_count,
    primaryLanguage: repo.language,
    latestRelease: release
      ? { tag: release.tag_name, url: release.html_url, publishedAt: release.published_at }
      : null,
    hasRelease: Boolean(release),
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
    const releaseUrl = `${repoUrl}/releases/latest`;
    const repo = await githubJson<GithubRepositoryResponse>(repoUrl, fetcher);
    const release = await githubJson<GithubReleaseResponse>(releaseUrl, fetcher, true);
    if (!repo) throw new Error(`GitHub returned no repository payload for ${slug}`);
    return normalizeRepositoryMetadata(slug, repo, release);
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
