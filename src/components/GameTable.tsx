import { useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useGameStore } from '../store/gameStore';
import CardComponent from './Card';
import DeckZone from './Deck';
import Hand from './Hand';
import SharedZone from './SharedZone';

const CARD_W = 70;
const CARD_H = 100;

function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

export default function GameTable() {
  const { w, h } = useWindowSize();
  const { deck, discard, players, activePlayerId, drawCard, playCard, endTurn } = useGameStore();
  const activePlayer = players.find(p => p.id === activePlayerId);

  const handY = h - CARD_H - 40;
  const sharedY = 70;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Stage width={w} height={h}>
        <Layer>
          {/* Hand background zone (below everything) */}
          {activePlayer && (
            <Hand
              playerName={activePlayer.name}
              tableWidth={w}
              cardHeight={CARD_H}
              zoneY={handY}
            />
          )}

          {/* Shared zone dashed border */}
          <SharedZone centerX={w / 2} y={sharedY} cardHeight={CARD_H} />

          {/* Deck */}
          <DeckZone
            x={30}
            y={60}
            cardCount={deck.length}
            cardWidth={CARD_W}
            cardHeight={CARD_H}
            onDraw={drawCard}
          />

          {/* Shared zone cards */}
          {discard.map(card => (
            <CardComponent key={card.id} card={card} />
          ))}

          {/* Active player's hand cards (rendered last = always on top) */}
          {activePlayer?.hand.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              onPlay={() => playCard(card.id)}
            />
          ))}
        </Layer>
      </Stage>

      {/* HTML overlay: turn indicator + controls */}
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
          style={{
            padding: '9px 18px',
            background: '#c0392b',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.45)',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#e74c3c')}
          onMouseOut={e => (e.currentTarget.style.background = '#c0392b')}
        >
          Passer le tour / End turn
        </button>

        <div
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 11,
            textAlign: 'right',
            textShadow: '0 1px 2px rgba(0,0,0,0.7)',
            lineHeight: 1.6,
          }}
        >
          Clic : retourner / Flip<br />
          Double-clic : jouer / Play<br />
          Glisser : déplacer / Drag
        </div>
      </div>
    </div>
  );
}
