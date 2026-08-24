import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const MAX_LINES = 350;
export const LOC_ROOTS = ["src", "tests", "scripts"];
const CHECKED = /\.(ts|tsx)$/;
const SKIPPED_DIRS = new Set(["node_modules", "dist", ".astro"]);

/** Count lines the way editors show them: a trailing newline does not add a line. */
export function countLines(text) {
  if (text.length === 0) return 0;
  const lines = text.split(/\r?\n/);
  return lines.at(-1) === "" ? lines.length - 1 : lines.length;
}

/** Return every file over the limit as { file, lines }, largest first. */
export function findOversized(files, max = MAX_LINES) {
  return files
    .filter((entry) => entry.lines > max)
    .sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file));
}

export async function collectFiles(root, dir) {
  const base = path.join(root, dir);
  const entries = await readdir(base, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const relative = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return SKIPPED_DIRS.has(entry.name) ? [] : collectFiles(root, relative);
      }
      return CHECKED.test(entry.name) ? [relative] : [];
    }),
  );
  return nested.flat();
}

export async function measure(root, dirs = LOC_ROOTS) {
  const files = (await Promise.all(dirs.map((dir) => collectFiles(root, dir)))).flat();
  return Promise.all(
    files.map(async (file) => ({
      file: file.split(path.sep).join("/"),
      lines: countLines(await readFile(path.join(root, file), "utf8")),
    })),
  );
}
