import type { Tile, TileShape } from '../types';

export function getNeighborSlots(tile: Tile): { x: number; y: number }[] {
  const { x, y, size } = tile;

  if (tile.shape === 'square') {
    const s = size;
    return [
      { x: x + s, y },
      { x: x - s, y },
      { x, y: y + s },
      { x, y: y - s },
    ];
  }

  // Flat-top hexagon, circumradius R = size.
  // All 6 neighbor centers are at distance √3·R from this tile's center.
  const R = size;
  const sq3R = Math.sqrt(3) * R;
  const hSq3R = sq3R / 2;

  return [
    { x,              y: y + sq3R  },
    { x,              y: y - sq3R  },
    { x: x + 1.5 * R, y: y + hSq3R },
    { x: x + 1.5 * R, y: y - hSq3R },
    { x: x - 1.5 * R, y: y + hSq3R },
    { x: x - 1.5 * R, y: y - hSq3R },
  ];
}

export function isSlotOpen(tiles: Tile[], x: number, y: number, epsilon: number): boolean {
  return !tiles.some(t => Math.hypot(t.x - x, t.y - y) < epsilon);
}

export function findSnapPosition(
  tiles: Tile[],
  shape: TileShape,
  x: number,
  y: number,
  size: number,
  threshold = 0.6 * size,
): { x: number; y: number } | null {
  const sameTiles = tiles.filter(t => t.shape === shape);
  if (sameTiles.length === 0) return null;

  const epsilon = 0.5 * size;
  const candidates = sameTiles.flatMap(t => getNeighborSlots(t));
  const open = candidates.filter(slot => isSlotOpen(tiles, slot.x, slot.y, epsilon));

  let best: { x: number; y: number } | null = null;
  let bestDist = threshold;

  for (const slot of open) {
    const d = Math.hypot(slot.x - x, slot.y - y);
    if (d < bestDist) {
      best = slot;
      bestDist = d;
    }
  }

  return best;
}
