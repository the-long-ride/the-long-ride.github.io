import { describe, expect, it } from "vitest";
import { getGoatCounterConfig } from "../../src/lib/analytics";

describe("GoatCounter configuration", () => {
  it("emits nothing when no site code is configured", () => {
    expect(getGoatCounterConfig(undefined)).toBeNull();
    expect(getGoatCounterConfig(" ")).toBeNull();
  });

  it("builds one cookie-free hosted endpoint when configured", () => {
    expect(getGoatCounterConfig("the-long-ride")).toEqual({
      scriptSrc: "https://gc.zgo.at/count.js",
      endpoint: "https://the-long-ride.goatcounter.com/count",
    });
  });
});
