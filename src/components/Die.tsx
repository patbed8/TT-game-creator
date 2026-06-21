import { Group, Rect, Text } from 'react-konva';

interface DieProps {
  x: number;
  y: number;
  faces: number;
  label: string;
  result: number | null;
  onRoll?: () => void;
}

const SIZE = 52;

export default function DieComponent({ x, y, faces, label, result, onRoll }: DieProps) {
  return (
    <Group x={x} y={y} onClick={onRoll} onTap={onRoll}>
      <Text
        y={-18}
        text={label}
        fill="rgba(255,255,255,0.75)"
        fontSize={12}
      />
      <Rect
        width={SIZE}
        height={SIZE}
        fill="white"
        cornerRadius={8}
        stroke="#4a9eff"
        strokeWidth={1.5}
        shadowColor="black"
        shadowBlur={5}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.35}
      />
      <Text
        width={SIZE}
        height={SIZE}
        text={result !== null ? String(result) : '?'}
        align="center"
        verticalAlign="middle"
        fontSize={result !== null ? 24 : 20}
        fontStyle="bold"
        fill="#1a1a1a"
      />
      <Text
        y={SIZE + 5}
        width={SIZE}
        text={`d${faces}`}
        align="center"
        fontSize={11}
        fill="rgba(255,255,255,0.55)"
      />
    </Group>
  );
}
