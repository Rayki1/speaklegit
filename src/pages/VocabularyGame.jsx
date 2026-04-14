import { useState } from "react";
import Vocabulary from "../modules/Vocabulary";
import DifficultySelector from "../components/DifficultySelector";
import { getNextDifficulty } from "../utils/scoring";

export default function VocabularyGame() {
  const [difficulty, setDifficulty] = useState(null);

  // Show difficulty selector if no difficulty chosen yet
  if (!difficulty) {
    return <DifficultySelector onSelect={setDifficulty} />;
  }

  return <Vocabulary key={difficulty} difficulty={difficulty} onNextDifficulty={() => setDifficulty(getNextDifficulty(difficulty) || difficulty)} />;
}
