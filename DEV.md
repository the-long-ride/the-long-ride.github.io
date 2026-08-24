# Portfolio Development Notes

## Purpose
- Continue building the Thế Long personal portfolio website.
- Keep public presentation human-friendly and technically credible.

## Current Branch
- Branch: `feat/portfolio-site`
- Workspace: `my-portfolio`

## Product Goal
- Build a minimalist cyberpunk/editorial software developer portfolio.
- Attract both technical and non-technical visitors.
- Communicate: passionate, driven, friendly, builds thoughtful useful software.

## Design Constraints
- Single fixed theme.
- No light/dark mode toggle.
- Neutral color palette.
- Subtle cyberpunk influence.
- Mouse-follow animation allowed.
- Respect reduced-motion preferences.
- Avoid heavy WebGL/Three.js dependencies.

## Content Rules
- Never invent resume facts.
- Never invent employment history.
- Never invent metrics.
- Released projects:
  - Engram
  - Aevra
  - Markdown Explorer
  - QuotaShift
  - Markdown Them
- Lab projects:
  - Voxveil
  - Know Your Project
- Lab projects must not be presented as released.

## Architecture Direction
- Astro + TypeScript.
- Static generation.
- MDX/content collections.
- React islands only where interaction requires it.
- GitHub Pages deployment target.

## Resume Decision
- Resume UI and PDF generation should share one data source.
- Resume remains hidden until factual resume content is provided.

## Metadata Decision
- GitHub metadata should be build-time generated.
- Browser should not depend on GitHub API.
- Keep fallback snapshot for build reliability.

## Remaining Work
- Deployment (plan Task 12) is deferred: no push, no deploy until the user says so.
- Waiting on user facts: resume data, project screenshots, first Writing post.

## Folder Structure
```
src/
  components/
    about/        About-only pieces (portrait slot)
    head/         document <head> concerns: Seo, GoatCounter
    home/         homepage sections
    motion/       React islands (AmbientField, CursorFollower, MagneticLink, Reveal)
    navigation/   Header, MobileNav, Footer
    projects/     project/Lab cards, meta, status badge
    resume/       gated resume views
    ui/           small shared primitives
    writing/      article list
  config/         siteConfig and navigation
  content/        MDX collections: projects, lab, writing
  data/           typed data + GitHub metadata snapshot
  layouts/        BaseLayout, ContentLayout
  lib/            pure logic, unit tested
  pages/          routes
  styles/
    global.css    entry; import order is significant
    foundation/   tokens, base, motion, typography (loaded last)
    layout/       site chrome
    sections/     page/feature styles
scripts/          build-time scripts; scripts/lib holds tested helpers
tests/unit, tests/e2e
```

## Typography (2026-09-29)
- Headings, nav, buttons, project monograms: Orbitron (Google Fonts CDN).
- Body and metadata: JetBrains Mono (Google Fonts CDN).
- The name "Thế Long" keeps the original sans stack via `.name-type`; Orbitron has no Vietnamese diacritics.
- Font families live in `src/styles/foundation/tokens.css`; `typography.css` assigns them.

## Project Logos
- Featured cards render `logo` from frontmatter (`/projects/<slug>/logo.png|svg` in `public/`), copied from each app repo.
- `content:validate` fails if a featured project has no logo or the file is missing.

## Profile
- Email `thelong1406@gmail.com` and portrait (GitHub avatar URL) live in `siteConfig`.
- Portrait shows on About only; email on Contact and in the footer.

## Desktop Motion
- `CursorFollower` runs only in `full` motion mode (fine pointer, no reduced-motion).
- It sets `html[data-cursor="full"]` and `--cursor-nx/--cursor-ny` on the root.
- CSS in `foundation/motion.css` turns those into the diamond follower and hero/orbit parallax. Project logos have no pointer motion.
- `HeroGrid` draws the hero's 50px square grid on a canvas; hovered square darkens, neighbours less (`src/lib/hero-grid.ts`).
- The hero signal bar has one soft sweeping pulse in CSS (`home.css`, `signal-scan`), off under reduced motion. Hero copy and actions have no pointer parallax.
- System cursor is never hidden. Pure math lives in `src/lib/pointer-follow.ts`.

## Mobile Layout
- Phone rules sit in the `max-width: 760px` blocks at the end of `home.css`, `projects.css`, `secondary.css`.
- Tailwind preflight zeroes `p` margins, so copy blocks set their own paragraph spacing.

## Quality Gates
- `npm run lint` = Prettier check + LOC lint (`.ts`/`.tsx` <= 350 lines, measured after formatting).
- `npm run verify` runs lint first, then unit, content, astro check, build, resume PDF, Playwright.
