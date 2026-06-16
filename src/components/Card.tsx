import { Group, Rect, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Card } from '../types';
import { useGameStore } from '../store/gameStore';

const CARD_W = 70;
const CARD_H = 100;

const SUIT_SYMBOL: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const RED_SUITS = new Set(['hearts', 'diamonds']);

interface CardProps {
  card: Card;
  onPlay?: () => void;
}

export default function CardComponent({ card, onPlay }: CardProps) {
  const { flipCard, moveCard } = useGameStore();

  const isRed = RED_SUITS.has(card.suit);
  const ink = isRed ? '#c0392b' : '#111';
  const sym = SUIT_SYMBOL[card.suit];

  function handleClick() {
    flipCard(card.id);
  }

  function handleDblClick() {
    onPlay?.();
  }

  function handleDragEnd(e: KonvaEventObject<DragEvent>) {
    moveCard(card.id, e.target.x(), e.target.y());
  }

  return (
    <Group
      x={card.x}
      y={card.y}
      draggable
      onClick={handleClick}
      onDblClick={handleDblClick}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={CARD_W}
        height={CARD_H}
        fill={card.face === 'face-up' ? 'white' : '#1a3a6b'}
        cornerRadius={6}
        stroke={card.face === 'face-up' ? '#bbb' : '#2a4a8b'}
        strokeWidth={1}
        shadowColor="black"
        shadowBlur={5}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.35}
      />

      {card.face === 'face-up' ? (
        <>
          <Text x={5} y={5} text={card.rank} fontSize={13} fill={ink} fontStyle="bold" />
          <Text x={5} y={19} text={sym} fontSize={12} fill={ink} />
          <Text
            x={0}
            y={CARD_H / 2 - 14}
            width={CARD_W}
            text={sym}
            fontSize={26}
            fill={ink}
            align="center"
          />
          <Text
            x={CARD_W - 5}
            y={CARD_H - 6}
            text={card.rank}
            fontSize={13}
            fill={ink}
            fontStyle="bold"
            rotation={180}
          />
          <Text
            x={CARD_W - 5}
            y={CARD_H - 20}
            text={sym}
            fontSize={12}
            fill={ink}
            rotation={180}
          />
        </>
      ) : (
        <>
          {/* Card back: two nested rectangles */}
          <Rect x={4} y={4} width={CARD_W - 8} height={CARD_H - 8} fill="#c0392b" cornerRadius={4} />
          <Rect x={8} y={8} width={CARD_W - 16} height={CARD_H - 16} fill="#1a3a6b" cornerRadius={2} />
        </>
      )}
    </Group>
  );
}
