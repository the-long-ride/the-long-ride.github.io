export interface NodePoint {
  id: number;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isAnchor: boolean;
  energy: number; // 0 (calm) to 1 (excited / illuminated)
}

export interface ConstellationConfig {
  gridSpacing: number;
  connectDistance: number;
  cursorRadius: number;
  magneticForce: number;
  springConstant: number;
  damping: number;
  maxSpeed: number;
}

export const DEFAULT_CONSTELLATION_CONFIG: ConstellationConfig = {
  gridSpacing: 74,
  connectDistance: 105,
  cursorRadius: 180,
  magneticForce: 0.02, // Gentle, slow attraction
  springConstant: 0.014, // Relaxed, slow restoring pull
  damping: 0.86, // Smooth non-oscillating settling
  maxSpeed: 1.4, // Strict slow speed cap for serene, graceful motion
};

/**
 * Deterministic pseudo-random number generator for stable node placement across renders.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9999.123) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates an interconnected mesh of nodes with deterministic jitter.
 */
export function generateNodes(
  width: number,
  height: number,
  config: ConstellationConfig = DEFAULT_CONSTELLATION_CONFIG,
): NodePoint[] {
  const nodes: NodePoint[] = [];
  const spacing = config.gridSpacing;
  const cols = Math.ceil(width / spacing) + 1;
  const rows = Math.ceil(height / spacing) + 1;
  let id = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = r * 100 + c + 1;
      // Stagger odd rows for a hexagonal/cybernetic feel
      const offsetX = (r % 2) * (spacing * 0.45);
      const jitterX = (pseudoRandom(seed) - 0.5) * (spacing * 0.38);
      const jitterY = (pseudoRandom(seed + 42) - 0.5) * (spacing * 0.38);

      const homeX = Math.round(c * spacing + offsetX + jitterX);
      const homeY = Math.round(r * spacing + jitterY);
      const isAnchor = id % 7 === 0;

      nodes.push({
        id,
        homeX,
        homeY,
        x: homeX,
        y: homeY,
        vx: 0,
        vy: 0,
        radius: isAnchor ? 2.5 : 1.6,
        isAnchor,
        energy: 0,
      });
      id++;
    }
  }

  return nodes;
}

/**
 * Updates node physics with smooth cubic falloff, non-oscillating spring return, and slow ambient drift.
 */
export function updateNodes(
  nodes: NodePoint[],
  cursor: { x: number; y: number } | null,
  config: ConstellationConfig = DEFAULT_CONSTELLATION_CONFIG,
  time: number = 0,
): void {
  for (const node of nodes) {
    // 1. Magnetic pull toward cursor with cubic smoothstep falloff
    if (cursor) {
      const dx = cursor.x - node.x;
      const dy = cursor.y - node.y;
      const dist = Math.hypot(dx, dy);

      if (dist < config.cursorRadius && dist > 1) {
        const norm = dist / config.cursorRadius;
        // Cubic Hermite smoothstep for C1-continuous force transition
        const smoothFalloff = (1 - norm) * (1 - norm) * (3 - 2 * (1 - norm));
        const force = smoothFalloff * config.magneticForce;
        node.vx += dx * force;
        node.vy += dy * force;
        node.energy = Math.max(node.energy, smoothFalloff);
      }
    }

    // 2. Slow, graceful spring return with serene micro-amplitude ambient drift
    const ambientX = time > 0 ? Math.sin(time * 0.00025 + node.id * 0.7) * 0.9 : 0;
    const ambientY = time > 0 ? Math.cos(time * 0.0002 + node.id * 0.5) * 0.9 : 0;
    const targetX = node.homeX + ambientX;
    const targetY = node.homeY + ambientY;

    const springDx = targetX - node.x;
    const springDy = targetY - node.y;
    node.vx += springDx * config.springConstant;
    node.vy += springDy * config.springConstant;

    // 3. Friction damping
    node.vx *= config.damping;
    node.vy *= config.damping;

    // 4. Low maximum speed cap (prevents rapid movement)
    const speed = Math.hypot(node.vx, node.vy);
    if (speed > config.maxSpeed) {
      const scale = config.maxSpeed / speed;
      node.vx *= scale;
      node.vy *= scale;
    }

    // 5. Position update
    node.x += node.vx;
    node.y += node.vy;

    // 6. Smooth energy decay
    node.energy *= 0.96;
    if (node.energy < 0.005) {
      node.energy = 0;
    }
  }
}

export interface ConnectionLink {
  from: NodePoint;
  to: NodePoint;
  dist: number;
  energy: number;
}

/**
 * Finds all active link connections between nodes within connectDistance.
 */
export function findConnections(
  nodes: NodePoint[],
  maxDist: number = DEFAULT_CONSTELLATION_CONFIG.connectDistance,
): ConnectionLink[] {
  const links: ConnectionLink[] = [];
  const len = nodes.length;

  for (let i = 0; i < len; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < len; j++) {
      const b = nodes[j];
      if (Math.abs(a.x - b.x) > maxDist || Math.abs(a.y - b.y) > maxDist) {
        continue;
      }

      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < maxDist) {
        const energy = Math.max(a.energy, b.energy);
        links.push({ from: a, to: b, dist, energy });
      }
    }
  }

  return links;
}

/**
 * Returns canvas stroke styling and line width based on link distance and excitation energy.
 */
export function getLinkStyle(
  dist: number,
  maxDist: number,
  energy: number,
): { strokeStyle: string; lineWidth: number } {
  const proximity = Math.max(0, 1 - dist / maxDist);
  const baseAlpha = 0.035 + proximity * 0.14;
  const isExcited = energy > 0.3;

  if (isExcited) {
    const amberAlpha = Math.min(0.8, baseAlpha + energy * 0.45);
    return {
      strokeStyle: `rgba(224, 90, 0, ${amberAlpha.toFixed(3)})`,
      lineWidth: 1 + energy * 0.8,
    };
  }

  const inkAlpha = Math.min(0.32, baseAlpha + energy * 0.18);
  return {
    strokeStyle: `rgba(23, 23, 22, ${inkAlpha.toFixed(3)})`,
    lineWidth: 0.8 + proximity * 0.4,
  };
}
