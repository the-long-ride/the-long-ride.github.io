import { useEffect, useRef, useState } from "react";
import { getMotionMode, type MotionMode } from "../../lib/motion-preferences";
import {
  generateNodes,
  updateNodes,
  findConnections,
  getLinkStyle,
  DEFAULT_CONSTELLATION_CONFIG,
  type NodePoint,
} from "../../lib/hero-constellation";

/**
 * Full-bleed interactive constellation backdrop for the site footer,
 * echoing the hero section's kinetic cybernetic mesh.
 * Pauses when scrolled out of view for zero CPU overhead.
 */
export default function FooterMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<MotionMode>("static");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const currentMode = getMotionMode({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
    });
    setMode(currentMode);

    let width = 0;
    let height = 0;
    let frameId: number | null = null;
    let isIntersecting = true;
    let nodes: NodePoint[] = [];

    const targetCursor = {
      x: -9999,
      y: -9999,
      active: false,
    };

    const smoothCursor = {
      x: -9999,
      y: -9999,
      active: false,
    };

    const drawMesh = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connecting vector data links
      const links = findConnections(nodes, DEFAULT_CONSTELLATION_CONFIG.connectDistance);
      for (const link of links) {
        const { strokeStyle, lineWidth } = getLinkStyle(
          link.dist,
          DEFAULT_CONSTELLATION_CONFIG.connectDistance,
          link.energy,
        );
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(link.from.x, link.from.y);
        ctx.lineTo(link.to.x, link.to.y);
        ctx.stroke();
      }

      // 2. Draw nodes
      for (const node of nodes) {
        const isExcited = node.energy > 0.2;
        const fillAlpha = isExcited ? 0.85 : node.isAnchor ? 0.45 : 0.22;
        const color = isExcited
          ? `rgba(224, 90, 0, ${fillAlpha})`
          : `rgba(23, 23, 22, ${fillAlpha})`;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + node.energy * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Technical crosshair marks on anchor nodes
        if (node.isAnchor) {
          ctx.strokeStyle = isExcited ? "rgba(224, 90, 0, 0.45)" : "rgba(23, 23, 22, 0.16)";
          ctx.lineWidth = 1;
          const arm = 4;
          ctx.beginPath();
          ctx.moveTo(node.x - arm, node.y);
          ctx.lineTo(node.x + arm, node.y);
          ctx.moveTo(node.x, node.y - arm);
          ctx.lineTo(node.x, node.y + arm);
          ctx.stroke();
        }
      }
    };

    const tick = (now: number) => {
      if (!isIntersecting) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      // Smooth cursor interpolation
      if (targetCursor.active) {
        if (!smoothCursor.active) {
          smoothCursor.x = targetCursor.x;
          smoothCursor.y = targetCursor.y;
          smoothCursor.active = true;
        } else {
          smoothCursor.x += (targetCursor.x - smoothCursor.x) * 0.04;
          smoothCursor.y += (targetCursor.y - smoothCursor.y) * 0.04;
        }
      } else {
        smoothCursor.active = false;
      }

      const activeCursor = smoothCursor.active ? { x: smoothCursor.x, y: smoothCursor.y } : null;
      updateNodes(nodes, activeCursor, DEFAULT_CONSTELLATION_CONFIG, now);
      drawMesh();
      frameId = requestAnimationFrame(tick);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      nodes = generateNodes(width, height, DEFAULT_CONSTELLATION_CONFIG);

      if (currentMode !== "full") {
        drawMesh();
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if (inside) {
        targetCursor.x = x;
        targetCursor.y = y;
        targetCursor.active = true;
        canvas.dataset.activeCursor = `${Math.round(x)},${Math.round(y)}`;
      } else {
        targetCursor.active = false;
        delete canvas.dataset.activeCursor;
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    // IntersectionObserver to pause loop when scrolled out of view
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            isIntersecting = entry.isIntersecting;
          }
        },
        { threshold: 0.05 },
      );
      intersectionObserver.observe(canvas);
    }

    if (currentMode === "full") {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      frameId = requestAnimationFrame(tick);
    } else {
      drawMesh();
    }

    return () => {
      resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (currentMode === "full") {
        window.removeEventListener("pointermove", onPointerMove);
      }
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="footer-grid-canvas"
      data-footer-grid
      data-motion-mode={mode}
      aria-hidden="true"
    />
  );
}
