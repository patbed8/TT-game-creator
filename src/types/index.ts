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

export interface GameState {
  deck: Card[];
  discard: Card[];
  players: Player[];
  activePlayerId: string;
}
