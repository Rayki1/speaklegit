import { useEffect, useMemo, useRef, useState } from "react";
import TwoPlayerGameFrame from "../components/TwoPlayerGameFrame";
import { stopCategories } from "../utils/twoPlayerData";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ROUND_SECONDS = 60;

function StopCategories() {
  const [letter, setLetter] = useState("?");
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const progress = useMemo(() => (secondsLeft / ROUND_SECONDS) * 100, [secondsLeft]);

  const playStopSound = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(740, ctx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.35);
  };

  const clearTicker = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = () => {
    clearTicker();
    setSecondsLeft(ROUND_SECONDS);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTicker();
          setIsRunning(false);
          playStopSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateLetter = () => {
    const randomIndex = Math.floor(Math.random() * LETTERS.length);
    setLetter(LETTERS[randomIndex]);
    startTimer();
  };

  const handleStop = () => {
    if (!isRunning) {
      return;
    }
    clearTicker();
    setIsRunning(false);
    playStopSound();
  };

  useEffect(() => {
    return () => {
      clearTicker();
    };
  }, []);

  return (
    <TwoPlayerGameFrame
      title="STOP Game (Categories)"
      subtitle="Generate a letter, race 60 seconds, then shout STOP."
      howToPlaySteps={[
        "Press GENERATE LETTER to start a 60-second round, then both players quickly write or say words for Name, Place, Animal, Food, and Object using that letter.",
        "Press STOP any time to freeze the timer and review answers; valid unique words score points while duplicates or wrong starting letters do not score.",
      ]}
    >
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 p-5 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Current Letter</p>
          <p className="text-6xl md:text-7xl font-black text-slate-800">{letter}</p>
        </div>

        <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Timer</p>
            <p className="text-3xl font-black text-slate-800">{secondsLeft}s</p>
          </div>
          <div className="h-4 rounded-full bg-white border border-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stopCategories.map((category) => (
            <div key={category} className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Category</p>
              <p className="mt-1 text-lg font-bold text-slate-800">{category}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={generateLetter}
            className="w-full rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base py-3 transition-all duration-300 hover:-translate-y-0.5"
          >
            GENERATE LETTER
          </button>

          <button
            type="button"
            onClick={handleStop}
            className="w-full rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-base py-3 transition-all duration-300 hover:-translate-y-0.5"
          >
            STOP
          </button>
        </div>
      </div>
    </TwoPlayerGameFrame>
  );
}

export default StopCategories;
