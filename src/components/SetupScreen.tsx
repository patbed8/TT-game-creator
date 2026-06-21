import { useState, type CSSProperties } from 'react';
import { useGameStore } from '../store/gameStore';
import type { BoardConfig, DeckSpec, DieSides, TableConfig } from '../types';
import { PAWN_COLORS, SERIES_COLORS } from '../data/configDefaults';

// ── Local form state ──────────────────────────────────────────────────────────

type BoardKind = 'none' | 'grid' | 'path' | 'freeTiles';
type DeckKind = 'standard52' | 'numbered' | 'coloredSeries';

const ALL_DIE_FACES: DieSides[] = [4, 6, 8, 10, 12, 20];

const GRID_SIZE_OPTS  = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];
const PATH_LEN_OPTS   = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
const NUM_COUNT_OPTS  = [5, 10, 15, 20, 26, 30, 40, 52, 75, 100];
const PER_COLOR_OPTS  = [1, 2, 3, 4, 5, 6, 8, 10, 13];

interface DieEntry {
  faces: DieSides;
  label: string;
}

interface DeckEntry {
  kind: DeckKind;
  label: string;
  numberedCount: number;
  seriesColors: string[];
  seriesPerColor: number;
}

const DEFAULT_DIE_ENTRY: DieEntry = { faces: 6, label: '' };

const DEFAULT_DECK_ENTRY: DeckEntry = {
  kind: 'standard52',
  label: '',
  numberedCount: 20,
  seriesColors: ['#e74c3c', '#3498db', '#27ae60', '#f39c12'],
  seriesPerColor: 5,
};

interface LocalConfig {
  dieEntries: DieEntry[];
  boardKind: BoardKind;
  gridCols: number;
  gridRows: number;
  pathLength: number;
  deckEntries: DeckEntry[];
  pawnCounts: Partial<Record<string, number>>;
}

const DEFAULT_LOCAL: LocalConfig = {
  dieEntries: [{ faces: 6, label: '' }],
  boardKind: 'grid',
  gridCols: 8,
  gridRows: 8,
  pathLength: 20,
  deckEntries: [{ ...DEFAULT_DECK_ENTRY }],
  pawnCounts: { '#e74c3c': 1, '#3498db': 1 },
};

function entryToSpec(e: DeckEntry): DeckSpec {
  const label = e.label.trim() || undefined;
  if (e.kind === 'standard52') return { kind: 'standard52', label };
  if (e.kind === 'numbered')   return { kind: 'numbered', count: e.numberedCount, label };
  return { kind: 'coloredSeries', colors: e.seriesColors, perColor: e.seriesPerColor, label };
}

function entryCardCount(e: DeckEntry): number {
  if (e.kind === 'standard52') return 52;
  if (e.kind === 'numbered') return e.numberedCount;
  return e.seriesColors.length * e.seriesPerColor;
}

function toTableConfig(lc: LocalConfig): TableConfig {
  const dice = lc.dieEntries.map(e => ({ sides: e.faces, label: e.label }));

  const board: BoardConfig =
    lc.boardKind === 'grid'      ? { kind: 'grid', cols: lc.gridCols, rows: lc.gridRows } :
    lc.boardKind === 'path'      ? { kind: 'path', length: lc.pathLength } :
    lc.boardKind === 'freeTiles' ? { kind: 'freeTiles' } :
    { kind: 'none' };

  const decks: DeckSpec[] = lc.deckEntries.map(entryToSpec);

  const pawns = PAWN_COLORS
    .filter(c => (lc.pawnCounts[c] ?? 0) > 0)
    .map(c => ({ color: c, count: lc.pawnCounts[c]! }));

  return { dice, board, decks, pawns, players: 2 };
}

// ── Styles ────────────────────────────────────────────────────────────────────

const WRAP: CSSProperties = {
  height: '100vh',
  overflowY: 'auto',
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

const INPUT_STYLE: CSSProperties = {
  padding: '8px 10px',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.35)',
  borderRadius: 6,
  color: 'white',
  fontSize: 14,
  flex: 1,
  minWidth: 0,
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

const ADD_DECK_BTN: CSSProperties = {
  width: '100%',
  padding: '10px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px dashed rgba(255,255,255,0.35)',
  borderRadius: 8,
  color: 'rgba(255,255,255,0.75)',
  fontSize: 14,
  cursor: 'pointer',
  marginTop: 8,
};

const DECK_ENTRY_BOX: CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  padding: '12px',
  marginBottom: 10,
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
    <select value={value} onChange={e => onChange(Number(e.target.value))} style={SELECT_STYLE}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function DieEntryEditor({ index, entry, onChange, onRemove }: {
  index: number;
  entry: DieEntry;
  onChange: (e: DieEntry) => void;
  onRemove: () => void;
}) {
  return (
    <div style={DECK_ENTRY_BOX}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#f0e68c' }}>
          Dé {index + 1} / Die {index + 1}
        </span>
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.8)', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}
        >
          ✕
        </button>
      </div>
      <div style={ROW}>
        <span style={LABEL}>Type</span>
        <select
          value={entry.faces}
          onChange={e => onChange({ ...entry, faces: Number(e.target.value) as DieSides })}
          style={SELECT_STYLE}
        >
          {ALL_DIE_FACES.map(f => <option key={f} value={f}>d{f}</option>)}
        </select>
      </div>
      <div style={ROW}>
        <span style={LABEL}>Nom / Name</span>
        <input
          type="text"
          value={entry.label}
          onChange={e => onChange({ ...entry, label: e.target.value })}
          placeholder={`d${entry.faces}`}
          style={INPUT_STYLE}
        />
      </div>
    </div>
  );
}

