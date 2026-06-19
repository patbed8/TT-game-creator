import { useRef } from 'react';
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
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDblTime = useRef(0);

  const isStandard = card.suit !== undefined && card.rank !== undefined;
  const isRed = isStandard && RED_SUITS.has(card.suit!);
  const ink = isRed ? '#c0392b' : '#111';
  const sym = isStandard ? SUIT_SYMBOL[card.suit!] : '';

  // Face-up background: use card.color if defined (colored-series cards), else white
  const faceUpBg = card.color ?? 'white';
  const faceUpStroke = card.color ? card.color : '#bbb';
  const valueInk = card.color ? 'white' : '#111';

  function handleClick() {
    if (!onPlay) {
      flipCard(card.id);
      return;
    }
    if (clickTimer.current !== null) return;
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      flipCard(card.id);
    }, 220);
  }

  function handleDblClick() {
    if (!onPlay) return;
    const now = Date.now();
    if (now - lastDblTime.current < 300) return;
    lastDblTime.current = now;
    if (clickTimer.current !== null) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    onPlay();
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
      onTap={handleClick}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={CARD_W}
        height={CARD_H}
        fill={card.face === 'face-up' ? faceUpBg : '#1a3a6b'}
        cornerRadius={6}
        stroke={card.face === 'face-up' ? faceUpStroke : '#2a4a8b'}
        strokeWidth={1}
        shadowColor="black"
        shadowBlur={5}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.35}
      />

      {card.face === 'face-up' ? (
        isStandard ? (
          // Standard deck: suit + rank layout
          <>
            <Text x={5} y={5} text={card.rank} fontSize={13} fill={ink} fontStyle="bold" />
            <Text x={5} y={19} text={sym} fontSize={12} fill={ink} />
            <Text x={0} y={CARD_H / 2 - 14} width={CARD_W} text={sym} fontSize={26} fill={ink} align="center" />
            <Text x={CARD_W - 5} y={CARD_H - 6} text={card.rank} fontSize={13} fill={ink} fontStyle="bold" rotation={180} />
            <Text x={CARD_W - 5} y={CARD_H - 20} text={sym} fontSize={12} fill={ink} rotation={180} />
          </>
        ) : (
          // Numbered / colored-series: centered value or label
          <Text
            x={0}
            y={CARD_H / 2 - 14}
            width={CARD_W}
            text={card.label ?? (card.value !== undefined ? String(card.value) : '?')}
            fontSize={28}
            fontStyle="bold"
            fill={valueInk}
            align="center"
          />
        )
      ) : (
        <>
          <Rect x={4} y={4} width={CARD_W - 8} height={CARD_H - 8} fill="#c0392b" cornerRadius={4} />
          <Rect x={8} y={8} width={CARD_W - 16} height={CARD_H - 16} fill="#1a3a6b" cornerRadius={2} />
        </>
      )}
    </Group>
  );
}
