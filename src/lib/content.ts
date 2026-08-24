export type PortfolioStatus = "released" | "in-development";
export type PortfolioCollection = "projects" | "lab";
export type PortfolioEntryLike = {
  id: string;
  data: {
    title: string;
    slug: string;
    problem: string;
    value: string;
    summary: string;
    status: PortfolioStatus;
    releaseState: "released" | "unreleased";
    featured: boolean;
    featuredOrder?: number;
    category: string;
    role: string;
    stack: string[];
    repo: string;
    logo?: string;
  };
};
export const approvedFeaturedSlugs = [
  "engram",
  "aevra",
  "markdown-explorer",
  "quotashift",
  "markdown-them",
] as const;
export function assertPortfolioEntry(
  entry: PortfolioEntryLike,
  collection: PortfolioCollection,
): void {
  const { data } = entry;
  if (!data.problem.trim() || !data.value.trim())
    throw new Error(`${data.slug} must explain both problem and value`);
  if (!data.repo.startsWith("https://github.com/"))
    throw new Error(`${data.slug} must link to a public GitHub repository`);
  if (data.featured && data.status !== "released")
    throw new Error(`${data.slug}: in-development work cannot be featured`);
  if (data.status === "released" && data.releaseState !== "released")
    throw new Error(`${data.slug}: released status requires released releaseState`);
  if (
    collection === "lab" &&
    (data.status !== "in-development" || data.releaseState !== "unreleased" || data.featured)
  )
    throw new Error(
      `${data.slug}: Lab entries must be unreleased, in-development, and cannot be featured`,
    );
  if (collection === "projects" && data.status !== "released")
    throw new Error(`${data.slug}: Projects entries must be released`);
}
export function getReleasedProjects<T extends PortfolioEntryLike>(entries: T[]): T[] {
  return entries.filter((entry) => entry.data.status === "released");
}
export function getFeaturedProjects<T extends PortfolioEntryLike>(entries: T[]): T[] {
  return entries
    .filter((entry) => entry.data.status === "released" && entry.data.featured)
    .sort((a, b) => (a.data.featuredOrder ?? 999) - (b.data.featuredOrder ?? 999));
}
export function getLabEntries<T extends PortfolioEntryLike>(entries: T[]): T[] {
  return entries.filter((entry) => entry.data.status === "in-development");
}
