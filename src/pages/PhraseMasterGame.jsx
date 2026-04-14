import { useState } from "react";
import PhraseMaster from "../modules/PhraseMaster";
import DifficultySelector from "../components/DifficultySelector";
import { getNextDifficulty } from "../utils/scoring";

export default function PhraseMasterGame() {
  const [difficulty, setDifficulty] = useState(null);
  if (!difficulty) return <DifficultySelector onSelect={setDifficulty} />;
  return <PhraseMaster key={difficulty} difficulty={difficulty} onNextDifficulty={() => setDifficulty(getNextDifficulty(difficulty) || difficulty)} />;
}
