import { useState, type CSSProperties } from 'react';
import { useGameStore } from '../store/gameStore';
import type { BoardConfig, DeckSpec, DieSides, TableConfig } from '../types';
import { PAWN_COLORS, SERIES_COLORS } from '../data/configDefaults';

// ── Local form state ──────────────────────────────────────────────────────────

type BoardKind = 'none' | 'grid' | 'path' | 'freeTiles';
type DeckKind = 'none' | 'standard52' | 'numbered' | 'coloredSeries';

const DIE_FACES: DieSides[] = [4, 6, 8, 10, 12, 20];

interface LocalConfig {
  dieCounts: Partial<Record<DieSides, number>>;
  boardKind: BoardKind;
  gridCols: number;
  gridRows: number;
  pathLength: number;
  deckKind: DeckKind;
  numberedCount: number;
  seriesColors: string[];
  seriesPerColor: number;
  pawnCounts: Partial<Record<string, number>>;
}

const DEFAULT_LOCAL: LocalConfig = {
  dieCounts: { 6: 1 },
  boardKind: 'grid',
  gridCols: 8,
  gridRows: 8,
  pathLength: 20,
  deckKind: 'standard52',
  numberedCount: 20,
  seriesColors: ['#e74c3c', '#3498db', '#27ae60', '#f39c12'],
  seriesPerColor: 5,
  pawnCounts: { '#e74c3c': 1, '#3498db': 1 },
};

function toTableConfig(lc: LocalConfig): TableConfig {
  const dice = DIE_FACES
    .filter(f => (lc.dieCounts[f] ?? 0) > 0)
    .map(f => ({ sides: f, count: lc.dieCounts[f]! }));

  const board: BoardConfig =
    lc.boardKind === 'grid'      ? { kind: 'grid', cols: lc.gridCols, rows: lc.gridRows } :
    lc.boardKind === 'path'      ? { kind: 'path', length: lc.pathLength } :
    lc.boardKind === 'freeTiles' ? { kind: 'freeTiles' } :
    { kind: 'none' };

  const deck: DeckSpec | null =
    lc.deckKind === 'standard52'    ? { kind: 'standard52' } :
    lc.deckKind === 'numbered'      ? { kind: 'numbered', count: Math.max(1, lc.numberedCount) } :
    lc.deckKind === 'coloredSeries' ? { kind: 'coloredSeries', colors: lc.seriesColors, perColor: Math.max(1, lc.seriesPerColor) } :
    null;

  const pawns = PAWN_COLORS
    .filter(c => (lc.pawnCounts[c] ?? 0) > 0)
    .map(c => ({ color: c, count: lc.pawnCounts[c]! }));

  return { dice, board, deck, pawns, players: 2 };
}

function deckCardCount(lc: LocalConfig): number {
  if (lc.deckKind === 'standard52') return 52;
  if (lc.deckKind === 'numbered') return lc.numberedCount;
  if (lc.deckKind === 'coloredSeries') return lc.seriesColors.length * lc.seriesPerColor;
  return 0;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const WRAP: CSSProperties = {
  minHeight: '100vh',
  background: '#1e4d18',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '24px 12px 40px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  boxSizing: 'border-box',
};

const CARD_BOX: CSSProperties = {
  background: 'rgba(0,0,0,0.55)',
  borderRadius: 14,
  padding: '24px 20px',
  width: '100%',
  maxWidth: 480,
  color: 'white',
};

const SECTION: CSSProperties = {
  marginBottom: 24,
};

const SECTION_TITLE: CSSProperties = {
  fontSize: 15,
  fontWeight: 'bold',
  color: '#f0e68c',
  marginBottom: 12,
  borderBottom: '1px solid rgba(255,255,255,0.15)',
  paddingBottom: 6,
};

const ROW: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
  flexWrap: 'wrap',
};

const LABEL: CSSProperties = {
  fontSize: 13,
  color: 'rgba(255,255,255,0.8)',
  minWidth: 80,
};

