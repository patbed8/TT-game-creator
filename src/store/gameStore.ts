import { create } from 'zustand';
import type {
  BoardLayout, BoardType, CellId, DeckInstance, Die, DieSides,
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
  rollSingleDie as engineRollSingleDie,
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

// Deck zone layout: deck stack (70) + gap (10) + discard (70) + gap between zones (20)
export const DECK_ZONE_WIDTH = 170;
const DECK_START_X = 30;

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
  // Phase 1 actions
  drawCard: (deckId: string) => void;
  playCard: (cardId: string) => void;
  flipCard: (cardId: string) => void;
  moveCard: (cardId: string, x: number, y: number) => void;
  endTurn: () => void;
  // Phase 2 actions
  movePawn: (pawnId: string, targetCellId: CellId) => void;
  rollDice: () => void;
  rollDie: (dieId: string) => void;
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
  decks: [],
  players: PLAYER_DEFS.map(p => ({ ...p, hand: [] })),
  activePlayerId: 'player1',
  board: null,
  pawns: [],
  dice: [],
  tiles: [],

  // ── Phase 1 actions ────────────────────────────────────────────────────────

  drawCard(deckId) {
    const state = get();
    const active = state.players.find(p => p.id === state.activePlayerId);
    if (!active) return;
    const x = HAND_MARGIN_X + active.hand.length * (CARD_W + CARD_GAP);
    const y = handY();
    set(s => drawCardFromDeck(s, deckId, x, y));
  },

  playCard(cardId) {
    const state = get();
    const card = state.players.find(p => p.id === state.activePlayerId)?.hand.find(c => c.id === cardId);
    if (!card) return;
    const deckIdx = state.decks.findIndex(d => d.id === card.deckId);
    const discardCount = deckIdx >= 0 ? state.decks[deckIdx].discard.length : 0;
    // Stack cards inside the deck's visual discard area (DeckZone: deck at 0, discard at CARD_W+10)
    const x = DECK_START_X + Math.max(0, deckIdx) * DECK_ZONE_WIDTH + CARD_W + 10 + discardCount * 3;
    const y = 60 + discardCount * 3;
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

  rollDie(dieId) {
    set(s => engineRollSingleDie(s, dieId));
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
      decks: [],
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

    // 1. Build deck instances — all cards start in the deck, players begin empty-handed
    const decks: DeckInstance[] = config.decks.map((spec, i) => {
      const raw = shuffleDeck(generateDeck(spec)).map(c => ({ ...c, deckId: `deck-${i}` }));
      return {
        id: `deck-${i}`,
        label: `Paquet ${i + 1} / Deck ${i + 1}`,
        cards: raw,
        discard: [],
      };
    });

    const players: Player[] = playerDefs.map(p => ({ ...p, hand: [] }));

    // 2. Create runtime board layout from setup config
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

    // 3. Create pawns
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

    // 4. Create dice — start after the last deck zone
    const dieStartX = decks.length > 0
      ? DECK_START_X + decks.length * DECK_ZONE_WIDTH + 20
      : DECK_START_X;
    let dieX = dieStartX;
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
      decks,
      players,
      activePlayerId: playerDefs[0].id,
      board,
      pawns,
      dice,
      tiles: [],
    });
  },
}));

export { createDeck, shuffleDeck };
