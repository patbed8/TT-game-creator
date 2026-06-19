import type { Card, CardFace, DeckSpec } from '../types';
import { BASE_DECK } from '../data/deck';

export function generateDeck(spec: DeckSpec): Card[] {
  const face: CardFace = 'face-down';

  switch (spec.kind) {
    case 'standard52':
      return BASE_DECK.map(c => ({ ...c, face, x: 0, y: 0 }));

    case 'numbered':
      return Array.from({ length: spec.count }, (_, i) => ({
        id: `card-num-${i + 1}`,
        value: i + 1,
        face,
        x: 0,
        y: 0,
      }));

    case 'coloredSeries':
      return spec.colors.flatMap(color =>
        Array.from({ length: spec.perColor }, (_, i) => ({
          id: `card-${color}-${i + 1}`,
          value: i + 1,
          color,
          face,
          x: 0,
          y: 0,
        })),
      );
  }
}
