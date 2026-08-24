import { useEffect, useRef, useState } from "react";
import { getMotionMode, type MotionMode } from "../../lib/motion-preferences";
import { CELL_SIZE, cellAt, decayHeat, heatKernel } from "../../lib/hero-grid";

const LINE = "rgba(23, 23, 22, 0.07)";
const MAX_SHADE = 0.14;

/**
 * Hero backdrop of 50px squares. With a fine pointer and full motion, the
 * square under the cursor darkens, its neighbours darken a little, and the
 * trail fades out. Other visitors get the static grid only.
 */
export default function HeroGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<MotionMode>("static");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const current = getMotionMode({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
    });
    setMode(current);

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let heat = new Float32Array(0);
    let hovered: { col: number; row: number } | null = null;
    let frame: number | null = null;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < heat.length; i += 1) {
        if (heat[i] <= 0) continue;
        const col = i % cols;
        const row = Math.floor(i / cols);
        ctx.fillStyle = `rgba(23, 23, 22, ${(heat[i] * MAX_SHADE).toFixed(3)})`;
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0.5; x <= width; x += CELL_SIZE) (ctx.moveTo(x, 0), ctx.lineTo(x, height));
      for (let y = 0.5; y <= height; y += CELL_SIZE) (ctx.moveTo(0, y), ctx.lineTo(width, y));
      ctx.stroke();
    };

    const tick = () => {
      const active = decayHeat(heat, 0.9);
      if (hovered) {
        for (const cell of heatKernel(hovered.col, hovered.row, cols, rows)) {
          heat[cell.index] = Math.max(heat[cell.index], cell.value);
        }
      }
      draw();
      frame = active || hovered ? requestAnimationFrame(tick) : null;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      cols = Math.ceil(width / CELL_SIZE);
      rows = Math.ceil(height / CELL_SIZE);
      heat = new Float32Array(cols * rows);
      draw();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x < rect.width && y < rect.height;
      hovered = inside ? cellAt(x, y) : null;
      if (hovered) canvas.dataset.activeCell = `${hovered.col},${hovered.row}`;
      else delete canvas.dataset.activeCell;
      if (frame === null) frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    if (current === "full") window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-grid"
      data-hero-grid
      data-motion-mode={mode}
      aria-hidden="true"
    />
  );
}
