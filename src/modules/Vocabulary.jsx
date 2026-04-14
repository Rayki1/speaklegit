import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import GameHUD from "../components/GameHUD";
import GameEndOverlay from "../components/GameEndOverlay";
import ArcadePurchaseModal from "../components/ArcadePurchaseModal";
import { vocabularyChallengesByDifficulty } from "../utils/twoPlayerData";
import useErrorSound from "../hooks/useErrorSound";
import { calculateTimedPoints, getRewardAnimationDuration, getTimedRoundSeconds } from "../utils/scoring";
import { buildQuestionDeck, getAdaptiveDifficulty } from "../utils/questionDeck";

const HINT_CONFIG = {
  underscoreReveal: {
    label: "Underscore Pulse",
    icon: "_",
    cost: 12,
    helperText: "Shows the answer length in the input placeholder.",
  },
  firstLetterBloom: {
    label: "First Letter Bloom",
    icon: "🌸",
    cost: 14,
    helperText: "Locks the first character into the input field permanently.",
  },
};

function shuffleArray(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function Vocabulary({ difficulty = "medium", onNextDifficulty }) {
  const {
    updateStreak,
    finalizeRoundScore,
    addWordPracticed,
    user,
    consumeHint,
    purchaseHint,
    getHintCount,
    canAfford,
  } = useContext(UserContext);
  const playError = useErrorSound();

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [shake, setShake] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [points, setPoints] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundSeed, setRoundSeed] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(() => getTimedRoundSeconds(difficulty));
  const [underscoreReveal, setUnderscoreReveal] = useState(false);
  const [firstLetterBloom, setFirstLetterBloom] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [activeHintKey, setActiveHintKey] = useState(null);
  const [hintFxKey, setHintFxKey] = useState(null);
  const [hintInputPulse, setHintInputPulse] = useState(false);
  const [topBracketStreak, setTopBracketStreak] = useState(0);
  const [scoreFx, setScoreFx] = useState(null);
  const inputRef = useRef(null);
  const questionStartedAtRef = useRef(Date.now());
  const scoreFxCounterRef = useRef(0);
  const roundLength = 10;
  const adaptiveDifficulty = useMemo(
    () => getAdaptiveDifficulty(difficulty, user?.streak || 0, roundSeed),
    [difficulty, user?.streak, roundSeed]
  );

  const shuffledChallenges = useMemo(
    () => {
      const pool = vocabularyChallengesByDifficulty[adaptiveDifficulty] || vocabularyChallengesByDifficulty.medium;
      return buildQuestionDeck({
        items: pool,
        count: Math.min(roundLength, pool.length),
        gameKey: "vocabulary",
        difficulty: adaptiveDifficulty,
        replaySeed: roundSeed,
        getId: (entry) => entry.answer,
      });
    },
    [adaptiveDifficulty, roundSeed]
  );
  const challenges = shuffledChallenges;
  const challenge = challenges[index % challenges.length];
  const answer = challenge.answer.toLowerCase();
  const practicedWords = user?.progress?.wordsPracticed || 0;
  const levelsCompleted = Math.floor(practicedWords / 7);
  const answerPlaceholder = useMemo(
    () => (underscoreReveal ? answer.split("").map(() => "_").join(" ") : "Type your answer..."),
    [answer, underscoreReveal]
  );

  useEffect(() => {
    setInput(firstLetterBloom ? answer[0] : "");
    questionStartedAtRef.current = Date.now();
    setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
  }, [answer, firstLetterBloom]);

  useEffect(() => {
    if (roundComplete || status === "correct" || questionTimeLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTimeLeft, roundComplete, status]);

  useEffect(() => {
    if (roundComplete || status !== "idle" || questionTimeLeft > 0) return;

    setStatus("incorrect");
    setHintMessage("Time's up! Next word.");
    setTopBracketStreak(0);
    updateStreak(false);
    addWordPracticed();

    setTimeout(() => {
      if (index + 1 >= roundLength) {
        finalizeRoundScore(points).catch(() => {});
        setRoundComplete(true);
        return;
      }

      setIndex((prev) => prev + 1);
      setInput("");
      setStatus("idle");
      setUnderscoreReveal(false);
      setFirstLetterBloom(false);
      setHintMessage("");
    }, 900);
  }, [questionTimeLeft, roundComplete, status, index, roundLength, points]);

  useEffect(() => {
    if (status === "idle" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [index, status]);

  useEffect(() => {
    if (!hintMessage) return undefined;

    const timer = setTimeout(() => {
      setHintMessage("");
    }, 2200);

    return () => clearTimeout(timer);
  }, [hintMessage]);

  useEffect(() => {
    if (!hintFxKey) return undefined;

    const timer = setTimeout(() => {
      setHintFxKey(null);
    }, 450);

    return () => clearTimeout(timer);
  }, [hintFxKey]);

  useEffect(() => {
    if (!hintInputPulse) return undefined;

    const timer = setTimeout(() => {
      setHintInputPulse(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [hintInputPulse]);

  const normalizeInput = (nextValue) => {
    if (!firstLetterBloom) return nextValue;

    const requiredPrefix = answer[0] || "";
    const trimmedValue = nextValue || "";
    const withoutPrefix = trimmedValue.toLowerCase().startsWith(requiredPrefix)
      ? trimmedValue.slice(1)
      : trimmedValue;

    return `${requiredPrefix}${withoutPrefix}`.slice(0, answer.length);
  };

  const checkAnswer = (event) => {
    if (event) event.preventDefault();
    if (!input.trim() || status !== "idle" || roundComplete) return;

    const correct = input.trim().toLowerCase() === answer;

    if (correct) {
      setStatus("correct");
      setPulse(true);
      const elapsed = Math.floor((Date.now() - questionStartedAtRef.current) / 1000);
      const timeRemaining = Math.max(1, getTimedRoundSeconds(difficulty) - elapsed);
      const scoreResult = calculateTimedPoints(difficulty, timeRemaining, topBracketStreak);
      const pointsGained = scoreResult.points;
      setPoints((prev) => prev + pointsGained);
      setHintMessage(`${scoreResult.performance}! +${pointsGained} pts${scoreResult.multiplier > 1 ? ` (x${scoreResult.multiplier})` : ""}`);
      setTopBracketStreak(scoreResult.nextTopBracketStreak);
      scoreFxCounterRef.current += 1;
      setScoreFx({
        key: `fx-${scoreFxCounterRef.current}`,
        tier: scoreResult.tier,
        callout: scoreResult.callout,
        multiplier: scoreResult.multiplier,
        points: pointsGained,
      });

      updateStreak(true);
      addWordPracticed();

      setTimeout(() => {
        if (index + 1 >= roundLength) {
          const finalRoundScore = points + pointsGained;
          finalizeRoundScore(finalRoundScore).catch(() => {});
          setPulse(false);
          setRoundComplete(true);
          return;
        }

        setPulse(false);
        setIndex((prev) => prev + 1);
        setInput("");
        setStatus("idle");
        setUnderscoreReveal(false);
        setFirstLetterBloom(false);
        setHintMessage("");
      }, getRewardAnimationDuration(scoreResult.tier));
    } else {
      playError();
      setStatus("incorrect");
      updateStreak(false);
      setTopBracketStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 500);

      setTimeout(() => {
        setStatus("idle");
        if (inputRef.current) inputRef.current.focus();
      }, 1500);
    }
  };

  const applyUnderscoreReveal = () => {
    if (underscoreReveal) {
      setHintMessage("Underscore Pulse is already active for this word.");
      return false;
    }

    setUnderscoreReveal(true);
    setHintMessage("Underscore Pulse revealed the word length.");
    setHintFxKey("underscoreReveal");
    setHintInputPulse(true);
    return true;
  };

  const applyFirstLetterBloom = () => {
    if (firstLetterBloom) {
      setHintMessage("First Letter Bloom is already locked in.");
      return false;
    }

    setFirstLetterBloom(true);
    setInput((prev) => normalizeInput(answer[0] + prev));
    setHintMessage("First Letter Bloom planted the opening character.");
    setHintFxKey("firstLetterBloom");
    setHintInputPulse(true);
    return true;
  };

  const applyHintEffect = (hintKey) => {
    if (hintKey === "underscoreReveal") return applyUnderscoreReveal();
    if (hintKey === "firstLetterBloom") return applyFirstLetterBloom();
    return false;
  };

  const requestHint = (hintKey) => {
    const count = getHintCount(hintKey);

    if (count > 0) {
      const applied = applyHintEffect(hintKey);
      if (!applied) return;
      consumeHint(hintKey);
      return;
    }

    setActiveHintKey(hintKey);
  };

  const confirmHintPurchase = () => {
    if (!activeHintKey) return;

    const config = HINT_CONFIG[activeHintKey];
    const purchased = purchaseHint(activeHintKey, config.cost, 1);

    if (!purchased) {
      setHintMessage(`You need ${config.cost} coins to buy ${config.label}.`);
      return;
    }

    const applied = applyHintEffect(activeHintKey);
    if (applied) {
      consumeHint(activeHintKey);
    }

    setActiveHintKey(null);
  };

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="relative w-full bg-[#030303] text-slate-200 font-sans overflow-hidden selection:bg-pink-500/30" style={{ height: "calc(100dvh - 80px)", marginTop: "80px" }}>
        <GameHUD
          points={points}
          gameState={status === "correct" ? "correct" : status === "incorrect" ? "incorrect" : null}
          difficulty={difficulty}
          time={questionTimeLeft}
          showTimer
          scoreFx={scoreFx}
          topBracketStreak={topBracketStreak}
        />

        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-800/10 rounded-full blur-[160px] animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-500 rounded-full blur-sm animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-500 rounded-full blur-sm animate-float delay-700"></div>
          <div className="absolute top-1/2 right-10 w-1 h-1 bg-blue-400 rounded-full blur-none animate-float delay-1500"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <main className="relative z-10 h-full max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-center">
          <div className={`flex items-center justify-center w-full h-full transition-all duration-500 ease-out transform ${pulse ? "scale-[1.02]" : "scale-100"}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-[3rem] blur-2xl opacity-20 pointer-events-none"></div>

            <div className={`relative w-full h-full bg-[#161129]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-300 ${shake ? "animate-shake" : ""} flex flex-col`}>
              {/* Header */}
              <div className="flex items-center justify-between px-3 md:px-5 py-2 md:py-3 border-b border-white/5 bg-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    VOCABULARY
                  </span>
                  <span className="text-white/30 text-xs hidden sm:inline">| {difficulty}</span>
                </div>
                <div className="flex items-center gap-2 text-white/40 font-mono">
                  <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: roundLength }).map((_, i) => (
                      <span key={i} className={`inline-block rounded-full transition-all duration-300 ${i < index ? "w-2 h-2 bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : i === index ? "w-2.5 h-2.5 bg-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_10px_rgba(52,211,153,0.6)]" : "w-1.5 h-1.5 bg-white/15"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold">
                    <span className="text-emerald-400">{index + 1}</span>
                    <span className="text-white/30"> / {roundLength}</span>
                  </span>
                  <span className="text-yellow-300 font-bold text-xs">🪙 {user?.coins || 0}</span>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col items-center justify-center px-3 md:px-6 py-3 overflow-hidden space-y-3">
                {/* Hints row */}
                <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-white/5 bg-black/10 px-3 py-2">
                  {Object.entries(HINT_CONFIG).map(([hintKey, config]) => (
                    <button
                      key={hintKey}
                      onClick={() => requestHint(hintKey)}
                      disabled={roundComplete}
                      className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50 ${hintFxKey === hintKey ? "hint-pop-in" : ""}`}
                    >
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">{config.label}</p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs font-black text-white">
                        <span>{config.icon}</span>
                        <span>x{getHintCount(hintKey)}</span>
                        <span className="text-yellow-300">{config.cost}🪙</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Definition */}
                <div className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Definition</div>
                <div className="max-w-2xl px-4">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold italic text-white leading-tight tracking-tight text-center">
                    "{challenge.clue}"
                  </h2>
                </div>
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {hintMessage && (
                  <div className="hint-toast rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-center text-xs text-cyan-100">
                    {hintMessage}
                  </div>
                )}

                {/* Input area */}
                <div className="w-full max-w-xl">
                  <form onSubmit={checkAnswer} className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(event) => setInput(normalizeInput(event.target.value))}
                      disabled={status !== "idle" || roundComplete}
                      placeholder={answerPlaceholder}
                      className={`w-full bg-black/20 border-2 rounded-xl px-4 py-3 text-lg text-center font-bold tracking-wider transition-all duration-500 outline-none ${hintInputPulse ? "hint-pop-in" : ""} ${
                        status === "correct"
                          ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                          : status === "incorrect"
                          ? "border-rose-500 text-rose-400 bg-rose-500/10"
                          : "border-white/10 focus:border-emerald-500 text-white placeholder-white/20 focus:bg-white/5"
                      }`}
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </form>

                  <div className="h-8 mt-2 flex flex-col items-center justify-center">
                    {status === "correct" && (
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                        <span className="text-xl">✓</span> Correct!
                      </div>
                    )}
                    {status === "incorrect" && (
                      <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest">
                        <span className="text-xl">✗</span> Try Again
                      </div>
                    )}
                    {status === "idle" && input.length > 0 && (
                      <div className="flex items-center gap-1 text-white/20 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                        <span>↵</span> Press Enter to Confirm
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-1.5 mt-2">
                    {challenge.answer.toUpperCase().split("").map((_, idx) => (
                      <div key={idx} className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                        idx < input.length
                          ? idx === 0 && firstLetterBloom
                            ? "bg-cyan-400 border-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                            : "bg-emerald-500 border-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                          : "border-white/10"
                      }`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-3 md:px-5 py-3 flex items-center justify-center gap-3 bg-black/20 border-t border-white/5">
                <button
                  type="submit"
                  onClick={checkAnswer}
                  disabled={status !== "idle" || input.length === 0 || roundComplete}
                  className="flex-1 max-w-md flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {status === "correct" ? "✓ CORRECT!" : status === "incorrect" ? "TRY AGAIN" : "SUBMIT ANSWER"}
                </button>
              </div>
            </div>
          </div>
        </main>

        <GameEndOverlay
          open={roundComplete}
          title="Vocabulary Round Complete"
          score={points}
          practiced={roundLength}
          difficulty={difficulty}
          theme="vocabulary"
          onNextLevel={difficulty !== "hard" ? onNextDifficulty : undefined}
          onReplay={() => {
            setRoundComplete(false);
            setIndex(0);
            setInput("");
            setStatus("idle");
            setShake(false);
            setPulse(false);
            setPoints(0);
            setRoundSeed((prev) => prev + 1);
            setUnderscoreReveal(false);
            setFirstLetterBloom(false);
            setHintMessage("");
            setActiveHintKey(null);
            setHintFxKey(null);
            setHintInputPulse(false);
            setTopBracketStreak(0);
          }}
          exitTo="/oneplayer"
        />

        <ArcadePurchaseModal
          open={Boolean(activeHintKey)}
          icon={activeHintKey ? HINT_CONFIG[activeHintKey].icon : "🪙"}
          title={activeHintKey ? `Buy ${HINT_CONFIG[activeHintKey].label}?` : "Buy Hint?"}
          description={activeHintKey ? HINT_CONFIG[activeHintKey].helperText : ""}
          cost={activeHintKey ? HINT_CONFIG[activeHintKey].cost : 0}
          inventoryCount={activeHintKey ? getHintCount(activeHintKey) : 0}
          confirmLabel="Purchase + Use"
          confirmDisabled={activeHintKey ? !canAfford(HINT_CONFIG[activeHintKey].cost) : true}
          helperText={activeHintKey && !canAfford(HINT_CONFIG[activeHintKey].cost) ? "Not enough coins in your wallet yet." : "The purchased hint applies immediately to this challenge."}
          onClose={() => setActiveHintKey(null)}
          onConfirm={confirmHintPurchase}
        />

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-5px) translateX(-15px); }
            75% { transform: translateY(-25px) translateX(5px); }
          }
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
          .delay-700 {
            animation-delay: 0.7s;
          }
          .delay-1000 {
            animation-delay: 1s;
          }
          .delay-1500 {
            animation-delay: 1.5s;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-12px); }
            40% { transform: translateX(12px); }
            60% { transform: translateX(-8px); }
            80% { transform: translateX(8px); }
          }
          .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
          .animate-in {
            animation-duration: 0.5s;
            animation-fill-mode: both;
          }
          .fade-in { animation-name: fadeIn; }
          .zoom-in-95 { animation-name: zoomIn95; }
          .slide-in-from-bottom-full { animation-name: slideInBottomFull; }
          .slide-in-from-top-full { animation-name: slideInTopFull; }

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes slideInBottomFull { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @keyframes slideInTopFull { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        `}</style>
      </div>
    </>
  );
}

const StatRow = ({ label, value, color = "text-white/90" }) => (
  <div className="flex justify-between items-center group">
    <span className="text-white/40 font-medium group-hover:text-white/60 transition-colors">{label}</span>
    <span className={`text-xl font-bold ${color}`}>{value}</span>
  </div>
);

export default Vocabulary;