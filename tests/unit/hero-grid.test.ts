import { describe, expect, it } from "vitest";
import { cellAt, decayHeat, heatKernel } from "../../src/lib/hero-grid";

describe("cellAt", () => {
  it("maps pixels to 50px cells", () => {
    expect(cellAt(0, 0)).toEqual({ col: 0, row: 0 });
    expect(cellAt(149, 51)).toEqual({ col: 2, row: 1 });
  });
});

describe("heatKernel", () => {
  it("lights the hovered cell fully and its neighbours less", () => {
    const heat = new Map(heatKernel(1, 1, 3, 3).map((cell) => [cell.index, cell.value]));
    expect(heat.size).toBe(9);
    expect(heat.get(4)).toBe(1);
    expect(heat.get(1)).toBe(0.45);
    expect(heat.get(0)).toBe(0.22);
  });

  it("clips neighbours at the grid edge", () => {
    const cells = heatKernel(0, 0, 3, 3).map((cell) => cell.index);
    expect(cells.sort()).toEqual([0, 1, 3, 4]);
  });
});

describe("decayHeat", () => {
  it("fades cells and reports when everything is dark", () => {
    const heat = new Float32Array([1, 0.011, 0]);
    expect(decayHeat(heat, 0.5)).toBe(true);
    expect(heat[0]).toBeCloseTo(0.5);
    expect(heat[1]).toBe(0);
    const dim = new Float32Array([0.015]);
    expect(decayHeat(dim, 0.5)).toBe(false);
  });
});
