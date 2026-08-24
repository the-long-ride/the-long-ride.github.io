import { describe, expect, it } from "vitest";
import { getResumeStaticPaths, hasResume } from "../../src/lib/resume";
import type { ResumeData } from "../../src/data/resume";

describe("resume availability", () => {
  it("emits nothing when production resume data is absent", () => {
    expect(hasResume(null)).toBe(false);
    expect(getResumeStaticPaths(null)).toEqual([]);
  });

  it("emits the resume route from the same supplied data", () => {
    const fixture: ResumeData = {
      identity: { name: "Test Person", headline: "Software Developer" },
      summary: "A factual fixture used only in tests.",
      experience: [
        {
          title: "Engineer",
          organization: "Example",
          start: "2025",
          end: "2026",
          highlights: ["Built a thing"],
        },
      ],
      skills: ["TypeScript"],
      education: [],
      projects: [],
      links: [],
    };
    expect(hasResume(fixture)).toBe(true);
    expect(getResumeStaticPaths(fixture)).toEqual([
      { params: { optionalPage: "resume" }, props: { resume: fixture } },
    ]);
  });
});
