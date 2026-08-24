export type NavItem = { label: string; href: string; feature?: "resume" };
export const baseNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects/" },
  { label: "Lab", href: "/lab/" },
  { label: "Writing", href: "/writing/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];
export function getNavigation(resumeAvailable = false): NavItem[] {
  if (!resumeAvailable) return baseNav;
  const contactIndex = baseNav.findIndex((item) => item.href === "/contact/");
  return [
    ...baseNav.slice(0, contactIndex),
    { label: "Résumé", href: "/resume/", feature: "resume" },
    ...baseNav.slice(contactIndex),
  ];
}
export const siteConfig = {
  name: "Thế Long",
  handle: "@the-long-ride",
  title: "Thế Long — Software Developer",
  description:
    "I build thoughtful developer tools, AI tooling, and local-first software with clear boundaries and fewer dependencies.",
  url: "https://the-long-ride.github.io",
  basePath: "/",
  locale: "en",
  github: "https://github.com/the-long-ride",
  email: "thelong1406@gmail.com",
  portrait: "https://avatars.githubusercontent.com/u/73347418?v=4",
  socials: [
    { label: "GitHub / @the-long-ride", href: "https://github.com/the-long-ride", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/the-long-ride", icon: "linkedin" },
    {
      label: "YouTube",
      href: "https://www.youtube.com/channel/UC5uBESnspRQfqJpIV5L_RFg",
      icon: "youtube",
    },
    {
      label: "Spotify",
      href: "https://open.spotify.com/user/313ixsy5guzfocysyrizeomfutsa",
      icon: "spotify",
    },
    { label: "PayPal.me", href: "https://www.paypal.com/paypalme/thelongride", icon: "paypal" },
    { label: "Instagram", href: "https://www.instagram.com/the.long.ride/", icon: "instagram" },
  ],
  features: { themeToggle: false, resume: false },
  nav: baseNav,
} as const;
