import { describe, expect, it } from "vitest";
import {
  generateNodes,
  updateNodes,
  findConnections,
  getLinkStyle,
  DEFAULT_CONSTELLATION_CONFIG,
} from "../../src/lib/hero-constellation";

describe("hero-constellation node generation and physics", () => {
  const width = 800;
  const height = 600;

  it("generates deterministic nodes spanning the container dimensions", () => {
    const nodes = generateNodes(width, height);
    expect(nodes.length).toBeGreaterThan(40);

    const first = nodes[0];
    expect(first.homeX).toBeDefined();
    expect(first.homeY).toBeDefined();
    expect(first.x).toBe(first.homeX);
    expect(first.y).toBe(first.homeY);

    // Anchor nodes exist at intervals
    const anchors = nodes.filter((n) => n.isAnchor);
    expect(anchors.length).toBeGreaterThan(0);
    expect(anchors[0].radius).toBeGreaterThan(nodes[1].radius);
  });

  it("attracts nodes toward the cursor when inside magnetic radius", () => {
    const nodes = generateNodes(width, height);
    const target = nodes[10];
    const initialX = target.x;
    const initialY = target.y;

    // Place cursor offset near target
    const cursor = { x: initialX + 40, y: initialY + 40 };
    updateNodes(nodes, cursor);

    expect(target.x).toBeGreaterThan(initialX);
    expect(target.y).toBeGreaterThan(initialY);
    expect(target.energy).toBeGreaterThan(0);
  });

  it("springs nodes back toward their home anchor when cursor moves away", () => {
    const nodes = generateNodes(width, height);
    const target = nodes[10];
    const homeX = target.homeX;
    const homeY = target.homeY;

    // Displace node manually
    target.x = homeX + 50;
    target.y = homeY + 50;

    // Run physics without cursor
    for (let step = 0; step < 40; step++) {
      updateNodes(nodes, null);
    }

    // Node should move significantly closer to home
    expect(Math.abs(target.x - homeX)).toBeLessThan(25);
    expect(Math.abs(target.y - homeY)).toBeLessThan(25);
  });

  it("applies smooth ambient breathing drift when time progresses", () => {
    const nodes = generateNodes(width, height);
    const target = nodes[5];

    // Run update with time > 0
    updateNodes(nodes, null, DEFAULT_CONSTELLATION_CONFIG, 1000);
    expect(target.vx).not.toBe(0);
  });

  it("finds connections between nodes within connectDistance", () => {
    const nodes = generateNodes(width, height);
    const links = findConnections(nodes, DEFAULT_CONSTELLATION_CONFIG.connectDistance);

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.dist).toBeLessThanOrEqual(DEFAULT_CONSTELLATION_CONFIG.connectDistance);
    }
  });

  it("styles links with amber accent when energy is elevated", () => {
    const calm = getLinkStyle(50, 100, 0);
    expect(calm.strokeStyle).toContain("23, 23, 22");

    const excited = getLinkStyle(50, 100, 0.8);
    expect(excited.strokeStyle).toContain("224, 90, 0");
    expect(excited.lineWidth).toBeGreaterThan(calm.lineWidth);
  });
});
