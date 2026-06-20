import { create } from 'zustand';
import type {
  BoardLayout, BoardType, CellId, Die, DieSides,
  GameState, Pawn, Player, TableConfig, TileShape,
} from '../types';
import { createDeck, shuffleDeck } from '../engine/deckUtils';
import { createGridBoard, createPathBoard } from '../data/boards';
import { generateDeck } from '../engine/deckGenerator';
import {
  drawCardFromDeck,
  playCardToShared,
  flipCardById,
  moveCardById,
  advanceToNextPlayer,
  movePawn as engineMovePawn,
  rollDice as engineRollDice,
  addTile as engineAddTile,
  moveTile as engineMoveTile,
  removeTile as engineRemoveTile,
} from '../engine/gameEngine';

// ── Layout constants ─────────────────────────────────────────────────────────

const CARD_W = 70;
const CARD_H = 100;
const CARD_GAP = 8;
const HAND_MARGIN_X = 20;

const GRID_CELL_SIZE = 50;
const PATH_CELL_SIZE = 60;
const BOARD_TOP_Y = 200;

const DIE_START_X = 150;
const DIE_SPACING = 70;
const DIE_Y = 60;

const PLAYER_DEFS: Array<{ id: string; name: string }> = [
  { id: 'player1', name: 'Joueur 1 / Player 1' },
  { id: 'player2', name: 'Joueur 2 / Player 2' },
];

// ── Layout helpers ───────────────────────────────────────────────────────────

function handY(): number {
  return window.innerHeight - CARD_H - 40;
}

function sharedZonePos(offset: number): { x: number; y: number } {
  return {
    x: window.innerWidth / 2 - CARD_W / 2 + offset * 6,
    y: 70 + offset * 6,
  };
}

function makeBoardForType(type: BoardType): BoardLayout {
  const w = window.innerWidth;
  if (type === 'grid') {
    const boardW = 8 * GRID_CELL_SIZE;
    const originX = Math.max((w - boardW) / 2, 10);
    return createGridBoard(8, 8, GRID_CELL_SIZE, originX, BOARD_TOP_Y);
  }
  const perRow = 5;
  const boardW = perRow * PATH_CELL_SIZE;
  const originX = Math.max((w - boardW) / 2, 10);
  return createPathBoard(20, PATH_CELL_SIZE, originX, BOARD_TOP_Y);
}

function makeInitialPawns(board: BoardLayout): Pawn[] {
  const start = board.cells[0];
  return [
    { id: 'pawn-p1', playerId: 'player1', cellId: start.id, x: start.x - 8, y: start.y - 8, color: '#e74c3c' },
    { id: 'pawn-p2', playerId: 'player2', cellId: start.id, x: start.x + 8, y: start.y + 8, color: '#3498db' },
  ];
}

// ── Store type ───────────────────────────────────────────────────────────────

interface GameStore extends GameState {
  screen: 'setup' | 'table';
  hasDeck: boolean;
  // Phase 1 actions
  drawCard: () => void;
  playCard: (cardId: string) => void;
  flipCard: (cardId: string) => void;
  moveCard: (cardId: string, x: number, y: number) => void;
  endTurn: () => void;
  // Phase 2 actions
  movePawn: (pawnId: string, targetCellId: CellId) => void;
  rollDice: () => void;
  toggleBoardType: () => void;
  // Phase 3 actions
  addTile: (shape: TileShape, color: string, x: number, y: number, size: number) => void;
  moveTile: (tileId: string, x: number, y: number) => void;
  removeTile: (tileId: string) => void;
  // Phase 4 actions
  buildInitialState: (config: TableConfig) => void;
  goToTable: () => void;
  goToSetup: () => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  // ── Initial state (empty — populated by buildInitialState) ─────────────────
  screen: 'setup',
  hasDeck: false,
  deck: [],
  discard: [],
  players: PLAYER_DEFS.map(p => ({ ...p, hand: [] })),
  activePlayerId: 'player1',
  board: null,
  pawns: [],
  dice: [],
  tiles: [],

  // ── Phase 1 actions ────────────────────────────────────────────────────────

  drawCard() {
    const state = get();
    if (state.deck.length === 0) return;
    const active = state.players.find(p => p.id === state.activePlayerId);
    if (!active) return;
    const x = HAND_MARGIN_X + active.hand.length * (CARD_W + CARD_GAP);
    const y = handY();
    set(s => drawCardFromDeck(s, x, y));
  },

