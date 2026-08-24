import { useEffect, useRef, useState, type ReactNode } from "react";
import { getMotionMode, type MotionMode } from "../../lib/motion-preferences";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Reveal({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<MotionMode>("static");

  useEffect(() => {
    const nextMode = getMotionMode({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
    });
    setMode(nextMode);
    if (nextMode === "static" || !ref.current || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      data-motion-mode={mode}
    >
      {children}
    </div>
  );
}
