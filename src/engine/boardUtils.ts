import type { BoardLayout, CellId } from '../types';

// Returns the id of the nearest cell to (x, y) if within one cellSize, else null.
export function findNearestCell(board: BoardLayout, x: number, y: number): CellId | null {
  let nearest: { id: CellId; dist: number } | null = null;

  for (const cell of board.cells) {
    const dist = Math.hypot(cell.x - x, cell.y - y);
    if (!nearest || dist < nearest.dist) {
      nearest = { id: cell.id, dist };
    }
  }

  if (!nearest || nearest.dist > board.cellSize) return null;
  return nearest.id;
}
