import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DifficultySelector from "../components/DifficultySelector";

const PLAYERS = [
  { id: "A", name: "Player A", accent: "text-pink-200", ring: "ring-pink-400/40", border: "border-pink-400/30" },
  { id: "B", name: "Player B", accent: "text-cyan-200", ring: "ring-cyan-400/40", border: "border-cyan-400/30" },
];

const ROUND_COUNT = 6;
const COUNTDOWN_STEPS = ["3", "2", "1", "GO!"];

const MOVIE_LINES = {
  easy: [
    { speaker: "Jack", line: "I am the king of the world" },
    { speaker: "Dorothy", line: "There is no place like home" },
    { speaker: "Forrest", line: "Life is like a box of chocolates" },
    { speaker: "Elliot", line: "I will be right here" },
    { speaker: "Mia", line: "I said god damn" },
    { speaker: "Luke", line: "May the force be with you" },
    { speaker: "Jerry", line: "Show me the money" },
  ],
  medium: [
    { speaker: "Vito", line: "I am gonna make him an offer he cannot refuse" },
    { speaker: "Neo", line: "There is no spoon" },
    { speaker: "Joker", line: "Why so serious" },
    { speaker: "Apollo", line: "It is not how hard you hit" },
    { speaker: "Rose", line: "You jump I jump remember" },
    { speaker: "Yoda", line: "Do or do not there is no try" },
    { speaker: "Morpheus", line: "Welcome to the desert of the real" },
  ],
  hard: [
    { speaker: "Maximus", line: "What we do in life echoes in eternity" },
    { speaker: "Andy", line: "Hope is a good thing maybe the best of things" },
    { speaker: "Tyler", line: "The things you own end up owning you" },
    { speaker: "Jules", line: "The path of the righteous man is beset on all sides" },
    { speaker: "Gandalf", line: "All we have to decide is what to do with the time given to us" },
    { speaker: "Alfred", line: "Some men just want to watch the world burn" },
    { speaker: "Cooper", line: "We used to look up at the sky and wonder" },
  ],
};

