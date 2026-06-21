import { type CSSProperties, useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useGameStore, DECK_ZONE_WIDTH } from '../store/gameStore';
import CardComponent from './Card';
import DeckZone from './Deck';
import Hand from './Hand';
import BoardComponent from './Board';
import PawnComponent from './Pawn';
import DieComponent from './Die';
import TileComponent from './Tile';
import TilePalette from './TilePalette';

const CARD_W = 70;
const CARD_H = 100;
const DECK_START_X = 30;

function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

const BTN: CSSProperties = {
  padding: '12px 16px',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 'bold',
  boxShadow: '0 2px 6px rgba(0,0,0,0.45)',
  transition: 'filter 0.15s',
};

function hover(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.filter = 'brightness(1.15)';
}
function unhover(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.filter = '';
}

export default function GameTable() {
  const { w, h } = useWindowSize();
  const {
    decks, players, activePlayerId, board, pawns, dice, tiles,
    drawCard, playCard, endTurn, rollDice, rollDie, addTile, goToSetup,
  } = useGameStore();

  const hasDeck = decks.length > 0;
  const activePlayer = players.find(p => p.id === activePlayerId);
  const handY = h - CARD_H - 40;

  const [stageView, setStageView] = useState({ x: 0, y: 0, scale: 1 });
  const touchRef = useRef<{ dist: number; center: { x: number; y: number } } | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [menuOpen, closeMenu]);

  function onStageTouchStart(e: KonvaEventObject<TouchEvent>) {
    const t = e.evt.touches;
    if (t.length === 2) {
      touchRef.current = {
        dist: Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY),
        center: { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 },
      };
    }
  }

  function onStageTouchMove(e: KonvaEventObject<TouchEvent>) {
    const t = e.evt.touches;
    if (t.length !== 2 || !touchRef.current) return;
    e.evt.preventDefault();

    const newDist = Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
    const newCenter = { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 };

    const oldDist = touchRef.current.dist;
    const oldCenterX = touchRef.current.center.x;
    const oldCenterY = touchRef.current.center.y;
    touchRef.current = { dist: newDist, center: newCenter };

    setStageView(prev => {
      const sf = newDist / oldDist;
      const newScale = Math.max(0.3, Math.min(3, prev.scale * sf));
      const newX = newCenter.x - (oldCenterX - prev.x) * sf;
      const newY = newCenter.y - (oldCenterY - prev.y) * sf;
      return { x: newX, y: newY, scale: newScale };
    });
  }

  function onStageTouchEnd() { touchRef.current = null; }

  function viewportCenter() {
    return {
      x: (-stageView.x + w / 2) / stageView.scale,
      y: (-stageView.y + h / 2) / stageView.scale,
    };
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Stage
          width={w}
          height={h}
          x={stageView.x}
          y={stageView.y}
          scaleX={stageView.scale}
          scaleY={stageView.scale}
          onTouchStart={onStageTouchStart}
          onTouchMove={onStageTouchMove}
          onTouchEnd={onStageTouchEnd}
        >
        <Layer>
          {/* Board */}
          {board && <BoardComponent board={board} />}

          {/* Tiles */}
          {tiles.map(tile => (
            <TileComponent key={tile.id} tile={tile} />
          ))}

          {/* Hand zone — only when decks are configured */}
          {hasDeck && activePlayer && (
            <Hand playerName={activePlayer.name} tableWidth={w} cardHeight={CARD_H} zoneY={handY} />
          )}

          {/* Deck zones — one per configured deck */}
          {decks.map((dk, i) => (
            <DeckZone
              key={dk.id}
              x={DECK_START_X + i * DECK_ZONE_WIDTH}
              y={60}
              label={dk.label}
              cardCount={dk.cards.length}
              discardCount={dk.discard.length}
              cardWidth={CARD_W}
              cardHeight={CARD_H}
              onDraw={() => drawCard(dk.id)}
            />
          ))}

          {/* Dice */}
          {dice.map(die => (
            <DieComponent
              key={die.id}
              x={die.x}
              y={die.y}
              faces={die.faces}
              result={die.lastResult}
              onRoll={() => rollDie(die.id)}
            />
          ))}

          {/* Discarded cards (all decks) */}
          {decks.flatMap(dk => dk.discard).map(card => (
            <CardComponent key={card.id} card={card} />
          ))}

          {/* Hand cards */}
          {activePlayer?.hand.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              onPlay={() => playCard(card.id)}
            />
          ))}

          {/* Pawns */}
          {pawns.map(pawn => (
            <PawnComponent key={pawn.id} pawn={pawn} />
          ))}
        </Layer>
      </Stage>

      {/* Tile palette */}
      <TilePalette
        onAdd={model => {
          const { x, y } = viewportCenter();
          addTile(model.shape, model.color, x, y, model.size);
        }}
      />

      {/* HTML overlay: controls */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 15,
            fontWeight: 'bold',
            textAlign: 'right',
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            lineHeight: 1.4,
          }}
        >
          Tour de / Turn of :<br />
          <span style={{ color: '#f0e68c' }}>{activePlayer?.name ?? ''}</span>
        </div>

        <button
          onClick={endTurn}
          style={{ ...BTN, background: '#c0392b' }}
          onMouseOver={hover}
          onMouseOut={unhover}
        >
          Passer le tour / End turn
        </button>

        <button
          onClick={rollDice}
          style={{ ...BTN, background: '#2980b9' }}
          onMouseOver={hover}
          onMouseOut={unhover}
        >
          Lancer les dés / Roll all
        </button>

        {/* Menu button */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ ...BTN, background: 'rgba(0,0,0,0.55)', fontSize: 18, padding: '8px 14px' }}
            onMouseOver={hover}
            onMouseOut={unhover}
            aria-label="Menu"
          >
            ☰
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              background: 'rgba(20,20,20,0.92)',
              borderRadius: 8,
              padding: '10px 14px',
              minWidth: 210,
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 12,
                lineHeight: 1.7,
                textShadow: '0 1px 2px rgba(0,0,0,0.7)',
              }}>
                Clic/Tap : retourner / Flip<br />
                Dbl-clic/Tap : jouer / Play<br />
                Tap dé : rouler ce dé / Roll die<br />
                Glisser : déplacer / Drag<br />
                2 doigts : zoom + pan
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: 0 }} />
              <button
                onClick={() => { closeMenu(); goToSetup(); }}
                style={{ ...BTN, background: '#7f8c8d', textAlign: 'left' }}
                onMouseOver={hover}
                onMouseOut={unhover}
              >
                Nouvelle partie / New game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
