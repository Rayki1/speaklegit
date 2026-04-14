import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DifficultySelector from "../components/DifficultySelector";
import { spellingWords } from "../utils/wordPools";
import useErrorSound from "../hooks/useErrorSound";
import useTapSound from "../hooks/useTapSound";

const PLAYERS = [
  {
    id: "A",
    name: "Player A",
    accent: "from-pink-500/25 to-fuchsia-500/10",
    glow: "shadow-[0_0_30px_rgba(236,72,153,0.12)]",
    text: "text-pink-200",
    border: "border-pink-400/30",
    track: "from-pink-400 via-fuchsia-500 to-orange-300",
  },
  {
    id: "B",
    name: "Player B",
    accent: "from-cyan-500/25 to-blue-500/10",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.12)]",
    text: "text-cyan-200",
    border: "border-cyan-400/30",
    track: "from-cyan-400 via-blue-500 to-indigo-300",
  },
];

const ROUND_DELAY = 1200;
const COUNTDOWN_STEPS = ["3", "2", "1", "GO!"];
const FIRST_FINISHER_BONUS = 5;
const TUG_STEP = 18;
const FAST_SOLVE_THRESHOLD_MS = 6000;
const RACE_WORD_LENGTHS = [5, 7, 9];

function shuffleWord(word) {
  const letters = word.split("");
  for (let index = letters.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [letters[index], letters[swapIndex]] = [letters[swapIndex], letters[index]];
  }
  return letters;
}

function getTargetWordLength(lapLevel) {
  return RACE_WORD_LENGTHS[Math.min(lapLevel, RACE_WORD_LENGTHS.length - 1)];
}

function getWordPool(difficulty, targetLength) {
  const basePool = spellingWords[difficulty] || spellingWords.medium;
  const exactMatches = basePool.filter((word) => word.length === targetLength);
  if (exactMatches.length) {
    return exactMatches;
  }

  const nearbyMatches = basePool.filter((word) => Math.abs(word.length - targetLength) <= 1);
  if (nearbyMatches.length) {
    return nearbyMatches;
  }

  const allWords = [...new Set(Object.values(spellingWords).flat())];
  const fallbackMatches = allWords.filter((word) => word.length === targetLength);
  if (fallbackMatches.length) {
    return fallbackMatches;
  }

  return basePool;
}

