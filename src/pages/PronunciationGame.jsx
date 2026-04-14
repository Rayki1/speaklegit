import { useState, useContext } from "react";
import Pronunciation from "../modules/Pronunciation";
import AdMockup from "../components/AdMockup";
import DifficultySelector from "../components/DifficultySelector";
import { UserContext } from "../context/UserContext";
import { getNextDifficulty } from "../utils/scoring";

export default function PronunciationGame() {
  const { user } = useContext(UserContext);
  const [showAd, setShowAd] = useState(!user.premium);
  const [difficulty, setDifficulty] = useState(null);
  const isAdActive = showAd && !user.premium;

  // Show difficulty selector if no difficulty chosen yet
  if (!difficulty) {
    return <DifficultySelector onSelect={setDifficulty} />;
  }

  return (
    <>
      <Pronunciation
        key={difficulty}
        difficulty={difficulty}
        isAdActive={isAdActive}
        onNextDifficulty={() => setDifficulty(getNextDifficulty(difficulty) || difficulty)}
      />


      {/* Ad System */}
      <AdMockup 
        showAd={isAdActive}
        onClose={() => setShowAd(false)}
      />
    </>
  );
}
