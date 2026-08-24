export const CELL_SIZE = 50;

export type CellHeat = { index: number; value: number };

/** Grid cell under a point, in cell units. */
export function cellAt(x: number, y: number, size = CELL_SIZE) {
  return { col: Math.floor(x / size), row: Math.floor(y / size) };
}

/** Hovered cell at full strength, edge neighbours partial, corner neighbours faint. */
export function heatKernel(col: number, row: number, cols: number, rows: number): CellHeat[] {
  const out: CellHeat[] = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const c = col + dx;
      const r = row + dy;
      if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
      const distance = Math.abs(dx) + Math.abs(dy);
      const value = distance === 0 ? 1 : distance === 1 ? 0.45 : 0.22;
      out.push({ index: r * cols + c, value });
    }
  }
  return out;
}

/** Fade every cell in place; returns whether any cell is still lit. */
export function decayHeat(heat: Float32Array, factor: number, floor = 0.01): boolean {
  let active = false;
  for (let i = 0; i < heat.length; i += 1) {
    const next = heat[i] * factor;
    heat[i] = next < floor ? 0 : next;
    if (heat[i] > 0) active = true;
  }
  return active;
}
