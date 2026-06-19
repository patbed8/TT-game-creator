import type { Card, CellId, GameState, Player, Tile, TileShape } from '../types';
import { findSnapPosition } from './tileUtils';

const INITIAL_HAND_SIZE = 5;

export interface DealResult {
  deck: Card[];
  players: Array<{ id: string; hand: Card[] }>;
}

export function dealInitialHands(deck: Card[], playerIds: string[]): DealResult {
  const remaining = [...deck];
  const players: Array<{ id: string; hand: Card[] }> = playerIds.map(id => ({
    id,
    hand: [],
  }));

  for (let round = 0; round < INITIAL_HAND_SIZE; round++) {
    for (const player of players) {
      const card = remaining.shift();
      if (card) player.hand.push({ ...card, face: 'face-down' });
    }
  }

  return { deck: remaining, players };
}

export function drawCardFromDeck(
  state: GameState,
  targetX: number,
  targetY: number,
): Partial<GameState> {
  if (state.deck.length === 0) return {};

  const [drawn, ...deck] = state.deck;
  const card: Card = { ...drawn, face: 'face-up', x: targetX, y: targetY };

  const players = state.players.map((p): Player =>
    p.id === state.activePlayerId
      ? { ...p, hand: [...p.hand, card] }
      : p,
  );

  return { deck, players };
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
  return { players, discard: [...state.discard, played] };
}

export function flipCardById(state: GameState, cardId: string): Partial<GameState> {
  const toggle = (c: Card): Card =>
    c.id === cardId
      ? { ...c, face: c.face === 'face-up' ? 'face-down' : 'face-up' }
      : c;

  return {
    players: state.players.map(p => ({ ...p, hand: p.hand.map(toggle) })),
    discard: state.discard.map(toggle),
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
    discard: state.discard.map(reposition),
  };
}

export function advanceToNextPlayer(state: GameState): Partial<GameState> {
  const idx = state.players.findIndex(p => p.id === state.activePlayerId);
  const next = state.players[(idx + 1) % state.players.length];
  return { activePlayerId: next.id };
}

// ── Phase 2: board & dice ────────────────────────────────────────────────────

export function movePawn(
  state: GameState,
  pawnId: string,
  targetCellId: CellId,
): Partial<GameState> {
  if (!state.board) return {};
  const cell = state.board.cells.find(c => c.id === targetCellId);
  if (!cell) return {};

  const pawns = state.pawns.map(p =>
    p.id === pawnId ? { ...p, cellId: targetCellId, x: cell.x, y: cell.y } : p,
  );
  return { pawns };
}

export function rollDice(state: GameState): Partial<GameState> {
  return {
    dice: state.dice.map(die => ({
      ...die,
      lastResult: Math.floor(Math.random() * die.faces) + 1,
    })),
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
  const tile: Tile = {
    id: 'tile-' + Math.random().toString(36).slice(2, 11),
    shape,
    color,
    x,
    y,
    size,
  };
  return { tiles: [...state.tiles, tile] };
}

export function moveTile(
  state: GameState,
  tileId: string,
  x: number,
  y: number,
): Partial<GameState> {
  const tile = state.tiles.find(t => t.id === tileId);
  if (!tile) return {};

  const others = state.tiles.filter(t => t.id !== tileId);
  const snap = findSnapPosition(others, tile.shape, x, y, tile.size);
  const pos = snap ?? { x, y };

  return { tiles: state.tiles.map(t => t.id === tileId ? { ...t, ...pos } : t) };
}

export function removeTile(state: GameState, tileId: string): Partial<GameState> {
  return { tiles: state.tiles.filter(t => t.id !== tileId) };
}