function shuffleArray(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function createPlayerState() {
  return {
    selectedTileIds: [],
    answer: [],
    score: 0,
    streak: 0,
    roundWins: 0,
    feedback: null,
  };
}

function formatTimer(seconds) {
  return `${seconds}s`;
}

const SpellingPlayerCard = memo(function SpellingPlayerCard({
  player,
  scrambledLetters,
  word,
  playerState,
  roundLocked,
  winnerFlash,
  onSelectTile,
  onRemoveTile,
  onReset,
  onSubmit,
}) {
  const selectedIdSet = useMemo(() => new Set(playerState.selectedTileIds), [playerState.selectedTileIds]);

  return (
    <section className={`relative h-full min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#12121e]/95 backdrop-blur-2xl shadow-2xl ${player.glow} [touch-action:manipulation]`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${player.track}`}></div>
      <div className={`absolute inset-0 rounded-[2rem] ring-1 ${player.border}`}></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-16 ${player.id === "A" ? "-left-10" : "-right-10"} h-48 w-48 rounded-full bg-gradient-to-br ${player.accent} blur-[110px]`}></div>
      </div>
      {winnerFlash && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-500/10 backdrop-blur-[2px]">
          <div className={`rounded-full border ${player.border} bg-black/55 px-8 py-4 text-center shadow-[0_0_45px_rgba(16,185,129,0.35)] animate-pulse`}>
            <p className="text-[10px] uppercase tracking-[0.45em] text-emerald-200/70">Round Winner</p>
            <p className="mt-2 text-3xl md:text-4xl font-black tracking-[0.3em] text-emerald-200">WINNER</p>
          </div>
        </div>
      )}

      <div className="relative flex h-full flex-col px-5 py-5 md:px-6 md:py-5">
        <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{player.name}</p>
            <h2 className="mt-2 arcade-title text-xl md:text-2xl text-white">Spelling Challenge</h2>
          </div>

          <div className={`rounded-2xl border ${player.border} bg-white/5 px-5 py-3 text-right min-w-[132px]`}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">PTS</p>
            <p className={`mt-1 text-4xl font-black tabular-nums ${player.text}`}>{playerState.score}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-4 min-h-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/50">
              {word.length} Letters
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-orange-200">
              Streak {playerState.streak}
            </div>
          </div>

          {playerState.feedback && (
            <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${playerState.feedback.type === "success" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-rose-400/30 bg-rose-500/10 text-rose-200"}`}>
              {playerState.feedback.message}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pb-4 pt-2">
            {scrambledLetters.map((letter, index) => {
              const tileId = `${player.id}-${index}`;
              const used = selectedIdSet.has(tileId);

              return (
                <button
                  key={tileId}
                  type="button"
                  onPointerDown={() => onSelectTile(player.id, tileId, letter)}
                  disabled={used || roundLocked}
                  className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl border-b-4 text-xl md:text-2xl font-black transition-all touch-manipulation active:translate-y-1 ${
                    used
                      ? "border-white/5 bg-white/5 text-white/20 opacity-40"
                      : "border-black/35 bg-[#1c1d29] text-white hover:-translate-y-1 hover:border-pink-500/30"
                  } disabled:cursor-not-allowed`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-2 pb-4">
            {word.split("").map((_, index) => (
              <button
                key={`${player.id}-slot-${index}`}
                type="button"
                onPointerDown={() => onRemoveTile(player.id, index)}
                disabled={!playerState.answer[index] || roundLocked}
                className={`h-11 w-10 md:h-12 md:w-11 rounded-2xl border-2 flex items-center justify-center text-lg md:text-xl font-black ${
                  playerState.answer[index]
                    ? `bg-white/10 ${player.border} text-white transition-all hover:-translate-y-0.5 active:translate-y-0.5`
                    : "border-white/10 text-white/20"
                } disabled:cursor-not-allowed`}
              >
                {playerState.answer[index] || ""}
              </button>
            ))}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={() => onReset(player.id)}
              disabled={roundLocked}
              className="h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs md:text-sm font-bold tracking-wide transition-all touch-manipulation active:scale-95 disabled:opacity-50"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => onSubmit(player.id)}
              disabled={roundLocked || playerState.answer.length !== word.length}
              className="h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-white/45 text-white text-xs md:text-sm font-black tracking-[0.15em] uppercase transition-all touch-manipulation active:scale-95 disabled:cursor-not-allowed"
            >
              Check
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

function SpellingBattleArena({ difficulty }) {
  const playError = useErrorSound();
  const playTap = useTapSound();
  const [duration, setDuration] = useState(30);
  const [phase, setPhase] = useState("intro");
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lapLevel, setLapLevel] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [roundLocked, setRoundLocked] = useState(false);
  const [showAltClue, setShowAltClue] = useState(false);
  const [tugOffset, setTugOffset] = useState(0);
  const [fastQualifiers, setFastQualifiers] = useState({ A: false, B: false });
  const [players, setPlayers] = useState({ A: createPlayerState(), B: createPlayerState() });
  const [roundWinner, setRoundWinner] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const roundStartedAtRef = useRef(0);

  const targetWordLength = useMemo(() => getTargetWordLength(lapLevel), [lapLevel]);
  const wordPool = useMemo(
    () => shuffleArray(getWordPool(difficulty, targetWordLength)),
    [difficulty, targetWordLength]
  );
  const currentWord = wordPool[currentWordIndex % wordPool.length] || "teacher";
  const currentWordUpper = useMemo(() => currentWord.toUpperCase(), [currentWord]);
  const scrambledLetters = useMemo(() => shuffleWord(currentWordUpper), [currentWordUpper]);
  const wordCluePrimary = useMemo(() => {
    const first = currentWordUpper[0] || "?";
    const last = currentWordUpper[currentWordUpper.length - 1] || "?";
    return `Starts with ${first}, ends with ${last}, and contains exactly ${currentWordUpper.length} letters.`;
  }, [currentWordUpper]);
  const wordClueSecondary = useMemo(() => {
    const vowelCount = (currentWordUpper.match(/[AEIOU]/g) || []).length;
    const uniqueLetters = new Set(currentWordUpper.split("")).size;
    return `Vowel clue: ${vowelCount} vowel${vowelCount === 1 ? "" : "s"} and ${uniqueLetters} unique letter${uniqueLetters === 1 ? "" : "s"}.`;
  }, [currentWordUpper]);
  const activeClue = showAltClue ? wordClueSecondary : wordCluePrimary;
  const roundPoints = difficulty === "hard" ? 15 : difficulty === "medium" ? 10 : 5;
  const lapLabel = lapLevel === 0 ? "Opening Lap" : lapLevel === 1 ? "Pressure Lap" : "Final Lap";
  const leftMomentum = Math.max(0, -tugOffset);
  const rightMomentum = Math.max(0, tugOffset);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    // Reset clue card to first hint whenever a new word appears.
    setShowAltClue(false);
  }, [currentWordUpper]);

  useEffect(() => {
    if (phase !== "countdown") return undefined;

    setCountdownIndex(0);
    const timer = setInterval(() => {
      setCountdownIndex((prev) => {
        if (prev >= COUNTDOWN_STEPS.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setTimeLeft(duration);
            roundStartedAtRef.current = Date.now();
            setPhase("live");
          }, 250);
          return prev;
        }

        return prev + 1;
      });
    }, 650);

    return () => clearInterval(timer);
  }, [phase, duration]);

  useEffect(() => {
    if (phase !== "live") return undefined;

    if (timeLeft <= 0) {
      setResultOpen(true);
      setPhase("results");
      return undefined;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (!roundWinner) return undefined;

    const timer = setTimeout(() => {
      setRoundWinner(null);
      setRoundLocked(false);
      setCurrentWordIndex((prev) => prev + 1);
      setPlayers((prev) => ({
        A: {
          ...prev.A,
          selectedTileIds: [],
          answer: [],
          feedback: prev.A.feedback?.type === "success" ? null : prev.A.feedback,
        },
        B: {
          ...prev.B,
          selectedTileIds: [],
          answer: [],
          feedback: prev.B.feedback?.type === "success" ? null : prev.B.feedback,
        },
      }));
      roundStartedAtRef.current = Date.now();
    }, ROUND_DELAY);

    return () => clearTimeout(timer);
  }, [roundWinner]);

  const handleSelectTile = useCallback((playerId, tileId, letter) => {
    if (phase !== "live" || roundLocked) return;

    let shouldVibrate = false;
    let tileAdded = false;

    setPlayers((prev) => {
      const current = prev[playerId];
      if (current.selectedTileIds.includes(tileId) || current.answer.length >= currentWord.length) {
        return prev;
      }

      tileAdded = true;
      const expectedLetter = currentWordUpper[current.answer.length];
      shouldVibrate = letter === expectedLetter;

      return {
        ...prev,
        [playerId]: {
          ...current,
          selectedTileIds: [...current.selectedTileIds, tileId],
          answer: [...current.answer, letter],
          feedback: current.feedback?.type === "error" ? null : current.feedback,
        },
      };
    });

    if (tileAdded) playTap();
    if (shouldVibrate && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(20);
    }
  }, [phase, roundLocked, currentWord, currentWordUpper, playTap]);

  const handleReset = useCallback((playerId) => {
    playTap();
    setPlayers((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        selectedTileIds: [],
        answer: [],
        feedback: null,
      },
    }));
  }, [playTap]);

  const handleRemoveTile = useCallback((playerId, slotIndex) => {
    if (phase !== "live" || roundLocked) return;

    let removed = false;

    setPlayers((prev) => {
      const current = prev[playerId];
      if (!current.answer[slotIndex]) return prev;

      removed = true;
      const nextAnswer = [...current.answer];
      const nextSelected = [...current.selectedTileIds];
      nextAnswer.splice(slotIndex, 1);
      nextSelected.splice(slotIndex, 1);

      return {
        ...prev,
        [playerId]: {
          ...current,
          answer: nextAnswer,
          selectedTileIds: nextSelected,
          feedback: current.feedback?.type === "error" ? null : current.feedback,
        },
      };
    });

    if (removed) playTap();
  }, [phase, roundLocked, playTap]);

  const handleSubmit = useCallback((playerId) => {
    if (phase !== "live" || roundLocked) return;

    const current = players[playerId];
    const answer = current.answer.join("");
    const attempt = players[playerId].answer.join("");
    if (attempt !== answer) playError();
    const otherPlayerId = playerId === "A" ? "B" : "A";

    if (answer !== currentWordUpper) {
      setPlayers((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          streak: 0,
          feedback: { type: "error", message: "Wrong spelling. Reset and try again." },
        },
      }));
      return;
    }

    const solveDurationMs = roundStartedAtRef.current ? Date.now() - roundStartedAtRef.current : FAST_SOLVE_THRESHOLD_MS + 1;
    const quickSolve = solveDurationMs <= FAST_SOLVE_THRESHOLD_MS;
    const nextStreak = current.streak + 1;
    const streakBonus = nextStreak % 3 === 0 ? 5 : 0;
    const totalPoints = roundPoints + streakBonus + FIRST_FINISHER_BONUS;
    const qualifierState = {
      ...fastQualifiers,
      [playerId]: quickSolve,
    };
    const shouldAdvanceLap = quickSolve && qualifierState.A && qualifierState.B && lapLevel < RACE_WORD_LENGTHS.length - 1;

    setRoundLocked(true);
    setRoundWinner(playerId);
    setTugOffset((prev) => {
      const direction = playerId === "A" ? -1 : 1;
      return Math.max(-100, Math.min(100, prev + direction * TUG_STEP));
    });
    setFastQualifiers(shouldAdvanceLap ? { A: false, B: false } : qualifierState);
    if (shouldAdvanceLap) {
      setLapLevel((prev) => Math.min(prev + 1, RACE_WORD_LENGTHS.length - 1));
    }

    setPlayers((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        score: prev[playerId].score + totalPoints,
        streak: nextStreak,
        roundWins: prev[playerId].roundWins + 1,
        feedback: {
          type: "success",
          message: shouldAdvanceLap
            ? `WINNER! +${totalPoints} and ${getTargetWordLength(Math.min(lapLevel + 1, RACE_WORD_LENGTHS.length - 1))}-letter final lap unlocked.`
            : streakBonus
              ? `WINNER! +${roundPoints}, +${FIRST_FINISHER_BONUS} first-finisher, and +5 streak bonus.`
              : `WINNER! +${roundPoints} and +${FIRST_FINISHER_BONUS} first-finisher bonus.`,
        },
      },
      [otherPlayerId]: {
        ...prev[otherPlayerId],
        feedback: { type: "error", message: `${playerId === "A" ? "Player A" : "Player B"} stole the word.` },
      },
    }));
  }, [phase, roundLocked, players, currentWordUpper, roundPoints, fastQualifiers, lapLevel]);

  const startBattle = () => {
    setPlayers({ A: createPlayerState(), B: createPlayerState() });
    setLapLevel(0);
    setCurrentWordIndex(0);
    setRoundLocked(false);
    setRoundWinner(null);
    setTugOffset(0);
    setFastQualifiers({ A: false, B: false });
    setTimeLeft(duration);
    setCountdownIndex(0);
    setResultOpen(false);
    setPhase("countdown");
  };

  const winner = players.A.score === players.B.score ? null : players.A.score > players.B.score ? "A" : "B";

  return (
    <>
      <Navbar />
      <div className="relative w-full overflow-x-hidden overflow-y-auto scrollbar-hide bg-[#08070f] text-slate-200 font-sans selection:bg-pink-500/30" style={{ height: "calc(100vh - 80px)", marginTop: "80px" }}>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[180px] animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem]"></div>
        </div>

        <main className="relative z-10 min-h-full max-w-[1500px] mx-auto px-3 sm:px-4 py-3">
          <div className="flex min-h-full flex-col gap-4 pb-4">
            <div className="relative rounded-[1.75rem] border border-white/10 bg-[#12121e]/92 backdrop-blur-2xl px-4 py-3 shadow-2xl overflow-hidden">
              <div className="absolute -top-10 left-1/2 h-28 w-80 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[90px] pointer-events-none"></div>
              <div className="relative grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
                <div className="flex flex-wrap items-center justify-start gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center min-w-[110px]">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Timer</p>
                    <p className="mt-1 text-3xl font-black text-yellow-300 tabular-nums">
                      {phase === "countdown" ? COUNTDOWN_STEPS[countdownIndex] : formatTimer(timeLeft)}
                    </p>
                  </div>

                </div>

                <div className="text-center justify-self-center">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Scrambled Tiles</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3 md:gap-4">
                    {scrambledLetters.map((letter, index) => (
                      <div
                        key={`dashboard-${index}-${letter}`}
                        className="flex h-12 w-12 md:h-14 md:w-14 xl:h-16 xl:w-16 items-center justify-center rounded-[1.15rem] border border-white/10 bg-white/5 text-xl md:text-2xl xl:text-3xl font-black text-white shadow-[0_0_20px_rgba(236,72,153,0.08)]"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 w-full min-w-[320px] max-w-[620px]">
                    <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/40">
                      <span>Player A</span>
                      <span>{lapLabel}</span>
                      <span>Player B</span>
                    </div>
                    <div className="relative h-4 overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <div className="absolute inset-y-0 right-1/2 bg-gradient-to-l from-pink-400 via-fuchsia-500 to-orange-300 transition-all duration-500" style={{ width: `${leftMomentum}%` }}></div>
                      <div className="absolute inset-y-0 left-1/2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-300 transition-all duration-500" style={{ width: `${rightMomentum}%` }}></div>
                      <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-[#12121e] shadow-[0_0_25px_rgba(255,255,255,0.12)]"></div>
                    </div>
                    <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white/55">
                      Tug-of-war momentum bar
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAltClue((prev) => !prev)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 min-w-[300px] text-right transition-all hover:bg-white/10 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Clue</p>
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
                        {showAltClue ? "Clue 2" : "Clue 1"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm md:text-base font-semibold leading-relaxed text-white/85 min-h-[52px]">
                      {activeClue}
                    </p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">
                      Tap clue card to switch hint (1/2)
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid flex-1 gap-4 lg:grid-cols-2">
              {PLAYERS.map((player) => (
                <div key={player.id}>
                  <SpellingPlayerCard
                    player={player}
                    scrambledLetters={scrambledLetters}
                    word={currentWordUpper}
                    playerState={players[player.id]}
                    roundLocked={roundLocked || phase !== "live"}
                    winnerFlash={roundWinner === player.id}
                    onSelectTile={handleSelectTile}
                    onRemoveTile={handleRemoveTile}
                    onReset={handleReset}
                    onSubmit={handleSubmit}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>

        {phase !== "live" && !resultOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/78 backdrop-blur-md px-4">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#12121e]/95 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.65)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400"></div>
              {phase === "countdown" ? (
                <div className="py-10 text-center">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Get Ready</p>
                  <div className="mt-5 text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.25)] animate-pulse">
                    {COUNTDOWN_STEPS[countdownIndex]}
                  </div>
                  <p className="mt-4 text-white/65 text-sm md:text-base">Timer starts for both players together after the countdown.</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Landscape Spelling Race</p>
                  <h2 className="mt-4 text-3xl md:text-5xl font-black text-white tracking-tight">Player A Left, Player B Right</h2>
                  <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed">
                    Both players race in landscape mode with winner flashes, tug-of-war momentum, haptic taps on correct letters, and longer final-lap words when both players solve quickly.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm text-white/75">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Winner steals the whole word</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Center tug-of-war momentum</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Fast laps unlock 7- and 9-letter rounds</div>
                  </div>
                  <button
                    type="button"
                    onClick={startBattle}
                    className="mt-8 h-14 w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black tracking-[0.25em] uppercase transition-all active:scale-95"
                  >
                    Start Battle
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {resultOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#12121e]/95 p-8 shadow-[0_28px_120px_rgba(0,0,0,0.65)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400"></div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Final Result</p>
              <h2 className="mt-4 text-3xl md:text-5xl font-black text-white tracking-tight">
                {winner ? `${winner === "A" ? "Player A" : "Player B"} Wins!` : "It’s a Tie!"}
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {PLAYERS.map((player) => (
                  <div key={player.id} className={`rounded-3xl border px-5 py-5 ${winner === player.id ? player.border : "border-white/10"} bg-white/5`}>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{player.name}</p>
                    <p className={`mt-3 text-5xl font-black tabular-nums ${player.text}`}>{players[player.id].score}</p>
                    <p className="mt-2 text-sm text-white/65">Round wins: {players[player.id].roundWins}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={startBattle}
                  className="h-12 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black tracking-[0.2em] uppercase transition-all active:scale-95"
                >
                  Play Again
                </button>
                <Link
                  to="/twoplayer"
                  className="h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold tracking-[0.2em] uppercase transition-all active:scale-95 flex items-center justify-center"
                >
                  Back To Menu
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function TwoPlayerSpellingBattle() {
  const [difficulty, setDifficulty] = useState(null);

  if (!difficulty) {
    return <DifficultySelector onSelect={setDifficulty} />;
  }

  return <SpellingBattleArena difficulty={difficulty} />;
}