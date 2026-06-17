export type CardFace = 'face-up' | 'face-down';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank =
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
  face: CardFace;
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
}

// ── Phase 2: board, pawns, dice ──────────────────────────────────────────────

export type CellId = string;

export interface Cell {
  id: CellId;
  x: number;        // canvas center position
  y: number;
  label?: string;   // number or text displayed in the cell
  color?: string;
}

export type BoardType = 'grid' | 'path';

export interface BoardConfig {
  type: BoardType;
  cells: Cell[];
  cellSize: number;
}

export interface Pawn {
  id: string;
  playerId: string;
  cellId: CellId | null;   // current cell, null if off-board
  x: number;               // canvas position (follows cell, free during drag)
  y: number;
  color: string;
}

export interface DiceState {
  faces: number;           // default 6
  lastResult: number | null;
}

export interface GameState {
  deck: Card[];
  discard: Card[];
  players: Player[];
  activePlayerId: string;
  board: BoardConfig | null;
  pawns: Pawn[];
  dice: DiceState;
}
