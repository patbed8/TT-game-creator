import { Group, Rect, Text } from 'react-konva';

interface DeckProps {
  x: number;
  y: number;
  cardCount: number;
  cardWidth: number;
  cardHeight: number;
  onDraw: () => void;
}

export default function DeckZone({ x, y, cardCount, cardWidth, cardHeight, onDraw }: DeckProps) {
  return (
    <Group x={x} y={y}>
      <Text
        y={-20}
        text="Pioche / Deck"
        fill="rgba(255,255,255,0.8)"
        fontSize={13}
      />

      {cardCount > 0 ? (
        <Group onClick={onDraw}>
          {/* Stacked shadow cards for depth */}
          <Rect x={4} y={4} width={cardWidth} height={cardHeight} fill="#0f2040" cornerRadius={6} />
          <Rect x={2} y={2} width={cardWidth} height={cardHeight} fill="#152a52" cornerRadius={6} />
          {/* Top card */}
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
        <Rect
          width={cardWidth}
          height={cardHeight}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1.5}
          cornerRadius={6}
          dash={[6, 4]}
        />
      )}

      <Text
        y={cardHeight + 6}
        text={`${cardCount} carte${cardCount !== 1 ? 's' : ''}`}
        fill="rgba(255,255,255,0.55)"
        fontSize={11}
      />
    </Group>
  );
}
