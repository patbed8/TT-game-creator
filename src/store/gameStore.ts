import { create } from 'zustand';
import type { BoardConfig, BoardType, CellId, GameState, Pawn, Player } from '../types';
import { createDeck, shuffleDeck } from '../engine/deckUtils';
import { createGridBoard, createPathBoard } from '../data/boards';
import {
  dealInitialHands,
  drawCardFromDeck,
  playCardToShared,
  flipCardById,
  moveCardById,
  advanceToNextPlayer,
  movePawn as engineMovePawn,
  rollDice as engineRollDice,
} from '../engine/gameEngine';

// ── Layout constants ─────────────────────────────────────────────────────────

const CARD_W = 70;
const CARD_H = 100;
const CARD_GAP = 8;
const HAND_MARGIN_X = 20;

const GRID_CELL_SIZE = 50;
const PATH_CELL_SIZE = 60;
const PATH_PER_ROW = 5;
const BOARD_TOP_Y = 200; // vertical offset; shared zone ends around y=195

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

function makeBoardForType(type: BoardType): BoardConfig {
  const w = window.innerWidth;
  if (type === 'grid') {
    const boardW = 8 * GRID_CELL_SIZE;
    const originX = Math.max((w - boardW) / 2, 10);
    return createGridBoard(8, 8, GRID_CELL_SIZE, originX, BOARD_TOP_Y);
  }
  const boardW = PATH_PER_ROW * PATH_CELL_SIZE;
  const originX = Math.max((w - boardW) / 2, 10);
  return createPathBoard(20, PATH_CELL_SIZE, originX, BOARD_TOP_Y);
}

function makeInitialPawns(board: BoardConfig): Pawn[] {
  const start = board.cells[0];
  // Offset the two pawns slightly so both are visible on the starting cell
  return [
    { id: 'pawn-p1', playerId: 'player1', cellId: start.id, x: start.x - 8, y: start.y - 8, color: '#e74c3c' },
    { id: 'pawn-p2', playerId: 'player2', cellId: start.id, x: start.x + 8, y: start.y + 8, color: '#3498db' },
  ];
}

// ── Store type ───────────────────────────────────────────────────────────────

interface GameStore extends GameState {
  // Phase 1 actions
  initGame: () => void;
  drawCard: () => void;
  playCard: (cardId: string) => void;
  flipCard: (cardId: string) => void;
  moveCard: (cardId: string, x: number, y: number) => void;
  endTurn: () => void;
  // Phase 2 actions
  movePawn: (pawnId: string, targetCellId: CellId) => void;
  rollDice: () => void;
  toggleBoardType: () => void;
}

// ── Initial state ────────────────────────────────────────────────────────────

const initialBoard = makeBoardForType('grid');

// ── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  // Phase 1 state
  deck: [],
  discard: [],
  players: PLAYER_DEFS.map(p => ({ ...p, hand: [] })),
  activePlayerId: 'player1',
  // Phase 2 state
  board: initialBoard,
  pawns: makeInitialPawns(initialBoard),
  dice: { faces: 6, lastResult: null },

  // ── Phase 1 actions ────────────────────────────────────────────────────────

  initGame() {
    const shuffled = shuffleDeck(createDeck());
    const { deck, players: dealtPlayers } = dealInitialHands(
      shuffled,
      PLAYER_DEFS.map(p => p.id),
    );

    const y = handY();
    const players: Player[] = dealtPlayers.map((p, pi) => ({
      ...p,
      name: PLAYER_DEFS[pi].name,
      hand: p.hand.map((card, ci) => ({
        ...card,
        x: HAND_MARGIN_X + ci * (CARD_W + CARD_GAP),
        y,
      })),
    }));

    set({ deck, discard: [], players, activePlayerId: 'player1' });
  },

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
}));
