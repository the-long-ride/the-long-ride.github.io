import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dirs = { projects: "src/content/projects", lab: "src/content/lab" };
const approvedFeatured = ["engram", "aevra", "markdown-explorer", "quotashift", "markdown-them"];

function field(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) return undefined;
  const raw = match[1].trim();
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
  return raw.replace(/^['"]|['"]$/g, "");
}

async function loadCollection(collection, dir) {
  const base = path.join(root, dir);
  const files = (await readdir(base)).filter((name) => /\.mdx?$/.test(name)).sort();
  return Promise.all(
    files.map(async (file) => {
      const full = path.join(base, file);
      const text = (await readFile(full, "utf8")).replace(/\r\n/g, "\n");
      const match = text.match(/^---\n([\s\S]*?)\n---/);
      if (!match) throw new Error(`${full}: missing frontmatter`);
      const fm = match[1];
      return {
        collection,
        file,
        full,
        text,
        slug: field(fm, "slug"),
        status: field(fm, "status"),
        releaseState: field(fm, "releaseState"),
        featured: field(fm, "featured"),
        featuredOrder: field(fm, "featuredOrder"),
        repo: field(fm, "repo"),
        problem: field(fm, "problem"),
        value: field(fm, "value"),
        logo: field(fm, "logo"),
      };
    }),
  );
}

const entries = (
  await Promise.all(
    Object.entries(dirs).map(([collection, dir]) => loadCollection(collection, dir)),
  )
).flat();
const errors = [];
const seen = new Set();
for (const item of entries) {
  if (!item.slug || seen.has(item.slug)) errors.push(`${item.file}: missing or duplicate slug`);
  seen.add(item.slug);
  if (!item.problem || !item.value) errors.push(`${item.file}: problem and value are required`);
  if (item.featured && !item.logo) errors.push(`${item.file}: featured projects need a local logo`);
  if (!item.repo?.startsWith("https://github.com/the-long-ride/"))
    errors.push(`${item.file}: repo must be a public the-long-ride GitHub URL`);
  if (item.featured && item.status !== "released")
    errors.push(`${item.file}: in-development work cannot be featured`);
  if (
    item.collection === "projects" &&
    (item.status !== "released" || item.releaseState !== "released")
  )
    errors.push(`${item.file}: Projects must be released`);
  if (
    item.collection === "lab" &&
    (item.status !== "in-development" ||
      item.releaseState !== "unreleased" ||
      item.featured !== false)
  )
    errors.push(`${item.file}: Lab must be in-development, unreleased, and not featured`);
  for (const match of item.text.matchAll(/(?:src|logo):\s*["'](\/projects\/[^"']+)["']/g)) {
    const target = path.join(root, "public", match[1]);
    try {
      if (!(await stat(target)).isFile()) errors.push(`${item.file}: missing media ${match[1]}`);
    } catch {
      errors.push(`${item.file}: missing media ${match[1]}`);
    }
  }
}
const featured = entries
  .filter((item) => item.collection === "projects" && item.featured)
  .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
  .map((item) => item.slug);
if (JSON.stringify(featured) !== JSON.stringify(approvedFeatured))
  errors.push(
    `featured projects must be exactly ${approvedFeatured.join(", ")}; got ${featured.join(", ")}`,
  );
for (const slug of ["voxveil", "know-your-project"]) {
  const item = entries.find((entry) => entry.slug === slug);
  if (!item || item.collection !== "lab" || item.status !== "in-development")
    errors.push(`${slug} must exist only in Lab as in-development`);
}
const styleDir = path.join(root, "src/styles");
const styleFiles = (await readdir(styleDir, { recursive: true })).filter((name) =>
  name.endsWith(".css"),
);
const css = (
  await Promise.all(styleFiles.map((name) => readFile(path.join(styleDir, name), "utf8")))
).join("\n");
const definedTokens = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]));
const usedTokens = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]));
for (const token of usedTokens)
  if (!definedTokens.has(token)) errors.push(`styles: undefined custom property ${token}`);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Validated ${entries.length} portfolio entries and global CSS tokens.`);
