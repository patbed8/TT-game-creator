import { useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';

interface DeckProps {
  x: number;
  y: number;
  label: string;
  cardCount: number;
  discardCount: number;
  cardWidth: number;
  cardHeight: number;
  onDraw: () => void;
}

export default function DeckZone({ x, y, label, cardCount, discardCount, cardWidth, cardHeight, onDraw }: DeckProps) {
  const lastDrawTime = useRef(0);
  const discardX = cardWidth + 10;

  function handleDraw() {
    const now = Date.now();
    if (now - lastDrawTime.current < 300) return;
    lastDrawTime.current = now;
    onDraw();
  }

  return (
    <Group x={x} y={y}>
      {/* Deck label */}
      <Text
        y={-20}
        text={label}
        fill="rgba(255,255,255,0.8)"
        fontSize={12}
      />

      {/* ── Deck stack ── */}
      {cardCount > 0 ? (
        <Group onClick={handleDraw} onTap={handleDraw}>
          <Rect x={4} y={4} width={cardWidth} height={cardHeight} fill="#0f2040" cornerRadius={6} />
          <Rect x={2} y={2} width={cardWidth} height={cardHeight} fill="#152a52" cornerRadius={6} />
          <Rect
            width={cardWidth}
            height={cardHeight}
            fill="#1a3a6b"
            cornerRadius={6}
            stroke="#2a4a8b"
            strokeWidth={1}
            shadowColor="black"
            shadowBlur={5}
            shadowOffset={{ x: 2, y: 2 }}
            shadowOpacity={0.4}
          />
          <Rect x={4} y={4} width={cardWidth - 8} height={cardHeight - 8} fill="#c0392b" cornerRadius={4} />
          <Rect x={8} y={8} width={cardWidth - 16} height={cardHeight - 16} fill="#1a3a6b" cornerRadius={2} />
          <Text
            x={0}
            y={cardHeight / 2 - 10}
            width={cardWidth}
            text={String(cardCount)}
            fill="white"
            fontSize={16}
            fontStyle="bold"
            align="center"
          />
        </Group>
      ) : (
        // Empty deck — clickable if discard has cards (triggers auto-reshuffle in engine)
        <Group onClick={discardCount > 0 ? handleDraw : undefined} onTap={discardCount > 0 ? handleDraw : undefined}>
          <Rect
            width={cardWidth}
            height={cardHeight}
            fill={discardCount > 0 ? 'rgba(255,200,100,0.08)' : 'transparent'}
            stroke={discardCount > 0 ? 'rgba(255,200,100,0.55)' : 'rgba(255,255,255,0.25)'}
            strokeWidth={1.5}
            cornerRadius={6}
            dash={[6, 4]}
          />
          {discardCount > 0 && (
            <Text
              width={cardWidth}
              height={cardHeight}
              text="↺"
              align="center"
              verticalAlign="middle"
              fontSize={30}
              fill="rgba(255,200,100,0.75)"
            />
          )}
        </Group>
      )}
      <Text
        y={cardHeight + 6}
        text={`${cardCount} carte${cardCount !== 1 ? 's' : ''}`}
        fill="rgba(255,255,255,0.55)"
        fontSize={11}
      />

      {/* ── Discard pile ── */}
      <Text
        x={discardX}
        y={-20}
        text="Défausse / Discard"
        fill="rgba(255,255,255,0.55)"
        fontSize={10}
      />
      <Rect
        x={discardX}
        width={cardWidth}
        height={cardHeight}
        fill={discardCount > 0 ? 'rgba(192,57,43,0.25)' : 'transparent'}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1.5}
        cornerRadius={6}
        dash={discardCount === 0 ? [6, 4] : undefined}
      />
      {discardCount > 0 && (
        <Text
          x={discardX}
          y={cardHeight / 2 - 10}
          width={cardWidth}
          text={String(discardCount)}
          fill="rgba(255,255,255,0.8)"
          fontSize={16}
          fontStyle="bold"
          align="center"
        />
      )}
      <Text
        x={discardX}
        y={cardHeight + 6}
        text={`${discardCount} défaussé${discardCount !== 1 ? 's' : ''}`}
        fill="rgba(255,255,255,0.4)"
        fontSize={11}
      />
    </Group>
  );
}
