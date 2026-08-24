import { useEffect, useState } from "react";
import { getMotionMode, type MotionMode } from "../../lib/motion-preferences";

type Props = {
  href: string;
  label: string;
  className?: string;
  ariaLabel?: string;
};

export default function MagneticLink({ href, label, className = "", ariaLabel }: Props) {
  const [mode, setMode] = useState<MotionMode>("static");

  useEffect(() => {
    setMode(
      getMotionMode({
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        coarsePointer:
          window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
      }),
    );
  }, []);

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`magnetic-link ${className}`.trim()}
      data-motion-mode={mode}
    >
      <span>{label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
