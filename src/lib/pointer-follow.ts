export type Point = { x: number; y: number };

/** Move `current` a fraction of the way to `target`; settle once the gap is sub-pixel. */
export function followStep(
  current: Point,
  target: Point,
  ease: number,
  epsilon = 0.1,
): Point & { settled: boolean } {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  if (Math.abs(dx) < epsilon && Math.abs(dy) < epsilon) {
    return { x: target.x, y: target.y, settled: true };
  }
  return { x: current.x + dx * ease, y: current.y + dy * ease, settled: false };
}
