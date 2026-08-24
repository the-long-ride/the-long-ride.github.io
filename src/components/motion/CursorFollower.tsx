import { useEffect, useRef, useState } from "react";
import { getMotionMode, type MotionMode } from "../../lib/motion-preferences";
import { followStep } from "../../lib/pointer-follow";

const INTERACTIVE = "a, button, summary, [data-cursor]";
const CARD = ".project-card-main";
const ROOT_VARS = ["--cursor-nx", "--cursor-ny"];

/**
 * Decorative desktop cursor companion: a trailing diamond plus a small
 * diamond dot, and root pointer variables for hero parallax.
 * The system cursor stays visible; this layer never takes pointer events.
 */
export default function CursorFollower() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<MotionMode>("static");

  useEffect(() => {
    const next = getMotionMode({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
    });
    setMode(next);
    if (next !== "full") return;

    const html = document.documentElement;
    html.dataset.cursor = "full";
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { ...target };
    let frame: number | null = null;

    const tick = () => {
      const step = followStep(ring, target, 0.18);
      ring.x = step.x;
      ring.y = step.y;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x.toFixed(1)}px, ${ring.y.toFixed(1)}px, 0)`;
      }
      frame = step.settled ? null : requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }
      const element = event.target instanceof Element ? event.target : null;
      const root = rootRef.current;
      root?.classList.add("is-active");
      root?.classList.toggle("is-hovering", Boolean(element?.closest(INTERACTIVE)));
      root?.classList.toggle("is-card", Boolean(element?.closest(CARD)));
      html.style.setProperty("--cursor-nx", (target.x / window.innerWidth - 0.5).toFixed(3));
      html.style.setProperty("--cursor-ny", (target.y / window.innerHeight - 0.5).toFixed(3));
      if (frame === null) frame = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      rootRef.current?.classList.remove("is-active", "is-hovering", "is-card");
    };
    const onDown = () => rootRef.current?.classList.add("is-pressed");
    const onUp = () => rootRef.current?.classList.remove("is-pressed");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("pointerleave", onLeave);
      if (frame !== null) cancelAnimationFrame(frame);
      ROOT_VARS.forEach((name) => html.style.removeProperty(name));
      delete html.dataset.cursor;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="cursor-follower"
      data-cursor-follower
      data-motion-mode={mode}
      aria-hidden="true"
    >
      <span ref={ringRef} className="cursor-ring">
        <span className="cursor-label">View</span>
      </span>
      <span ref={dotRef} className="cursor-dot" />
    </div>
  );
}