const COUNTER_BTN: CSSProperties = {
  width: 28,
  height: 28,
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: 6,
  color: 'white',
  fontSize: 16,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const COUNT_DISPLAY: CSSProperties = {
  minWidth: 24,
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 'bold',
};

const INPUT_STYLE: CSSProperties = {
  width: 64,
  padding: '4px 8px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: 6,
  color: 'white',
  fontSize: 13,
};

const RADIO_GROUP: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const RADIO_ROW: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
};

const HINT: CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.45)',
  marginTop: 2,
};

const START_BTN: CSSProperties = {
  width: '100%',
  padding: '14px',
  background: '#27ae60',
  border: 'none',
  borderRadius: 10,
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: 8,
  boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
};

// ── Counter component ─────────────────────────────────────────────────────────

function Counter({ value, onChange, min = 0, max = 9 }: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button style={COUNTER_BTN} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span style={COUNT_DISPLAY}>{value}</span>
      <button style={COUNTER_BTN} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

// ── SetupScreen ───────────────────────────────────────────────────────────────

export default function SetupScreen() {
  const buildInitialState = useGameStore(s => s.buildInitialState);
  const [lc, setLc] = useState<LocalConfig>(DEFAULT_LOCAL);

  function patch(partial: Partial<LocalConfig>) {
    setLc(prev => ({ ...prev, ...partial }));
  }

  function setDieCount(faces: DieSides, count: number) {
    patch({ dieCounts: { ...lc.dieCounts, [faces]: count } });
  }

  function setPawnCount(color: string, count: number) {
    patch({ pawnCounts: { ...lc.pawnCounts, [color]: count } });
  }

  function toggleSeriesColor(color: string) {
    const next = lc.seriesColors.includes(color)
      ? lc.seriesColors.filter(c => c !== color)
      : [...lc.seriesColors, color];
    patch({ seriesColors: next });
  }

  function handleStart() {
    buildInitialState(toTableConfig(lc));
  }

  const totalCards = deckCardCount(lc);
  const totalDice = DIE_FACES.reduce((sum, f) => sum + (lc.dieCounts[f] ?? 0), 0);
  const totalPawns = PAWN_COLORS.reduce((sum, c) => sum + (lc.pawnCounts[c] ?? 0), 0);

  return (
    <div style={WRAP}>
      <div style={CARD_BOX}>
        {/* Title */}
        <h1 style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#f0e68c' }}>
          Configuration / Setup
        </h1>

        {/* ── Dice ── */}
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Dés / Dice</div>
          {DIE_FACES.map(f => (
            <div key={f} style={ROW}>
              <span style={LABEL}>d{f}</span>
              <Counter
                value={lc.dieCounts[f] ?? 0}
                onChange={n => setDieCount(f, n)}
                max={6}
              />
            </div>
          ))}
          {totalDice === 0 && <p style={HINT}>Aucun dé / No dice</p>}
          {totalDice > 0 && (
            <p style={HINT}>
              {DIE_FACES.filter(f => (lc.dieCounts[f] ?? 0) > 0)
                .map(f => `${lc.dieCounts[f]}d${f}`)
                .join(', ')}
            </p>
          )}
        </div>

        {/* ── Board ── */}
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Plateau / Board</div>
          <div style={RADIO_GROUP}>
            {(['none', 'grid', 'path', 'freeTiles'] as BoardKind[]).map(kind => (
              <label key={kind} style={RADIO_ROW}>
                <input
                  type="radio"
                  name="board"
                  value={kind}
                  checked={lc.boardKind === kind}
                  onChange={() => patch({ boardKind: kind })}
                />
                <span style={{ fontSize: 13 }}>
                  {kind === 'none'      ? 'Aucun / None' :
                   kind === 'grid'      ? 'Grille / Grid' :
                   kind === 'path'      ? 'Parcours / Path' :
                                          'Surface libre / Free surface'}
                </span>
              </label>
            ))}
          </div>

          {lc.boardKind === 'grid' && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={ROW}>
                <span style={LABEL}>Colonnes / Cols</span>
                <input
                  type="number"
                  min={2} max={20}
                  value={lc.gridCols}
                  onChange={e => patch({ gridCols: Math.max(2, Math.min(20, Number(e.target.value))) })}
                  style={INPUT_STYLE}
                />
              </div>
              <div style={ROW}>
                <span style={LABEL}>Rangées / Rows</span>
                <input
                  type="number"
                  min={2} max={20}
                  value={lc.gridRows}
                  onChange={e => patch({ gridRows: Math.max(2, Math.min(20, Number(e.target.value))) })}
                  style={INPUT_STYLE}
                />
              </div>
            </div>
          )}

          {lc.boardKind === 'path' && (
            <div style={{ marginTop: 10 }}>
              <div style={ROW}>
                <span style={LABEL}>Longueur / Length</span>
                <input
                  type="number"
                  min={4} max={100}
                  value={lc.pathLength}
                  onChange={e => patch({ pathLength: Math.max(4, Math.min(100, Number(e.target.value))) })}
                  style={INPUT_STYLE}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Deck ── */}
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Paquet / Deck</div>
          <div style={RADIO_GROUP}>
            {(['none', 'standard52', 'numbered', 'coloredSeries'] as DeckKind[]).map(kind => (
              <label key={kind} style={RADIO_ROW}>
                <input
                  type="radio"
                  name="deck"
                  value={kind}
                  checked={lc.deckKind === kind}
                  onChange={() => patch({ deckKind: kind })}
                />
                <span style={{ fontSize: 13 }}>
                  {kind === 'none'          ? 'Aucun / None' :
                   kind === 'standard52'    ? 'Standard (52)' :
                   kind === 'numbered'      ? 'Numéroté / Numbered' :
                                              'Séries colorées / Colored series'}
                </span>
              </label>
            ))}
          </div>

          {lc.deckKind === 'numbered' && (
            <div style={{ marginTop: 10 }}>
              <div style={ROW}>
                <span style={LABEL}>Quantité / Count</span>
                <input
                  type="number"
                  min={1} max={200}
                  value={lc.numberedCount}
                  onChange={e => patch({ numberedCount: Math.max(1, Math.min(200, Number(e.target.value))) })}
                  style={INPUT_STYLE}
                />
              </div>
            </div>
          )}

          {lc.deckKind === 'coloredSeries' && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={ROW}>
                <span style={LABEL}>Cartes/couleur<br/>per color</span>
                <input
                  type="number"
                  min={1} max={50}
                  value={lc.seriesPerColor}
                  onChange={e => patch({ seriesPerColor: Math.max(1, Math.min(50, Number(e.target.value))) })}
                  style={INPUT_STYLE}
                />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SERIES_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleSeriesColor(c)}
                    title={`Couleur / Color ${c}`}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 4,
                      background: c,
                      border: lc.seriesColors.includes(c)
                        ? '3px solid white'
                        : '3px solid transparent',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {lc.deckKind !== 'none' && (
            <p style={HINT}>{totalCards} carte{totalCards !== 1 ? 's' : ''} / card{totalCards !== 1 ? 's' : ''}</p>
          )}
        </div>

        {/* ── Pawns ── */}
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Pions / Pawns</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PAWN_COLORS.map(c => (
              <div key={c} style={ROW}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.4)', flexShrink: 0 }} />
                <Counter
                  value={lc.pawnCounts[c] ?? 0}
                  onChange={n => setPawnCount(c, n)}
                  max={4}
                />
              </div>
            ))}
          </div>
          {totalPawns === 0 && <p style={HINT}>Aucun pion / No pawns</p>}
        </div>

        {/* ── Start button ── */}
        <button style={START_BTN} onClick={handleStart}>
          Démarrer / Start
        </button>
      </div>
    </div>
  );
}
