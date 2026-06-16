import { create } from 'zustand';
import type { GameState, Player } from '../types';
import { createDeck, shuffleDeck } from '../engine/deckUtils';
import {
  dealInitialHands,
  drawCardFromDeck,
  playCardToShared,
  flipCardById,
  moveCardById,
  advanceToNextPlayer,
} from '../engine/gameEngine';

const CARD_W = 70;
const CARD_H = 100;
const CARD_GAP = 8;
const HAND_MARGIN_X = 20;

const PLAYER_DEFS: Array<{ id: string; name: string }> = [
  { id: 'player1', name: 'Joueur 1 / Player 1' },
  { id: 'player2', name: 'Joueur 2 / Player 2' },
];

function handY(): number {
  return window.innerHeight - CARD_H - 40;
}

function sharedZonePos(offset: number): { x: number; y: number } {
  return {
    x: window.innerWidth / 2 - CARD_W / 2 + offset * 6,
    y: 70 + offset * 6,
  };
}

interface GameStore extends GameState {
  initGame: () => void;
  drawCard: () => void;
  playCard: (cardId: string) => void;
  flipCard: (cardId: string) => void;
  moveCard: (cardId: string, x: number, y: number) => void;
  endTurn: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  deck: [],
  discard: [],
  players: PLAYER_DEFS.map(p => ({ ...p, hand: [] })),
  activePlayerId: 'player1',

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
}));
