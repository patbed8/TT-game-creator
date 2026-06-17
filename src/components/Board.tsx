import { Group, Rect, Text } from 'react-konva';
import type { BoardConfig } from '../types';

interface BoardProps {
  board: BoardConfig;
}

export default function BoardComponent({ board }: BoardProps) {
  const { cells, cellSize } = board;
  const half = cellSize / 2;
  const fontSize = Math.max(10, Math.round(cellSize * 0.22));

  return (
    <>
      {cells.map(cell => (
        <Group key={cell.id} x={cell.x - half} y={cell.y - half}>
          <Rect
            width={cellSize}
            height={cellSize}
            fill={cell.color ?? '#dbc9a0'}
            stroke="#8b7355"
            strokeWidth={1}
          />
          <Text
            width={cellSize}
            height={cellSize}
            text={cell.label ?? ''}
            align="center"
            verticalAlign="middle"
            fontSize={fontSize}
            fill="#4a3728"
          />
        </Group>
      ))}
    </>
  );
}
