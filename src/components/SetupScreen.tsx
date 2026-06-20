import { useState, type CSSProperties } from 'react';
import { useGameStore } from '../store/gameStore';
import type { BoardConfig, DeckSpec, DieSides, TableConfig } from '../types';
import { PAWN_COLORS, SERIES_COLORS } from '../data/configDefaults';

// ── Local form state ──────────────────────────────────────────────────────────

type BoardKind = 'none' | 'grid' | 'path' | 'freeTiles';
type DeckKind = 'none' | 'standard52' | 'numbered' | 'coloredSeries';

const DIE_FACES: DieSides[] = [4, 6, 8, 10, 12, 20];

// Dropdown option lists (replace free-text number inputs for mobile reliability)
const GRID_SIZE_OPTS  = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];
const PATH_LEN_OPTS   = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
const NUM_COUNT_OPTS  = [5, 10, 15, 20, 26, 30, 40, 52, 75, 100];
const PER_COLOR_OPTS  = [1, 2, 3, 4, 5, 6, 8, 10, 13];

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
    lc.deckKind === 'numbered'      ? { kind: 'numbered', count: lc.numberedCount } :
    lc.deckKind === 'coloredSeries' ? { kind: 'coloredSeries', colors: lc.seriesColors, perColor: lc.seriesPerColor } :
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
  height: '100vh',
  overflowY: 'auto',               // this div scrolls; body stays overflow:hidden
  background: '#1e4d18',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '24px 12px 48px',
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

const SECTION: CSSProperties = { marginBottom: 24 };

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
  width: 34,
  height: 34,
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: 6,
  color: 'white',
  fontSize: 18,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const COUNT_DISPLAY: CSSProperties = {
  minWidth: 28,
  textAlign: 'center',
  fontSize: 15,
  fontWeight: 'bold',
};

const SELECT_STYLE: CSSProperties = {
  padding: '8px 10px',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.35)',
  borderRadius: 6,
  color: 'white',
  fontSize: 14,
  cursor: 'pointer',
  minWidth: 90,
};

const RADIO_GROUP: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };

const RADIO_ROW: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
  fontSize: 14,
};

const HINT: CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.45)',
  marginTop: 4,
};

