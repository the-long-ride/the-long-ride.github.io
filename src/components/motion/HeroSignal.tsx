import { useEffect, useState } from "react";
import { formatSession } from "../../lib/hero-signal";
import { getMotionMode, type MotionMode } from "../../lib/motion-preferences";

export default function HeroSignal() {
  const [mode, setMode] = useState<MotionMode>("static");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const next = getMotionMode({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
    });
    setMode(next);
    if (next === "reduced") return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      setElapsed((performance.now() - started) / 1000);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hero-signal" data-motion-mode={mode} aria-hidden="true">
      <span className="hero-signal-prompt">&gt;</span>
      <span className="hero-signal-text">
        the-long-ride · status: building · session{" "}
        <span data-session>{formatSession(elapsed)}</span>
      </span>
      <span className="hero-signal-cursor"></span>
    </div>
  );
}
