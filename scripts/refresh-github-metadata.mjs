import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const snapshotPath = fileURLToPath(new URL("../src/data/github-snapshot.json", import.meta.url));
const repos = {
  engram: "engram",
  aevra: "aevra",
  "aevra-desktop-use": "aevra-desktop-use",
  "aevra-browser-use": "aevra-browser-use",
  "markdown-explorer": "markdown-explorer",
  quotashift: "QuotaShift",
  "markdown-them": "markdown-them",
  voxveil: "Voxveil",
  "know-your-project": "know-your-project",
};

const repositoryLogos = {
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

const prior = JSON.parse(await readFile(snapshotPath, "utf8"));
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function json(url, allow404 = false) {
  const response = await fetch(url, { headers });
  if (allow404 && response.status === 404) return null;
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

const next = {};
for (const slug of Object.keys(repos).sort()) {
  const repoName = repos[slug];
  try {
    const base = `https://api.github.com/repos/the-long-ride/${repoName}`;
    const [repo, releases] = await Promise.all([json(base), json(`${base}/releases`, true)]);
    const releasesList = Array.isArray(releases) ? releases : [];
    const latest = releasesList[0] ?? null;
    const totalDownloads = releasesList.reduce((acc, rel) => {
      const assets = rel.assets ?? [];
      return acc + assets.reduce((sum, asset) => sum + (asset.download_count ?? 0), 0);
    }, 0);

    next[slug] = {
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
  } catch (error) {
    if (!prior[slug]) throw new Error(`No live or snapshot metadata for ${slug}`, { cause: error });
    console.warn(
      `[metadata:refresh] keeping snapshot for ${slug}: ${error instanceof Error ? error.message : String(error)}`,
    );
    next[slug] = prior[slug];
  }
}

await writeFile(snapshotPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(`Updated ${Object.keys(next).length} repository metadata entries.`);
