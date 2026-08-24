import { describe, expect, it } from "vitest";
import { getMotionMode } from "../../src/lib/motion-preferences";

describe("getMotionMode", () => {
  it("reduces motion when requested", () => {
    expect(getMotionMode({ reducedMotion: true, coarsePointer: false })).toBe("reduced");
  });

  it("disables pointer motion for coarse pointers", () => {
    expect(getMotionMode({ reducedMotion: false, coarsePointer: true })).toBe("static");
  });

  it("enables full motion for fine pointers without reduction", () => {
    expect(getMotionMode({ reducedMotion: false, coarsePointer: false })).toBe("full");
  });
});
