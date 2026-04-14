import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DifficultySelector from "../components/DifficultySelector";
import { vocabularyChallengesByDifficulty } from "../utils/twoPlayerData";

const PLAYERS = [
  {
    id: "A",
    name: "Player A",
    text: "text-pink-300",
    border: "border-pink-400/30",
    track: "from-pink-400 via-fuchsia-500 to-orange-300",
    activeBg: "bg-pink-500/10",
    activeBorder: "border-pink-400/50",
    activeRing: "ring-pink-500/40",
  },
  {
    id: "B",
    name: "Player B",
    text: "text-cyan-300",
    border: "border-cyan-400/30",
    track: "from-cyan-400 via-blue-500 to-indigo-300",
    activeBg: "bg-cyan-500/10",
    activeBorder: "border-cyan-400/50",
    activeRing: "ring-cyan-500/40",
  },
];

const ROUND_DURATION = 60;
const ROUND_DELAY = 1300;
const COUNTDOWN_STEPS = ["3", "2", "1", "GO!"];

function createPlayerState() {
  return {
    score: 0,
    roundWins: 0,
    feedback: null,
  };
}

function normalizeValue(nextValue, answer) {
  const cleanedValue = (nextValue || "").replace(/[^a-zA-Z]/g, "");
  return cleanedValue.slice(0, answer.length);
}

function formatTimer(seconds) {
  return `${seconds}s`;
}

