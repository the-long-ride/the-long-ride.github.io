export type ResumeLink = { label: string; url: string };
export type ResumeExperience = {
  title: string;
  organization: string;
  start: string;
  end: string;
  location?: string;
  highlights: string[];
};
export type ResumeEducation = { institution: string; credential: string; period?: string };
export type ResumeProject = { name: string; description: string; url?: string };
export type ResumeData = {
  identity: { name: string; headline: string; location?: string };
  summary: string;
  experience: ResumeExperience[];
  skills: string[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  links: ResumeLink[];
};
// The user will supply factual résumé content later. Keep this null until then.
export const resumeData: ResumeData | null = null;
