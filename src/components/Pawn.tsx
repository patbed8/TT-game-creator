import { Circle } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Pawn } from '../types';
import { useGameStore } from '../store/gameStore';
import { findNearestCell } from '../engine/boardUtils';

interface PawnProps {
  pawn: Pawn;
}

export default function PawnComponent({ pawn }: PawnProps) {
  const board = useGameStore(s => s.board);
  const movePawn = useGameStore(s => s.movePawn);

  function handleDragEnd(e: KonvaEventObject<DragEvent>) {
    const x = e.target.x();
    const y = e.target.y();

    if (!board) {
      e.target.position({ x: pawn.x, y: pawn.y });
      return;
    }

    const cellId = findNearestCell(board, x, y);
    if (cellId) {
      movePawn(pawn.id, cellId);
    } else {
      // No valid cell nearby — snap back to current cell
      e.target.position({ x: pawn.x, y: pawn.y });
    }
  }

  return (
    <Circle
      x={pawn.x}
      y={pawn.y}
      radius={16}
      fill={pawn.color}
      stroke="white"
      strokeWidth={2.5}
      draggable
      shadowColor="black"
      shadowBlur={5}
      shadowOffset={{ x: 2, y: 2 }}
      shadowOpacity={0.4}
      onDragEnd={handleDragEnd}
    />
  );
}
