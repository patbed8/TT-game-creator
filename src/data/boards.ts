import type { BoardConfig, Cell } from '../types';

export function createGridBoard(
  rows = 8,
  cols = 8,
  cellSize = 50,
  originX = 0,
  originY = 0,
): BoardConfig {
  const cells: Cell[] = [];
  let n = 1;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        id: `cell-${n}`,
        x: originX + col * cellSize + cellSize / 2,
        y: originY + row * cellSize + cellSize / 2,
        label: String(n),
        color: (row + col) % 2 === 0 ? '#dbc9a0' : '#c8b38a',
      });
      n++;
    }
  }
  return { type: 'grid', cells, cellSize };
}

// Serpentine path: left-to-right on even rows, right-to-left on odd rows
export function createPathBoard(
  count = 20,
  cellSize = 60,
  originX = 0,
  originY = 0,
): BoardConfig {
  const perRow = Math.ceil(Math.sqrt(count));
  const cells: Cell[] = [];

  for (let n = 1; n <= count; n++) {
    const row = Math.floor((n - 1) / perRow);
    const posInRow = (n - 1) % perRow;
    const col = row % 2 === 0 ? posInRow : perRow - 1 - posInRow;
    cells.push({
      id: `cell-${n}`,
      x: originX + col * cellSize + cellSize / 2,
      y: originY + row * cellSize + cellSize / 2,
      label: String(n),
      color: n % 2 === 0 ? '#d0e8c0' : '#e8d5b0',
    });
  }

  return { type: 'path', cells, cellSize };
}
