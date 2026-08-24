import { useEffect, useRef, useState } from "react";
import { getMotionMode, type MotionMode } from "../../lib/motion-preferences";

export default function AmbientField() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [mode, setMode] = useState<MotionMode>("static");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const resolveMode = () => {
      const next = getMotionMode({
        reducedMotion: reduced.matches,
        coarsePointer: coarse.matches || navigator.maxTouchPoints > 0,
      });
      setMode(next);
      return next;
    };

    let currentMode = resolveMode();
    const onPreferenceChange = () => {
      currentMode = resolveMode();
    };

    reduced.addEventListener("change", onPreferenceChange);
    coarse.addEventListener("change", onPreferenceChange);

    const onPointerMove = (event: PointerEvent) => {
      if (currentMode !== "full" || !fieldRef.current) return;
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        fieldRef.current?.style.setProperty("--pointer-x", `${(x * 100).toFixed(2)}%`);
        fieldRef.current?.style.setProperty("--pointer-y", `${(y * 100).toFixed(2)}%`);
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      reduced.removeEventListener("change", onPreferenceChange);
      coarse.removeEventListener("change", onPreferenceChange);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      className="ambient-field"
      data-motion-ambient
      data-motion-mode={mode}
      aria-hidden="true"
    >
      <span className="ambient-orbit ambient-orbit-a" />
      <span className="ambient-orbit ambient-orbit-b" />
    </div>
  );
}
