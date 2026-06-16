import { Rect, Text } from 'react-konva';

interface SharedZoneProps {
  centerX: number;
  y: number;
  cardHeight: number;
}

// Renders only the visual dashed border — cards are rendered separately in GameTable
export default function SharedZone({ centerX, y, cardHeight }: SharedZoneProps) {
  const zoneW = 340;
  return (
    <>
      <Text
        x={centerX - 90}
        y={y - 22}
        text="Zone partagée / Shared zone"
        fill="rgba(255,255,255,0.65)"
        fontSize={13}
      />
      <Rect
        x={centerX - zoneW / 2}
        y={y - 4}
        width={zoneW}
        height={cardHeight + 24}
        stroke="rgba(255,255,255,0.28)"
        strokeWidth={1.5}
        cornerRadius={8}
        dash={[7, 5]}
      />
    </>
  );
}
