import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const snapshotPath = fileURLToPath(new URL("../src/data/github-snapshot.json", import.meta.url));
const repos = {
  engram: "engram",
  aevra: "aevra",
  "markdown-explorer": "markdown-explorer",
  quotashift: "QuotaShift",
  "markdown-them": "markdown-them",
  voxveil: "Voxveil",
  "know-your-project": "know-your-project",
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
    const [repo, release] = await Promise.all([json(base), json(`${base}/releases/latest`, true)]);
    next[slug] = {
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
