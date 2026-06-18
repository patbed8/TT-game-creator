import { TILE_PALETTE } from '../data/tiles';
import type { TileModel } from '../data/tiles';

interface TilePaletteProps {
  onAdd: (model: TileModel) => void;
}

const SWATCH = 38;

// CSS flat-top hexagon clip-path
const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

export default function TilePalette({ onAdd }: TilePaletteProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        padding: '10px 8px',
      }}
    >
      <div
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: 10,
          fontWeight: 'bold',
          textAlign: 'center',
          letterSpacing: '0.05em',
          marginBottom: 2,
        }}
      >
        Tuiles<br />Tiles
      </div>

      {TILE_PALETTE.map((model, i) => (
        <button
          key={i}
          title={model.label}
          onClick={() => onAdd(model)}
          style={{
            width: SWATCH,
            height: SWATCH,
            background: model.color,
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            clipPath: model.shape === 'hexagon' ? HEX_CLIP : undefined,
            borderRadius: model.shape === 'square' ? 4 : undefined,
            boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
            flexShrink: 0,
          }}
        />
      ))}

      <div
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 9,
          textAlign: 'center',
          marginTop: 2,
          lineHeight: 1.6,
        }}
      >
        Clic : ajouter<br />
        Dbl : retirer
      </div>
    </div>
  );
}
