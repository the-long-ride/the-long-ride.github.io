import { MAX_LINES, findOversized, measure } from "./lib/loc.mjs";

// Run after `format:check` so counts reflect Prettier-formatted code.
const files = await measure(process.cwd());
const oversized = findOversized(files);

if (oversized.length > 0) {
  console.error(`Files over ${MAX_LINES} lines (split them into smaller modules):`);
  for (const { file, lines } of oversized) console.error(`- ${file}: ${lines}`);
  process.exit(1);
}

console.log(`LOC lint: ${files.length} .ts/.tsx files, all <= ${MAX_LINES} lines.`);
