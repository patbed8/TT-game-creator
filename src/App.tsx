import { useGameStore } from './store/gameStore';
import SetupScreen from './components/SetupScreen';
import GameTable from './components/GameTable';

export default function App() {
  const screen = useGameStore(s => s.screen);
  return screen === 'setup' ? <SetupScreen /> : <GameTable />;
}