function normalizeLine(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRoundSeconds(difficulty) {
  if (difficulty === "hard") return 15;
  if (difficulty === "medium") return 18;
  return 20;
}

function getBasePoints(difficulty) {
  if (difficulty === "hard") return 45;
  if (difficulty === "medium") return 35;
  return 25;
}

function shuffle(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function MovieLinesBattleArena({ difficulty }) {
  const [phase, setPhase] = useState("intro");
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(getRoundSeconds(difficulty));
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [showRules, setShowRules] = useState(false);

  const lines = useMemo(() => shuffle(MOVIE_LINES[difficulty] || MOVIE_LINES.easy).slice(0, ROUND_COUNT), [difficulty]);
  const currentRound = lines[roundIndex] || lines[0];
  const activePlayer = PLAYERS[activePlayerIndex];
  const normalizedExpected = normalizeLine(currentRound?.line);

  useEffect(() => {
    if (phase !== "countdown") return undefined;

    setCountdownIndex(0);
    const timer = setInterval(() => {
      setCountdownIndex((prev) => {
        if (prev >= COUNTDOWN_STEPS.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setTimeLeft(getRoundSeconds(difficulty));
            setPhase("live");
          }, 220);
          return prev;
        }
        return prev + 1;
      });
    }, 650);

    return () => clearInterval(timer);
  }, [phase, difficulty]);

  useEffect(() => {
    if (phase !== "live") return undefined;
    if (timeLeft <= 0) {
      setFeedback({ type: "error", text: "Time up! No points this round." });
      setTimeout(() => advanceRound(), 800);
      return undefined;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const advanceRound = () => {
    setInputValue("");
    setFeedback(null);

    if (roundIndex >= ROUND_COUNT - 1) {
      setPhase("results");
      return;
    }

    setRoundIndex((prev) => prev + 1);
    setActivePlayerIndex((prev) => (prev === 0 ? 1 : 0));
    setPhase("countdown");
  };

  const handleSubmit = () => {
    if (phase !== "live") return;

    const normalizedInput = normalizeLine(inputValue);
    if (!normalizedInput) return;

    if (normalizedInput === normalizedExpected) {
      const points = getBasePoints(difficulty) + Math.max(0, Math.floor(timeLeft / 2));
      setScores((prev) => ({ ...prev, [activePlayer.id]: prev[activePlayer.id] + points }));
      setFeedback({ type: "success", text: `Correct! +${points} pts` });
    } else {
      setFeedback({ type: "error", text: `Wrong line. Correct: "${currentRound.line}"` });
    }

    setTimeout(() => advanceRound(), 900);
  };

  const handleSkip = () => {
    if (phase !== "live") return;
    setFeedback({ type: "error", text: "Skipped. Next round." });
    setTimeout(() => advanceRound(), 450);
  };

  const startBattle = () => {
    setScores({ A: 0, B: 0 });
    setRoundIndex(0);
    setActivePlayerIndex(0);
    setInputValue("");
    setFeedback(null);
    setTimeLeft(getRoundSeconds(difficulty));
    setPhase("countdown");
  };

  const winner = scores.A === scores.B ? null : scores.A > scores.B ? "A" : "B";

  return (
    <>
      <Navbar />
      <div
        className="relative w-full bg-[#08070f] text-slate-200 font-sans overflow-x-hidden overflow-y-auto"
        style={{ height: "calc(100vh - 80px)", marginTop: "80px" }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[180px] animate-pulse delay-1000" />
        </div>

        <main className="relative z-10 h-full max-w-6xl mx-auto p-3 sm:p-4">
          <div className="rounded-[2rem] border border-white/10 bg-[#12121e]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400" />

            <div className="px-4 py-4 md:px-7 md:py-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Movie Lines Challenge</p>
                <h1 className="mt-2 text-2xl md:text-4xl font-black text-white">Two Player Battle</h1>
                <p className="mt-2 text-sm text-white/65">Alternating turns, same mode for both players, best score wins.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRules(true)}
                  className="h-11 px-4 rounded-xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-100 font-bold tracking-[0.14em] uppercase text-xs hover:bg-cyan-500/20 transition"
                >
                  Rules
                </button>
                <Link
                  to="/twoplayer"
                  className="h-11 px-4 rounded-xl border border-white/15 bg-white/5 text-white font-bold tracking-[0.14em] uppercase text-xs hover:bg-white/10 transition flex items-center"
                >
                  Back
                </Link>
              </div>
            </div>

            <div className="px-4 py-4 md:px-7 md:py-6 grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                {PLAYERS.map((player) => (
                  <div
                    key={player.id}
                    className={`rounded-2xl border bg-white/5 px-3 py-3 ${player.border} ${player.id === activePlayer.id && phase !== "results" ? `ring-2 ${player.ring}` : ""}`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">{player.name}</p>
                    <p className={`mt-1 text-3xl font-black tabular-nums ${player.accent}`}>{scores[player.id]}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.2fr] gap-3">
                <section className="rounded-2xl border border-white/10 bg-black/25 p-4 md:p-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Round</p>
                  <p className="mt-1 text-xl font-black text-white">{roundIndex + 1} / {ROUND_COUNT}</p>
                  <div className="mt-3 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-fuchsia-200/80">{currentRound?.speaker} says</p>
                    <p className="mt-3 text-lg md:text-2xl italic text-white/90 leading-relaxed">"{currentRound?.line}"</p>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-black/25 p-4 md:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">Current Turn</p>
                      <p className={`mt-1 text-2xl font-black ${activePlayer.accent}`}>{activePlayer.name}</p>
                    </div>
                    <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-3 py-2 text-right min-w-[84px]">
                      <p className="text-[9px] uppercase tracking-[0.24em] text-yellow-200/70">Time</p>
                      <p className="mt-1 text-2xl font-black tabular-nums text-yellow-300">{phase === "countdown" ? COUNTDOWN_STEPS[countdownIndex] : `${timeLeft}s`}</p>
                    </div>
                  </div>

                  <textarea
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    disabled={phase !== "live"}
                    className="mt-4 w-full min-h-[130px] rounded-2xl border border-white/12 bg-[#080912] px-4 py-3 text-white/90 placeholder:text-white/30 outline-none focus:border-cyan-300/50 resize-none"
                    placeholder="Type the exact movie line here..."
                  />

                  {feedback && (
                    <div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-bold ${feedback.type === "success" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-rose-400/40 bg-rose-500/10 text-rose-200"}`}>
                      {feedback.text}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={startBattle}
                      className="h-11 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black tracking-[0.18em] uppercase text-xs hover:from-fuchsia-500 hover:to-pink-500 transition active:scale-95"
                    >
                      {phase === "intro" ? "Start" : "Restart"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={phase !== "live"}
                      className="h-11 rounded-xl border border-white/15 bg-white/5 text-white/85 font-bold tracking-[0.14em] uppercase text-xs hover:bg-white/10 transition active:scale-95 disabled:opacity-45"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={phase !== "live" || !inputValue.trim()}
                      className="h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black tracking-[0.18em] uppercase text-xs hover:from-cyan-500 hover:to-blue-500 transition active:scale-95 disabled:opacity-45"
                    >
                      Submit
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>

        {phase === "results" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0f1324]/95 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.65)]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">Final Result</p>
              <h2 className="mt-3 text-3xl font-black text-white">{winner ? `${winner === "A" ? "Player A" : "Player B"} Wins!` : "Draw Game"}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-pink-400/25 bg-pink-500/10 px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-pink-200/70">Player A</p>
                  <p className="mt-1 text-3xl font-black text-pink-200">{scores.A}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/70">Player B</p>
                  <p className="mt-1 text-3xl font-black text-cyan-200">{scores.B}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={startBattle}
                  className="h-11 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black tracking-[0.16em] uppercase text-xs hover:from-fuchsia-500 hover:to-pink-500 transition"
                >
                  Play Again
                </button>
                <Link
                  to="/twoplayer"
                  className="h-11 rounded-xl border border-white/15 bg-white/5 text-white font-bold tracking-[0.16em] uppercase text-xs hover:bg-white/10 transition flex items-center justify-center"
                >
                  Back To Menu
                </Link>
              </div>
            </div>
          </div>
        )}

        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              onClick={() => setShowRules(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close rules"
            />
            <div className="relative w-full max-w-xl rounded-3xl border border-cyan-300/25 bg-[#081022]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/80">How Two Player Works</p>
              <ul className="mt-3 space-y-2 text-sm text-white/85 list-disc list-inside">
                <li>Players alternate one turn per round.</li>
                <li>Both players get the same mode and scoring rules.</li>
                <li>Correct line gives base points plus time bonus.</li>
                <li>After 6 rounds, higher score wins.</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="mt-5 h-11 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-[0.18em] uppercase text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function TwoPlayerMovieLinesChallenge() {
  const [difficulty, setDifficulty] = useState(null);

  if (!difficulty) {
    return <DifficultySelector onSelect={setDifficulty} />;
  }

  return <MovieLinesBattleArena difficulty={difficulty} />;
}
