import { useState } from "react";
import IntroScreen from "@/pages/IntroScreen";
import GameScreen from "@/pages/GameScreen";

export default function App() {
  const [started, setStarted] = useState(false);

  return started ? <GameScreen /> : <IntroScreen onComplete={() => setStarted(true)} />;
}
