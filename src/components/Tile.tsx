import { useRef } from 'react';
import { Group, Rect, RegularPolygon, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Tile } from '../types';
import { useGameStore } from '../store/gameStore';

interface TileProps {
  tile: Tile;
}

export default function TileComponent({ tile }: TileProps) {
  const { moveTile, removeTile } = useGameStore();
  const lastDblTime = useRef(0);

  function handleDragEnd(e: KonvaEventObject<DragEvent>) {
    moveTile(tile.id, e.target.x(), e.target.y());
  }

  function handleDblClick() {
    const now = Date.now();
    if (now - lastDblTime.current < 300) return;
    lastDblTime.current = now;
    removeTile(tile.id);
  }

  return (
    <Group
      x={tile.x}
      y={tile.y}
      draggable
      onDragEnd={handleDragEnd}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
    >
      {tile.shape === 'square' ? (
        <Rect
          x={-tile.size / 2}
          y={-tile.size / 2}
          width={tile.size}
          height={tile.size}
          fill={tile.color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={1.5}
          cornerRadius={3}
          shadowColor="black"
          shadowBlur={4}
          shadowOffset={{ x: 1, y: 2 }}
          shadowOpacity={0.3}
        />
      ) : (
        // sides=6 default is pointy-top; rotation=30 makes it flat-top
        <RegularPolygon
          sides={6}
          radius={tile.size}
          rotation={30}
          fill={tile.color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={1.5}
          shadowColor="black"
          shadowBlur={4}
          shadowOffset={{ x: 1, y: 2 }}
          shadowOpacity={0.3}
        />
      )}
      {tile.content && (
        <Text
          x={-tile.size / 2}
          y={-8}
          width={tile.size}
          text={tile.content}
          fill="rgba(255,255,255,0.9)"
          fontSize={12}
          align="center"
        />
      )}
    </Group>
  );
}
