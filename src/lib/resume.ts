import type { ResumeData } from "../data/resume";
export function hasResume(data: ResumeData | null | undefined): data is ResumeData {
  return Boolean(data && data.identity.name.trim() && data.summary.trim());
}
export function getResumeStaticPaths(data: ResumeData | null | undefined) {
  if (!hasResume(data)) return [];
  return [{ params: { optionalPage: "resume" }, props: { resume: data } }];
}
