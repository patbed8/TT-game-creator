import { useState } from 'react';
import { TILE_PALETTE } from '../data/tiles';
import type { TileModel } from '../data/tiles';

interface TilePaletteProps {
  onAdd: (model: TileModel) => void;
}

const SWATCH = 38;
const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

const squares  = TILE_PALETTE.filter(m => m.shape === 'square');
const hexagons = TILE_PALETTE.filter(m => m.shape === 'hexagon');

function SwatchBtn({ model, onAdd }: { model: TileModel; onAdd: (m: TileModel) => void }) {
  return (
    <button
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
  );
}

function Section({
  label, open, onToggle, models, onAdd,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  models: TileModel[];
  onAdd: (m: TileModel) => void;
}) {
  return (
    <>
      <button
        onClick={onToggle}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.8)',
          fontSize: 11,
          fontWeight: 'bold',
          cursor: 'pointer',
          padding: '2px 0',
          width: '100%',
          textAlign: 'left',
          letterSpacing: '0.04em',
        }}
      >
        {open ? '▾' : '▸'} {label}
      </button>
      {open && models.map((m, i) => (
        <SwatchBtn key={i} model={m} onAdd={onAdd} />
      ))}
    </>
  );
}

export default function TilePalette({ onAdd }: TilePaletteProps) {
  const [squaresOpen, setSquaresOpen] = useState(false);
  const [hexOpen, setHexOpen]         = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 6,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        padding: '10px 8px',
        minWidth: 60,
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
        Tuiles / Tiles
      </div>

      <Section
        label="Carré / Square"
        open={squaresOpen}
        onToggle={() => setSquaresOpen(o => !o)}
        models={squares}
        onAdd={onAdd}
      />

      <Section
        label="Hexagone / Hex"
        open={hexOpen}
        onToggle={() => setHexOpen(o => !o)}
        models={hexagons}
        onAdd={onAdd}
      />

      <div
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 9,
          textAlign: 'center',
          marginTop: 2,
          lineHeight: 1.6,
        }}
      >
        Clic : ajouter / Add<br />
        Dbl : retirer / Remove
      </div>
    </div>
  );
}
