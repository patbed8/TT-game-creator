import type { Card, CellId, DeckInstance, GameState, Player, Tile, TileShape } from '../types';
import { shuffleDeck } from './deckUtils';
import { findSnapPosition } from './tileUtils';

const INITIAL_HAND_SIZE = 5;

export interface DealResult {
  deck: Card[];
  players: Array<{ id: string; hand: Card[] }>;
}

export function dealInitialHands(deck: Card[], playerIds: string[]): DealResult {
  const remaining = [...deck];
  const players: Array<{ id: string; hand: Card[] }> = playerIds.map(id => ({ id, hand: [] }));
  for (let round = 0; round < INITIAL_HAND_SIZE; round++) {
    for (const player of players) {
      const card = remaining.shift();
      if (card) player.hand.push({ ...card, face: 'face-down' });
    }
  }
  return { deck: remaining, players };
}

// ── Deck / card actions ───────────────────────────────────────────────────────

export function drawCardFromDeck(
  state: GameState,
  deckId: string,
  targetX: number,
  targetY: number,
): Partial<GameState> {
  const deckIdx = state.decks.findIndex(d => d.id === deckId);
  if (deckIdx < 0) return {};

  let { cards, discard } = state.decks[deckIdx];

  // Auto-reshuffle discard back into deck when exhausted
  if (cards.length === 0) {
    if (discard.length === 0) return {};
    cards = shuffleDeck([...discard]).map(c => ({ ...c, face: 'face-down' as const }));
    discard = [];
  }

  const [drawn, ...remaining] = cards;
  const card: Card = { ...drawn, face: 'face-up', x: targetX, y: targetY };

  const players = state.players.map((p): Player =>
    p.id === state.activePlayerId ? { ...p, hand: [...p.hand, card] } : p,
  );

  const decks: DeckInstance[] = state.decks.map((d, i) =>
    i === deckIdx ? { ...d, cards: remaining, discard } : d,
  );

  return { decks, players };
}

export function playCardToShared(
  state: GameState,
  cardId: string,
  targetX: number,
  targetY: number,
): Partial<GameState> {
  let played: Card | undefined;

  const players = state.players.map((p): Player => {
    if (p.id !== state.activePlayerId) return p;
    const idx = p.hand.findIndex(c => c.id === cardId);
    if (idx === -1) return p;
    played = { ...p.hand[idx], face: 'face-up', x: targetX, y: targetY };
    return { ...p, hand: p.hand.filter(c => c.id !== cardId) };
  });

  if (!played) return {};

  const deckIdx = state.decks.findIndex(d => d.id === played!.deckId);
  const decks: DeckInstance[] = state.decks.map((d, i) =>
    i === deckIdx ? { ...d, discard: [...d.discard, played!] } : d,
  );

  return { players, decks };
}

export function flipCardById(state: GameState, cardId: string): Partial<GameState> {
  const toggle = (c: Card): Card =>
    c.id === cardId ? { ...c, face: c.face === 'face-up' ? 'face-down' : 'face-up' } : c;

  return {
    players: state.players.map(p => ({ ...p, hand: p.hand.map(toggle) })),
    decks: state.decks.map(d => ({ ...d, discard: d.discard.map(toggle) })),
  };
}

export function moveCardById(
  state: GameState,
  cardId: string,
  x: number,
  y: number,
): Partial<GameState> {
  const reposition = (c: Card): Card => (c.id === cardId ? { ...c, x, y } : c);

  return {
    players: state.players.map(p => ({ ...p, hand: p.hand.map(reposition) })),
    decks: state.decks.map(d => ({ ...d, discard: d.discard.map(reposition) })),
  };
}

export function advanceToNextPlayer(state: GameState): Partial<GameState> {
  const idx = state.players.findIndex(p => p.id === state.activePlayerId);
  const next = state.players[(idx + 1) % state.players.length];
  return { activePlayerId: next.id };
}

// ── Phase 2: board & dice ─────────────────────────────────────────────────────

export function movePawn(
  state: GameState,
  pawnId: string,
  targetCellId: CellId,
): Partial<GameState> {
  if (!state.board) return {};
  const cell = state.board.cells.find(c => c.id === targetCellId);
  if (!cell) return {};
  return {
    pawns: state.pawns.map(p =>
      p.id === pawnId ? { ...p, cellId: targetCellId, x: cell.x, y: cell.y } : p,
    ),
  };
}

export function rollDice(state: GameState): Partial<GameState> {
  return {
    dice: state.dice.map(die => ({ ...die, lastResult: Math.floor(Math.random() * die.faces) + 1 })),
  };
}

export function rollSingleDie(state: GameState, dieId: string): Partial<GameState> {
  return {
    dice: state.dice.map(die =>
      die.id === dieId ? { ...die, lastResult: Math.floor(Math.random() * die.faces) + 1 } : die,
    ),
  };
}

// ── Phase 3: tiles ────────────────────────────────────────────────────────────

export function addTile(
  state: GameState,
  shape: TileShape,
  color: string,
  x: number,
  y: number,
  size: number,
): Partial<GameState> {
  const tile: Tile = { id: 'tile-' + Math.random().toString(36).slice(2, 11), shape, color, x, y, size };
  return { tiles: [...state.tiles, tile] };
}

export function moveTile(state: GameState, tileId: string, x: number, y: number): Partial<GameState> {
  const tile = state.tiles.find(t => t.id === tileId);
  if (!tile) return {};
  const others = state.tiles.filter(t => t.id !== tileId);
  const snap = findSnapPosition(others, tile.shape, x, y, tile.size);
  return { tiles: state.tiles.map(t => t.id === tileId ? { ...t, ...(snap ?? { x, y }) } : t) };
}

export function removeTile(state: GameState, tileId: string): Partial<GameState> {
  return { tiles: state.tiles.filter(t => t.id !== tileId) };
}
