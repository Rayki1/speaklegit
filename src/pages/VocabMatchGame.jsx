import { useState } from "react";
import VocabMatch from "../modules/VocabMatch";
import DifficultySelector from "../components/DifficultySelector";
import { getNextDifficulty } from "../utils/scoring";

export default function VocabMatchGame() {
  const [difficulty, setDifficulty] = useState(null);
  if (!difficulty) return <DifficultySelector onSelect={setDifficulty} />;
  return <VocabMatch key={difficulty} difficulty={difficulty} onNextDifficulty={() => setDifficulty(getNextDifficulty(difficulty) || difficulty)} />;
}
