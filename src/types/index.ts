export type CardFace = 'face-up' | 'face-down';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank =
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  rank?: Rank;       // defined for standard52; optional for other deck types
  suit?: Suit;
  face: CardFace;
  x: number;
  y: number;
  value?: number;    // for numbered / colored-series decks
  color?: string;    // card background accent color
  label?: string;    // override center display text if set
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
}

// ── Phase 2: board, pawns ─────────────────────────────────────────────────────

export type CellId = string;

export interface Cell {
  id: CellId;
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export type BoardType = 'grid' | 'path';

// Runtime board layout (renamed from BoardConfig to avoid collision with setup type)
export interface BoardLayout {
  type: BoardType;
  cells: Cell[];
  cellSize: number;
}

export interface Pawn {
  id: string;
  playerId: string;
  cellId: CellId | null;
  x: number;
  y: number;
  color: string;
}

// ── Phase 3: tiles ────────────────────────────────────────────────────────────

export type TileShape = 'square' | 'hexagon';

export interface Tile {
  id: string;
  shape: TileShape;
  x: number;          // canvas center position
  y: number;
  size: number;       // square: side length; hexagon: circumradius (center → vertex)
  color: string;
  content?: string;
}

// ── Phase 4: setup configuration ─────────────────────────────────────────────

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;

// Runtime die instance (replaces DiceState, now supports multiple dice)
export interface Die {
  id: string;
  faces: DieSides;
  lastResult: number | null;
  x: number;
  y: number;
}

export interface DieConfig {
  sides: DieSides;
  count: number;
}

// Setup-time board configuration (discriminated union)
export type BoardConfig =
  | { kind: 'none' }
  | { kind: 'grid'; cols: number; rows: number }
  | { kind: 'path'; length: number }
  | { kind: 'freeTiles' };

export type DeckSpec =
  | { kind: 'standard52' }
  | { kind: 'numbered'; count: number }
  | { kind: 'coloredSeries'; colors: string[]; perColor: number };

export interface PawnConfig {
  color: string;
  count: number;
}

export interface TableConfig {
  dice: DieConfig[];
  board: BoardConfig;
  deck: DeckSpec | null;
  pawns: PawnConfig[];
  players: number;       // fixed at 2 for Phase 4
}

// ── Game state ────────────────────────────────────────────────────────────────

export interface GameState {
  deck: Card[];
  discard: Card[];
  players: Player[];
  activePlayerId: string;
  board: BoardLayout | null;
  pawns: Pawn[];
  dice: Die[];
  tiles: Tile[];
}
