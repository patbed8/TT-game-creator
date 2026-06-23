export type CardFace = 'face-up' | 'face-down';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank =
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  rank?: Rank;
  suit?: Suit;
  face: CardFace;
  x: number;
  y: number;
  value?: number;
  color?: string;
  label?: string;
  deckId?: string;   // source deck — routes played cards to the right discard pile
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
  x: number;
  y: number;
  size: number;
  color: string;
  content?: string;
}

// ── Phase 4: setup configuration ─────────────────────────────────────────────

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;

export interface Die {
  id: string;
  faces: DieSides;
  label: string;
  lastResult: number | null;
  x: number;
  y: number;
}

export interface DieConfig {
  sides: DieSides;
  label: string;   // one entry = one die (no count field)
}

export type BoardConfig =
  | { kind: 'none' }
  | { kind: 'grid'; cols: number; rows: number }
  | { kind: 'path'; length: number }
  | { kind: 'freeTiles' };

export type DeckSpec =
  | { kind: 'standard52'; label?: string }
  | { kind: 'numbered'; count: number; label?: string }
  | { kind: 'coloredSeries'; colors: string[]; perColor: number; label?: string };

export interface PawnConfig {
  color: string;
  count: number;
}

// ── Deck instance (runtime) ───────────────────────────────────────────────────

export interface DeckInstance {
  id: string;
  label: string;
  cards: Card[];     // remaining undrawn cards
  discard: Card[];   // played / discarded cards
}

export interface TableConfig {
  dice: DieConfig[];
  board: BoardConfig;
  decks: DeckSpec[];   // [] = no decks; supports multiple
  pawns: PawnConfig[];
  players: number;
}

// ── Phase 5: saved configurations ────────────────────────────────────────────

export interface SavedConfig {
  id: string;
  name: string;
  createdAt: string;   // ISO 8601 — never a Date object (localStorage is text-only)
  updatedAt: string;   // ISO 8601
  config: TableConfig;
}

export interface ConfigExport {
  app: 'tt-game-creator';
  schema: 1;
  exportedAt: string;  // ISO 8601
  configs: SavedConfig[];
}

// ── Game state ────────────────────────────────────────────────────────────────

export interface GameState {
  decks: DeckInstance[];
  players: Player[];
  activePlayerId: string;
  board: BoardLayout | null;
  pawns: Pawn[];
  dice: Die[];
  tiles: Tile[];
}
