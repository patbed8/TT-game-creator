import type { Rank, Suit } from '../types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export const RANKS: Rank[] = [
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',
];

// 52-card deck skeleton — face/position set at init time
export const BASE_DECK: Array<{ id: string; rank: Rank; suit: Suit }> =
  SUITS.flatMap(suit => RANKS.map(rank => ({ id: `${rank}-${suit}`, rank, suit })));
