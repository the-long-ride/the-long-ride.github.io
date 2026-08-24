import { describe, expect, it } from "vitest";
import { MAX_LINES, countLines, findOversized } from "../../scripts/lib/loc.mjs";

describe("LOC lint", () => {
  it("caps TypeScript files at 350 lines", () => {
    expect(MAX_LINES).toBe(350);
  });

  it("counts lines without the trailing newline and across CRLF", () => {
    expect(countLines("")).toBe(0);
    expect(countLines("a\nb\n")).toBe(2);
    expect(countLines("a\r\nb\r\nc")).toBe(3);
  });

  it("reports only files above the limit, largest first", () => {
    const files = [
      { file: "src/ok.ts", lines: 350 },
      { file: "src/big.tsx", lines: 351 },
      { file: "src/huge.ts", lines: 900 },
    ];
    expect(findOversized(files)).toEqual([
      { file: "src/huge.ts", lines: 900 },
      { file: "src/big.tsx", lines: 351 },
    ]);
  });
});
