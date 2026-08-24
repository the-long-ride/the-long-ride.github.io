import { describe, expect, it } from "vitest";
import { formatSession } from "../../src/lib/hero-signal";

describe("formatSession", () => {
  it("pads hours, minutes and seconds", () => {
    expect(formatSession(0)).toBe("00:00:00");
    expect(formatSession(61)).toBe("00:01:01");
    expect(formatSession(3725)).toBe("01:02:05");
  });

  it("floors fractions and clamps negatives", () => {
    expect(formatSession(9.9)).toBe("00:00:09");
    expect(formatSession(-4)).toBe("00:00:00");
  });
});
