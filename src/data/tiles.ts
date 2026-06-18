import type { TileShape } from '../types';

export interface TileModel {
  shape: TileShape;
  size: number;
  color: string;
  label: string;
}

export const TILE_PALETTE: TileModel[] = [
  // Squares
  { shape: 'square', size: 60, color: '#e74c3c', label: 'Carré rouge / Red square' },
  { shape: 'square', size: 60, color: '#3498db', label: 'Carré bleu / Blue square' },
  { shape: 'square', size: 60, color: '#27ae60', label: 'Carré vert / Green square' },
  { shape: 'square', size: 60, color: '#f39c12', label: 'Carré jaune / Yellow square' },
  // Hexagons (flat-top, circumradius R = size)
  { shape: 'hexagon', size: 40, color: '#9b59b6', label: 'Hex violet / Purple hex' },
  { shape: 'hexagon', size: 40, color: '#1abc9c', label: 'Hex turquoise' },
  { shape: 'hexagon', size: 40, color: '#e67e22', label: 'Hex orange' },
  { shape: 'hexagon', size: 40, color: '#c0392b', label: 'Hex rouge / Red hex' },
];
