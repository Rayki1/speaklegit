import { useMemo, useState } from "react";
import TwoPlayerGameFrame from "../components/TwoPlayerGameFrame";
import GameEndOverlay from "../components/GameEndOverlay";
import { passwordNouns } from "../utils/twoPlayerData";

function PasswordDescriber() {
  const [wordIndex, setWordIndex] = useState(0);
  const [showWord, setShowWord] = useState(false);
  const [playerAScore, setPlayerAScore] = useState(0);
  const [playerBScore, setPlayerBScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const roundLength = 10;

  const shuffledWords = useMemo(() => {
    const words = [...passwordNouns];
    for (let i = words.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  }, []);

  const currentWord = shuffledWords[wordIndex % shuffledWords.length];

  return (
    <TwoPlayerGameFrame
      title="Password Describer"
      subtitle="Hold Reveal Word so only the describing player can see it."
      floatingHud={
        <div className="rounded-2xl border border-white/15 bg-black/45 px-4 py-3 text-right shadow-2xl">
          <p className="text-[10px] arcade-title tracking-[0.18em] text-white/60">SCORES</p>
          <p className="text-lg font-black text-sky-300">A: {playerAScore}</p>
          <p className="text-lg font-black text-indigo-300">B: {playerBScore}</p>
        </div>
      }
      howToPlaySteps={[
        "Player A (or B) holds REVEAL WORD and quietly reads the secret noun, then releases immediately so the other player cannot peek.",
        "Describe the noun without saying the exact word or spelling it; if teammate guesses correctly, award +1 to the correct player and press Next Word.",
      ]}
    >
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 md:p-6 text-center min-h-[170px] flex flex-col items-center justify-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">Secret Word</p>
          <p className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight min-h-[60px]">
            {showWord ? currentWord : "••••••"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setPlayerAScore((prev) => prev + 1)}
            className="w-full rounded-2xl bg-sky-100 hover:bg-sky-200 text-slate-800 font-semibold py-3 transition-all duration-300 hover:-translate-y-0.5"
          >
            +1 Player A
          </button>

          <button
            type="button"
            onClick={() => setPlayerBScore((prev) => prev + 1)}
            className="w-full rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-slate-800 font-semibold py-3 transition-all duration-300 hover:-translate-y-0.5"
          >
            +1 Player B
          </button>

          <button
            type="button"
            onMouseDown={() => setShowWord(true)}
            onMouseUp={() => setShowWord(false)}
            onMouseLeave={() => setShowWord(false)}
            onTouchStart={() => setShowWord(true)}
            onTouchEnd={() => setShowWord(false)}
            className="w-full rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-slate-900 font-bold py-3 transition-all duration-300 hover:-translate-y-0.5"
          >
            Reveal Word (Hold)
          </button>

          <button
            type="button"
            onClick={() => {
              setShowWord(false);
              if (wordIndex + 1 >= roundLength) {
                setRoundComplete(true);
                return;
              }
              setWordIndex((prev) => prev + 1);
            }}
            className="w-full rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 transition-all duration-300 hover:-translate-y-0.5"
          >
            Next Word
          </button>
        </div>

        <GameEndOverlay
          open={roundComplete}
          title="Password Describer Complete"
          score={playerAScore + playerBScore}
          practiced={roundLength}
          onReplay={() => {
            setRoundComplete(false);
            setWordIndex(0);
            setShowWord(false);
            setPlayerAScore(0);
            setPlayerBScore(0);
          }}
          exitTo="/twoplayer"
        />
      </div>
    </TwoPlayerGameFrame>
  );
}

export default PasswordDescriber;
