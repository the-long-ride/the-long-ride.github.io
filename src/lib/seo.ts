import { siteConfig } from "../config/site";
export function canonicalUrl(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalized, `${siteConfig.url}/`).toString();
}
export function pageTitle(title: string): string {
  const clean = title.trim();
  if (!clean) return siteConfig.title;
  if (clean.includes(siteConfig.name)) return clean;
  return `${clean} — ${siteConfig.name}`;
}
