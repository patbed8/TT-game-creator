import type { Card } from '../types';
import { BASE_DECK } from '../data/deck';

export function createDeck(): Card[] {
  return BASE_DECK.map(c => ({ ...c, face: 'face-down' as const, x: 0, y: 0 }));
}

export function shuffleDeck<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