function DeckEntryEditor({ index, entry, onChange, onRemove }: {
  index: number;
  entry: DeckEntry;
  onChange: (e: DeckEntry) => void;
  onRemove: () => void;
}) {
  function patch(partial: Partial<DeckEntry>) {
    onChange({ ...entry, ...partial });
  }
  function toggleColor(c: string) {
    const next = entry.seriesColors.includes(c)
      ? entry.seriesColors.filter(x => x !== c)
      : [...entry.seriesColors, c];
    patch({ seriesColors: next });
  }

  return (
    <div style={DECK_ENTRY_BOX}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#f0e68c' }}>
          Paquet {index + 1} / Deck {index + 1}
        </span>
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.8)', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}
        >
          ✕
        </button>
      </div>
      <div style={{ ...ROW, marginBottom: 10 }}>
        <span style={LABEL}>Nom / Name</span>
        <input
          type="text"
          value={entry.label}
          onChange={e => patch({ label: e.target.value })}
          placeholder={`Paquet ${index + 1} / Deck ${index + 1}`}
          style={INPUT_STYLE}
        />
      </div>

      <div style={RADIO_GROUP}>
        {(['standard52', 'numbered', 'coloredSeries'] as DeckKind[]).map(kind => (
          <label key={kind} style={RADIO_ROW}>
            <input type="radio" name={`deck-${index}`} checked={entry.kind === kind} onChange={() => patch({ kind })} />
            {kind === 'standard52'    ? 'Standard (52)' :
             kind === 'numbered'      ? 'Numéroté / Numbered' :
                                        'Séries colorées / Colored series'}
          </label>
        ))}
      </div>

      {entry.kind === 'numbered' && (
        <div style={{ marginTop: 10 }}>
          <div style={ROW}>
            <span style={LABEL}>Quantité / Count</span>
            <NumSelect value={entry.numberedCount} opts={NUM_COUNT_OPTS} onChange={n => patch({ numberedCount: n })} />
          </div>
        </div>
      )}

      {entry.kind === 'coloredSeries' && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={ROW}>
            <span style={LABEL}>Cartes/couleur / per color</span>
            <NumSelect value={entry.seriesPerColor} opts={PER_COLOR_OPTS} onChange={n => patch({ seriesPerColor: n })} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SERIES_COLORS.map(c => (
              <button
                key={c}
                onClick={() => toggleColor(c)}
                style={{
                  width: 34, height: 34, borderRadius: 4, background: c,
                  border: entry.seriesColors.includes(c) ? '3px solid white' : '3px solid transparent',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      )}

      <p style={HINT}>
        {entryCardCount(entry)} carte{entryCardCount(entry) !== 1 ? 's' : ''} / card{entryCardCount(entry) !== 1 ? 's' : ''}
      </p>
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

  function setPawnCount(color: string, n: number) {
    patch({ pawnCounts: { ...lc.pawnCounts, [color]: n } });
  }

  function addDie() {
    if (lc.dieEntries.length >= 8) return;
    patch({ dieEntries: [...lc.dieEntries, { ...DEFAULT_DIE_ENTRY }] });
  }
  function removeDie(i: number) {
    patch({ dieEntries: lc.dieEntries.filter((_, idx) => idx !== i) });
  }
  function updateDie(i: number, entry: DieEntry) {
    const next = [...lc.dieEntries];
    next[i] = entry;
    patch({ dieEntries: next });
  }

  function addDeck() {
    if (lc.deckEntries.length >= 4) return;
    patch({ deckEntries: [...lc.deckEntries, { ...DEFAULT_DECK_ENTRY }] });
  }
  function removeDeck(i: number) {
    patch({ deckEntries: lc.deckEntries.filter((_, idx) => idx !== i) });
  }
  function updateDeck(i: number, entry: DeckEntry) {
    const next = [...lc.deckEntries];
    next[i] = entry;
    patch({ deckEntries: next });
  }

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
          {lc.dieEntries.map((entry, i) => (
            <DieEntryEditor key={i} index={i} entry={entry} onChange={e => updateDie(i, e)} onRemove={() => removeDie(i)} />
          ))}
          {lc.dieEntries.length === 0 && <p style={HINT}>Aucun dé / No dice</p>}
          {lc.dieEntries.length < 8 && (
            <button style={ADD_DECK_BTN} onClick={addDie}>+ Ajouter un dé / Add die</button>
          )}
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

        {/* ── Paquets / Decks ── */}
        <div style={SECTION}>
          <div style={SECTION_TITLE}>Paquets / Decks</div>

          {lc.deckEntries.map((entry, i) => (
            <DeckEntryEditor
              key={i}
              index={i}
              entry={entry}
              onChange={e => updateDeck(i, e)}
              onRemove={() => removeDeck(i)}
            />
          ))}

          {lc.deckEntries.length === 0 && (
            <p style={HINT}>Aucun paquet / No decks</p>
          )}

          {lc.deckEntries.length < 4 && (
            <button style={ADD_DECK_BTN} onClick={addDeck}>
              + Ajouter un paquet / Add deck
            </button>
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
