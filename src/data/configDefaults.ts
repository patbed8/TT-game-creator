import type { TableConfig } from '../types';

export const PAWN_COLORS = [
  '#e74c3c', // red
  '#3498db', // blue
  '#27ae60', // green
  '#f39c12', // yellow
  '#9b59b6', // purple
  '#1abc9c', // teal
];

export const SERIES_COLORS = [
  '#e74c3c',
  '#3498db',
  '#27ae60',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#2c3e50',
];

export const DEFAULT_TABLE_CONFIG: TableConfig = {
  dice: [{ sides: 6, count: 1 }],
  board: { kind: 'grid', cols: 8, rows: 8 },
  decks: [{ kind: 'standard52' }],
  pawns: [
    { color: '#e74c3c', count: 1 },
    { color: '#3498db', count: 1 },
  ],
  players: 2,
};
