import { Rect, Text } from 'react-konva';

interface HandProps {
  playerName: string;
  tableWidth: number;
  cardHeight: number;
  zoneY: number;
}

// Renders only the visual background zone — cards are rendered separately in GameTable
export default function Hand({ playerName, tableWidth, cardHeight, zoneY }: HandProps) {
  return (
    <>
      <Rect
        x={0}
        y={zoneY - 28}
        width={tableWidth}
        height={cardHeight + 38}
        fill="rgba(0,0,0,0.22)"
      />
      <Text
        x={12}
        y={zoneY - 22}
        text={`Main de / Hand of : ${playerName}`}
        fill="rgba(255,255,255,0.75)"
        fontSize={13}
      />
    </>
  );
}
