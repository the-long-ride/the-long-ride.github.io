import { useEffect, useRef } from "react";
import { getMotionMode } from "../../lib/motion-preferences";

export default function ScrollEnhancer() {
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const resolveMode = () =>
      getMotionMode({
        reducedMotion: reduced.matches,
        coarsePointer: coarse.matches || navigator.maxTouchPoints > 0,
      });

    const motionMode = resolveMode();
    const isReduced = motionMode === "reduced" || motionMode === "static";

    const header = document.querySelector<HTMLElement>(".site-header");

    const updateScrollMetrics = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollY / scrollHeight)) : 0;

      document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));

      if (header) {
        if (scrollY > 16) {
          header.classList.add("is-scrolled");
        } else {
          header.classList.remove("is-scrolled");
        }
      }
    };

    const onScroll = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(updateScrollMetrics);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollMetrics();

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "section, article.case-study, .content-page, .home-section, .about-grid > article, .project-card, .small-projects-section, .contributions-section",
      ),
    );

    if (isReduced || !("IntersectionObserver" in window)) {
      targets.forEach((el) => {
        el.classList.add("is-revealed");
        el.setAttribute("data-in-view", "true");
      });
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      };
    }

    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add("is-revealed");
        el.setAttribute("data-in-view", "true");
      } else {
        el.classList.add("scroll-revealed-element");
      }

      const children = Array.from(el.children).filter(
        (c) => c.tagName === "DIV" || c.tagName === "ARTICLE" || c.tagName === "LI",
      );
      children.forEach((child, idx) => {
        (child as HTMLElement).style.setProperty("--stagger", String(idx));
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.classList.add("is-revealed");
            target.setAttribute("data-in-view", "true");

            const ratio = entry.intersectionRatio;
            if (
              ratio > 0.3 ||
              (ratio > 0.1 && entry.boundingClientRect.top < window.innerHeight * 0.5)
            ) {
              targets.forEach((t) => t.removeAttribute("data-section-active"));
              target.setAttribute("data-section-active", "true");
            }
          }
        });
      },
      {
        threshold: [0.1, 0.35, 0.6],
        rootMargin: "0px 0px -8% 0px",
      },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, []);

  return <span className="scroll-enhancer" style={{ display: "none" }} aria-hidden="true" />;
}