  playCard(cardId) {
    const { x, y } = sharedZonePos(get().discard.length);
    set(s => playCardToShared(s, cardId, x, y));
  },

  flipCard(cardId) {
    set(s => flipCardById(s, cardId));
  },

  moveCard(cardId, x, y) {
    set(s => moveCardById(s, cardId, x, y));
  },

  endTurn() {
    set(s => advanceToNextPlayer(s));
  },

  // ── Phase 2 actions ────────────────────────────────────────────────────────

  movePawn(pawnId, targetCellId) {
    set(s => engineMovePawn(s, pawnId, targetCellId));
  },

  rollDice() {
    set(s => engineRollDice(s));
  },

  toggleBoardType() {
    const currentType = get().board?.type ?? 'grid';
    const newType: BoardType = currentType === 'grid' ? 'path' : 'grid';
    const newBoard = makeBoardForType(newType);
    set({ board: newBoard, pawns: makeInitialPawns(newBoard) });
  },

  // ── Phase 3 actions ────────────────────────────────────────────────────────

  addTile(shape, color, x, y, size) {
    set(s => engineAddTile(s, shape, color, x, y, size));
  },

  moveTile(tileId, x, y) {
    set(s => engineMoveTile(s, tileId, x, y));
  },

  removeTile(tileId) {
    set(s => engineRemoveTile(s, tileId));
  },

  // ── Phase 4 actions ────────────────────────────────────────────────────────

  goToTable() {
    set({ screen: 'table' });
  },

  goToSetup() {
    set({
      screen: 'setup',
      hasDeck: false,
      deck: [],
      discard: [],
      players: PLAYER_DEFS.map(p => ({ ...p, hand: [] })),
      activePlayerId: 'player1',
      board: null,
      pawns: [],
      dice: [],
      tiles: [],
    });
  },

  buildInitialState(config: TableConfig) {
    const w = window.innerWidth;
    const playerDefs = PLAYER_DEFS.slice(0, config.players);

    // 1. Generate and shuffle deck
    const rawCards = config.deck ? shuffleDeck(generateDeck(config.deck)) : [];

    // 2. All cards start in the deck; players begin with empty hands
    const remainingDeck = rawCards;
    const players: Player[] = playerDefs.map(p => ({ ...p, hand: [] }));

    // 3. Create runtime board layout from setup config
    let board: BoardLayout | null = null;
    const bc = config.board;
    if (bc.kind === 'grid') {
      const boardW = bc.cols * GRID_CELL_SIZE;
      const originX = Math.max((w - boardW) / 2, 10);
      board = createGridBoard(bc.rows, bc.cols, GRID_CELL_SIZE, originX, BOARD_TOP_Y);
    } else if (bc.kind === 'path') {
      const perRow = Math.ceil(Math.sqrt(bc.length));
      const boardW = perRow * PATH_CELL_SIZE;
      const originX = Math.max((w - boardW) / 2, 10);
      board = createPathBoard(bc.length, PATH_CELL_SIZE, originX, BOARD_TOP_Y);
    }
    // 'none' and 'freeTiles' → board remains null

    // 4. Create pawns
    const startCell = board?.cells[0];
    let pawnIdx = 0;
    const pawns: Pawn[] = config.pawns.flatMap(pc =>
      Array.from({ length: pc.count }, (_, i) => {
        const offset = pawnIdx++ * 12;
        return {
          id: `pawn-${pc.color}-${i}`,
          playerId: '',
          cellId: startCell?.id ?? null,
          x: (startCell?.x ?? 200) + offset,
          y: (startCell?.y ?? 200) + offset,
          color: pc.color,
        };
      }),
    );

    // 5. Create dice — lay out horizontally from DIE_START_X
    let dieX = DIE_START_X;
    const dice: Die[] = config.dice.flatMap(dc =>
      Array.from({ length: dc.count }, () => {
        const x = dieX;
        dieX += DIE_SPACING;
        return {
          id: `die-${dc.sides}-${Math.random().toString(36).slice(2, 7)}`,
          faces: dc.sides as DieSides,
          lastResult: null,
          x,
          y: DIE_Y,
        };
      }),
    );

    set({
      screen: 'table',
      hasDeck: rawCards.length > 0,
      deck: remainingDeck,
      discard: [],
      players,
      activePlayerId: playerDefs[0].id,
      board,
      pawns,
      dice,
      tiles: [],
    });
  },
}));

// Legacy helper kept for internal use by toggleBoardType
export { createDeck, shuffleDeck };
