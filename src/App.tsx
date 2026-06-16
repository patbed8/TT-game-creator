import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import GameTable from './components/GameTable';

export default function App() {
  const initGame = useGameStore(s => s.initGame);

  useEffect(() => {
    initGame();
  }, [initGame]);

  return <GameTable />;
}