const START_BTN: CSSProperties = {
  width: '100%',
  padding: '16px',
  background: '#27ae60',
  border: 'none',
  borderRadius: 10,
  color: 'white',
  fontSize: 17,
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: 8,
  boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Counter({ value, onChange, min = 0, max = 9 }: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button style={COUNTER_BTN} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span style={COUNT_DISPLAY}>{value}</span>
      <button style={COUNTER_BTN} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

function NumSelect({ value, opts, onChange }: {
  value: number;
  opts: number[];
  onChange: (n: number) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={SELECT_STYLE}
    >
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── SetupScreen ───────────────────────────────────────────────────────────────

export default function SetupScreen() {
  const buildInitialState = useGameStore(s => s.buildInitialState);
  const [lc, setLc] = useState<LocalConfig>(DEFAULT_LOCAL);

  function patch(partial: Partial<LocalConfig>) {
    setLc(prev => ({ ...prev, ...partial }));
  }

  function setDieCount(faces: DieSides, n: number) {
    patch({ dieCounts: { ...lc.dieCounts, [faces]: n } });
  }

  function setPawnCount(color: string, n: number) {
    patch({ pawnCounts: { ...lc.pawnCounts, [color]: n } });
  }

  function toggleSeriesColor(color: string) {
    const next = lc.seriesColors.includes(color)
      ? lc.seriesColors.filter(c => c !== color)
      : [...lc.seriesColors, color];
    patch({ seriesColors: next });
  }

  const totalCards = deckCardCount(lc);
  const totalDice  = DIE_FACES.reduce((s, f) => s + (lc.dieCounts[f] ?? 0), 0);
  const totalPawns = PAWN_COLORS.reduce((s, c) => s + (lc.pawnCounts[c] ?? 0), 0);

  return (
    <div style={WRAP}>
      <div style={CARD_BOX}>

        <h1 style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#f0e68c' }}>
          Configuration / Setup
        </h1>

        {/* ── Dés / Dice ── */}
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Dés / Dice</div>
          {DIE_FACES.map(f => (
            <div key={f} style={ROW}>
              <span style={{ ...LABEL, minWidth: 36 }}>d{f}</span>
              <Counter value={lc.dieCounts[f] ?? 0} onChange={n => setDieCount(f, n)} max={6} />
            </div>
          ))}
          <p style={HINT}>
            {totalDice === 0
              ? 'Aucun dé / No dice'
              : DIE_FACES.filter(f => (lc.dieCounts[f] ?? 0) > 0).map(f => `${lc.dieCounts[f]}d${f}`).join(', ')
            }
          </p>
        </div>

        {/* ── Plateau / Board ── */}
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Plateau / Board</div>
          <div style={RADIO_GROUP}>
            {(['none', 'grid', 'path', 'freeTiles'] as BoardKind[]).map(kind => (
              <label key={kind} style={RADIO_ROW}>
                <input type="radio" name="board" checked={lc.boardKind === kind} onChange={() => patch({ boardKind: kind })} />
                {kind === 'none'      ? 'Aucun / None' :
                 kind === 'grid'      ? 'Grille / Grid' :
                 kind === 'path'      ? 'Parcours / Path' :
                                        'Surface libre / Free surface'}
              </label>
            ))}
          </div>

          {lc.boardKind === 'grid' && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={ROW}>
                <span style={LABEL}>Colonnes / Cols</span>
                <NumSelect value={lc.gridCols} opts={GRID_SIZE_OPTS} onChange={n => patch({ gridCols: n })} />
              </div>
              <div style={ROW}>
                <span style={LABEL}>Rangées / Rows</span>
                <NumSelect value={lc.gridRows} opts={GRID_SIZE_OPTS} onChange={n => patch({ gridRows: n })} />
              </div>
            </div>
          )}

          {lc.boardKind === 'path' && (
            <div style={{ marginTop: 12 }}>
              <div style={ROW}>
                <span style={LABEL}>Longueur / Length</span>
                <NumSelect value={lc.pathLength} opts={PATH_LEN_OPTS} onChange={n => patch({ pathLength: n })} />
              </div>
            </div>
          )}
        </div>

        {/* ── Paquet / Deck ── */}
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Paquet / Deck</div>
          <div style={RADIO_GROUP}>
            {(['none', 'standard52', 'numbered', 'coloredSeries'] as DeckKind[]).map(kind => (
              <label key={kind} style={RADIO_ROW}>
                <input type="radio" name="deck" checked={lc.deckKind === kind} onChange={() => patch({ deckKind: kind })} />
                {kind === 'none'          ? 'Aucun / None' :
                 kind === 'standard52'    ? 'Standard (52)' :
                 kind === 'numbered'      ? 'Numéroté / Numbered' :
                                            'Séries colorées / Colored series'}
              </label>
            ))}
          </div>

          {lc.deckKind === 'numbered' && (
            <div style={{ marginTop: 12 }}>
              <div style={ROW}>
                <span style={LABEL}>Quantité / Count</span>
                <NumSelect value={lc.numberedCount} opts={NUM_COUNT_OPTS} onChange={n => patch({ numberedCount: n })} />
              </div>
            </div>
          )}

          {lc.deckKind === 'coloredSeries' && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={ROW}>
                <span style={LABEL}>Cartes/couleur / per color</span>
                <NumSelect value={lc.seriesPerColor} opts={PER_COLOR_OPTS} onChange={n => patch({ seriesPerColor: n })} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SERIES_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleSeriesColor(c)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 4,
                      background: c,
                      border: lc.seriesColors.includes(c) ? '3px solid white' : '3px solid transparent',
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

        {/* ── Pions / Pawns ── */}
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Pions / Pawns</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PAWN_COLORS.map(c => (
              <div key={c} style={ROW}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.4)', flexShrink: 0 }} />
                <Counter value={lc.pawnCounts[c] ?? 0} onChange={n => setPawnCount(c, n)} max={4} />
              </div>
            ))}
          </div>
          {totalPawns === 0 && <p style={HINT}>Aucun pion / No pawns</p>}
        </div>

        {/* ── Start ── */}
        <button style={START_BTN} onClick={() => buildInitialState(toTableConfig(lc))}>
          Démarrer / Start
        </button>

      </div>
    </div>
  );
}