function VocabularyBattleArena({ difficulty }) {
  const inputRef = useRef(null);
  const duration = ROUND_DURATION;
  const [phase, setPhase] = useState("intro");
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundLocked, setRoundLocked] = useState(false);
  const [players, setPlayers] = useState({ A: createPlayerState(), B: createPlayerState() });
  const [roundWinner, setRoundWinner] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);

  const [currentTurn, setCurrentTurn] = useState("A");
  const [firstTurnOfRound, setFirstTurnOfRound] = useState("A");
  const [attempted, setAttempted] = useState({ A: false, B: false });
  const [sharedInput, setSharedInput] = useState("");

  const challenges = useMemo(
    () => vocabularyChallengesByDifficulty[difficulty] || vocabularyChallengesByDifficulty.medium,
    [difficulty]
  );
  const currentChallenge = challenges[currentIndex % challenges.length] || vocabularyChallengesByDifficulty.medium[0];
  const answer = currentChallenge.answer.toLowerCase();
  const roundPoints = difficulty === "hard" ? 150 : difficulty === "medium" ? 100 : 50;

  const activePlayer = PLAYERS.find((p) => p.id === currentTurn);
  const activePlayerState = players[currentTurn];

  useEffect(() => {
    if (phase === "live" && !roundLocked) {
      inputRef.current?.focus();
    }
  }, [currentTurn, phase, roundLocked]);

  useEffect(() => {
    if (phase !== "countdown") return undefined;

    setCountdownIndex(0);
    const timer = setInterval(() => {
      setCountdownIndex((prev) => {
        if (prev >= COUNTDOWN_STEPS.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setTimeLeft(duration);
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
      const newFirst = firstTurnOfRound === "A" ? "B" : "A";
      setFirstTurnOfRound(newFirst);
      setCurrentTurn(newFirst);
      setAttempted({ A: false, B: false });
      setSharedInput("");
      setRoundWinner(null);
      setRoundLocked(false);
      setCurrentIndex((prev) => prev + 1);
      setPlayers((prev) => ({
        A: { ...prev.A, feedback: null },
        B: { ...prev.B, feedback: null },
      }));
    }, ROUND_DELAY);

    return () => clearTimeout(timer);
  }, [roundWinner, firstTurnOfRound]);

  const handleInputChange = useCallback((nextValue) => {
    setSharedInput(normalizeValue(nextValue, answer));
    setPlayers((prev) => ({
      ...prev,
      [currentTurn]: {
        ...prev[currentTurn],
        feedback: prev[currentTurn].feedback?.type === "error" ? null : prev[currentTurn].feedback,
      },
    }));
  }, [answer, currentTurn]);

  const handleReset = useCallback(() => {
    setSharedInput("");
    setPlayers((prev) => ({
      ...prev,
      [currentTurn]: { ...prev[currentTurn], feedback: null },
    }));
  }, [currentTurn]);

  const handleSubmit = useCallback(() => {
    if (phase !== "live" || roundLocked) return;

    const normalizedInput = sharedInput.trim().toLowerCase();
    if (!normalizedInput) return;

    const otherTurn = currentTurn === "A" ? "B" : "A";

    if (normalizedInput === answer) {
      setRoundLocked(true);
      setRoundWinner(currentTurn);
      setPlayers((prev) => ({
        ...prev,
        [currentTurn]: {
          ...prev[currentTurn],
          score: prev[currentTurn].score + roundPoints,
          roundWins: prev[currentTurn].roundWins + 1,
          feedback: { type: "success", message: `Correct! +${roundPoints} pts` },
        },
        [otherTurn]: {
          ...prev[otherTurn],
          feedback: { type: "error", message: `${currentTurn === "A" ? "Player A" : "Player B"} got it first!` },
        },
      }));
    } else {
      const newAttempted = { ...attempted, [currentTurn]: true };
      setAttempted(newAttempted);

      if (!newAttempted[otherTurn]) {
        setPlayers((prev) => ({
          ...prev,
          [currentTurn]: {
            ...prev[currentTurn],
            feedback: { type: "error", message: "Wrong! Other player's turn." },
          },
        }));
        setSharedInput("");
        setCurrentTurn(otherTurn);
      } else {
        setRoundLocked(true);
        setRoundWinner("none");
        setPlayers((prev) => ({
          ...prev,
          A: { ...prev.A, feedback: { type: "error", message: `No one got it. Answer: \"${answer.toUpperCase()}\"` } },
          B: { ...prev.B, feedback: { type: "error", message: `No one got it. Answer: \"${answer.toUpperCase()}\"` } },
        }));
      }
    }
  }, [answer, attempted, currentTurn, phase, roundLocked, roundPoints, sharedInput]);

  const startBattle = () => {
    setPlayers({ A: createPlayerState(), B: createPlayerState() });
    setCurrentIndex(0);
    setRoundLocked(false);
    setRoundWinner(null);
    setTimeLeft(duration);
    setCountdownIndex(0);
    setResultOpen(false);
    setCurrentTurn("A");
    setFirstTurnOfRound("A");
    setAttempted({ A: false, B: false });
    setSharedInput("");
    setPhase("countdown");
  };

  const winner = players.A.score === players.B.score ? null : players.A.score > players.B.score ? "A" : "B";
  const placeholder = "Type your answer...";

  return (
    <>
      <Navbar />
      <div
        className="relative w-full bg-[#08070f] text-slate-200 font-sans overflow-hidden selection:bg-pink-500/30"
        style={{ height: "calc(100dvh - 80px)", marginTop: "80px" }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[180px] animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem]"></div>
        </div>

        <main className="relative z-10 h-full max-w-5xl mx-auto px-3 sm:px-5 md:px-6 py-4 pb-4">
          <div className="flex flex-col gap-4">
            <div className="relative rounded-[1.75rem] border border-white/10 bg-[#12121e]/92 backdrop-blur-md px-4 py-4 shadow-xl overflow-hidden">
              <div className="absolute -top-10 left-1/2 h-28 w-80 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[90px] pointer-events-none"></div>
              <div className="relative flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center min-w-[80px]">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">Timer</p>
                    <p className="mt-0.5 text-2xl font-black text-yellow-300 tabular-nums">
                      {phase === "countdown" ? COUNTDOWN_STEPS[countdownIndex] : formatTimer(timeLeft)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                    <span className="rounded-xl px-3 py-1.5 text-xs font-black tracking-[0.15em] uppercase bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white">
                      60s
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Shared Definition</p>
                  <h1 className="mt-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold italic leading-snug text-white drop-shadow-[0_0_20px_rgba(236,72,153,0.25)]">
                    "{currentChallenge.clue}"
                  </h1>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {PLAYERS.map((player) => {
                const isActive = phase === "live" && currentTurn === player.id && !roundLocked;
                return (
                  <div
                    key={player.id}
                    className={`relative rounded-2xl border transition-all duration-300 px-4 py-3 md:px-5 md:py-4 ${
                      isActive
                        ? `${player.activeBorder} ${player.activeBg} ring-2 ${player.activeRing}`
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${player.track} rounded-t-2xl`}></div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">{player.name}</p>
                        <p className={`text-3xl md:text-4xl font-black tabular-nums ${player.text}`}>{players[player.id].score}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">Wins</p>
                        <p className="text-xl md:text-2xl font-black text-white/60">{players[player.id].roundWins}</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]"></div>
                        <span className="text-[9px] uppercase tracking-[0.25em] text-emerald-300 font-black">Your Turn</span>
                      </div>
                    )}
                    {attempted[player.id] && roundWinner === null && !isActive && phase === "live" && (
                      <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-rose-400/70">Attempted</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={`relative rounded-[1.75rem] border overflow-hidden transition-all duration-300 shadow-xl ${
              activePlayer ? `${activePlayer.activeBorder} ${activePlayer.activeBg}` : "border-white/10 bg-white/5"
            }`}>
              {activePlayer && (
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${activePlayer.track}`}></div>
              )}
              <div className="px-4 sm:px-5 md:px-6 py-5 md:py-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${roundLocked ? "bg-white/20" : "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.7)]"}`}></div>
                    <p className={`text-xs sm:text-sm font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] ${activePlayer ? activePlayer.text : "text-white/50"}`}>
                      {roundLocked
                        ? (roundWinner && roundWinner !== "none" ? `${roundWinner === "A" ? "Player A" : "Player B"} Got It!` : "Next Round...")
                        : `${currentTurn === "A" ? "Player A" : "Player B"}'s Turn`}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
                    {answer.length} Letters
                  </div>
                </div>

                <div className="min-h-[48px] mb-4">
                  {activePlayerState.feedback ? (
                    <div className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold ${activePlayerState.feedback.type === "success" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-rose-400/30 bg-rose-500/10 text-rose-200"}`}>
                      {activePlayerState.feedback.message}
                    </div>
                  ) : (
                    <div className="flex items-center rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-white/28">
                      Answer correctly to steal the round points.
                    </div>
                  )}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={sharedInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    disabled={roundLocked || phase !== "live"}
                    placeholder={placeholder}
                    className={`w-full rounded-[1.75rem] border-2 bg-black/20 px-4 sm:px-5 py-3.5 sm:py-4 text-center text-lg sm:text-xl md:text-2xl font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase outline-none transition-all ${
                      activePlayerState.feedback?.type === "success"
                        ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                        : activePlayerState.feedback?.type === "error"
                        ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
                        : activePlayer
                        ? `${activePlayer.activeBorder} text-white placeholder-white/20 focus:bg-white/5`
                        : "border-white/20 text-white"
                    }`}
                    autoComplete="off"
                    spellCheck="false"
                  />

                  <div className="flex justify-center gap-2 flex-wrap py-1">
                    {answer.split("").map((_, i) => (
                      <div
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full border-2 transition-all duration-300 ${
                          i < sharedInput.length
                            ? "border-pink-500 bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.6)]"
                            : "border-white/10"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={roundLocked || phase !== "live"}
                      className="h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-bold tracking-wide transition-all active:scale-95 disabled:opacity-40"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={roundLocked || phase !== "live" || sharedInput.trim().length === 0}
                      className="h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-white/40 text-white text-sm font-black tracking-[0.15em] uppercase transition-all active:scale-95 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

        {phase !== "live" && !resultOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/78 backdrop-blur-md px-4">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#12121e]/95 p-5 sm:p-8 shadow-[0_24px_90px_rgba(0,0,0,0.65)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400"></div>
              {phase === "countdown" ? (
                <div className="py-10 text-center">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Get Ready</p>
                  <div className="mt-5 text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.25)] animate-pulse">
                    {COUNTDOWN_STEPS[countdownIndex]}
                  </div>
                  <p className="mt-4 text-white/60 text-sm">Players take turns, guess correctly to steal the round.</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Vocabulary Race</p>
                  <h2 className="mt-4 text-2xl md:text-4xl font-black text-white tracking-tight">Take Turns, Race to Score</h2>
                  <p className="mt-4 text-white/70 text-sm md:text-base leading-relaxed">
                    One shared input, players alternate turns. Answer correctly to steal the round points. Wrong answer? Your opponent gets their shot.
                  </p>
                  <div className="mt-5 grid gap-2 grid-cols-1 sm:grid-cols-3 text-xs text-white/70">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">One shared input</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">Wrong = pass turn</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">Race for points</div>
                  </div>
                  <button
                    type="button"
                    onClick={startBattle}
                    className="mt-7 h-14 w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black tracking-[0.25em] uppercase transition-all active:scale-95"
                  >
                    Start Race
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {resultOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#12121e]/95 p-5 sm:p-8 shadow-[0_28px_120px_rgba(0,0,0,0.65)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400"></div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Final Result</p>
              <h2 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight break-words">
                {winner ? `${winner === "A" ? "Player A" : "Player B"} Wins!` : "It's a Tie!"}
              </h2>
              <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2">
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

export default function TwoPlayerVocabularyRace() {
  const [difficulty, setDifficulty] = useState(null);

  if (!difficulty) {
    return <DifficultySelector onSelect={setDifficulty} />;
  }

  return <VocabularyBattleArena difficulty={difficulty} />;
}
