import { type CSSProperties, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useGameStore } from '../store/gameStore';
import CardComponent from './Card';
import DeckZone from './Deck';
import Hand from './Hand';
import SharedZone from './SharedZone';
import BoardComponent from './Board';
import PawnComponent from './Pawn';
import DieComponent from './Die';

const CARD_W = 70;
const CARD_H = 100;
const DIE_X = 150;
const DIE_Y = 60;

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
  padding: '9px 18px',
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
    deck, discard, players, activePlayerId, board, pawns, dice,
    drawCard, playCard, endTurn, rollDice, toggleBoardType,
  } = useGameStore();
  const activePlayer = players.find(p => p.id === activePlayerId);

  const handY = h - CARD_H - 40;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Stage width={w} height={h}>
        <Layer>
          {/* Board — rendered first so it stays below everything else */}
          {board && <BoardComponent board={board} />}

          {/* Hand and shared zone backgrounds */}
          {activePlayer && (
            <Hand playerName={activePlayer.name} tableWidth={w} cardHeight={CARD_H} zoneY={handY} />
          )}
          <SharedZone centerX={w / 2} y={70} cardHeight={CARD_H} />

          {/* Deck and die (top-left area) */}
          <DeckZone
            x={30}
            y={60}
            cardCount={deck.length}
            cardWidth={CARD_W}
            cardHeight={CARD_H}
            onDraw={drawCard}
          />
          <DieComponent x={DIE_X} y={DIE_Y} faces={dice.faces} result={dice.lastResult} />

          {/* Cards — shared zone then hand (hand on top) */}
          {discard.map(card => (
            <CardComponent key={card.id} card={card} />
          ))}
          {activePlayer?.hand.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              onPlay={() => playCard(card.id)}
            />
          ))}

          {/* Pawns — topmost layer */}
          {pawns.map(pawn => (
            <PawnComponent key={pawn.id} pawn={pawn} />
          ))}
        </Layer>
      </Stage>

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
        {/* Turn indicator */}
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
          Lancer le dé / Roll die
        </button>

        <button
          onClick={toggleBoardType}
          style={{ ...BTN, background: '#27ae60' }}
          onMouseOver={hover}
          onMouseOut={unhover}
        >
          {board?.type === 'grid'
            ? 'Parcours / Path board'
            : 'Grille / Grid board'}
        </button>

        {/* Interaction hints */}
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
