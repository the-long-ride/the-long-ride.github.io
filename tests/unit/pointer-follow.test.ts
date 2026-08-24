import { describe, expect, it } from "vitest";
import { followStep } from "../../src/lib/pointer-follow";

describe("followStep", () => {
  it("moves a fraction of the remaining distance", () => {
    const step = followStep({ x: 0, y: 0 }, { x: 100, y: 50 }, 0.2);
    expect(step).toEqual({ x: 20, y: 10, settled: false });
  });

  it("snaps to the target once the gap is sub-pixel", () => {
    const step = followStep({ x: 99.95, y: 50 }, { x: 100, y: 50 }, 0.2);
    expect(step).toEqual({ x: 100, y: 50, settled: true });
  });
});
