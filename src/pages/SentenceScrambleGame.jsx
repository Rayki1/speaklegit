import { useState } from "react";
import SentenceScramble from "../modules/SentenceScramble";
import DifficultySelector from "../components/DifficultySelector";
import { getNextDifficulty } from "../utils/scoring";

export default function SentenceScrambleGame() {
  const [difficulty, setDifficulty] = useState(null);
  if (!difficulty) return <DifficultySelector onSelect={setDifficulty} />;
  return <SentenceScramble key={difficulty} difficulty={difficulty} onNextDifficulty={() => setDifficulty(getNextDifficulty(difficulty) || difficulty)} />;
}
