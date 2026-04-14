import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import GameHUD from "../components/GameHUD";
import GameEndOverlay from "../components/GameEndOverlay";
import ArcadePurchaseModal from "../components/ArcadePurchaseModal";
import useErrorSound from "../hooks/useErrorSound";
import { calculateTimedPoints, getRewardAnimationDuration, getTimedRoundSeconds } from "../utils/scoring";
import { buildQuestionDeck, getAdaptiveDifficulty } from "../utils/questionDeck";

const SCRAMBLE_DATA = {
  easy: [
    { words: ["I", "am", "happy", "today"], answer: ["I", "am", "happy", "today"] },
    { words: ["She", "reads", "books", "daily"], answer: ["She", "reads", "books", "daily"] },
    { words: ["The", "cat", "is", "sleeping"], answer: ["The", "cat", "is", "sleeping"] },
    { words: ["We", "eat", "dinner", "together"], answer: ["We", "eat", "dinner", "together"] },
    { words: ["He", "runs", "in", "the", "park"], answer: ["He", "runs", "in", "the", "park"] },
    { words: ["It", "is", "a", "sunny", "day"], answer: ["It", "is", "a", "sunny", "day"] },
    { words: ["I", "love", "my", "family"], answer: ["I", "love", "my", "family"] },
    { words: ["She", "is", "a", "good", "student"], answer: ["She", "is", "a", "good", "student"] },
    { words: ["The", "dog", "barks", "at", "night"], answer: ["The", "dog", "barks", "at", "night"] },
    { words: ["He", "has", "a", "big", "smile"], answer: ["He", "has", "a", "big", "smile"] },
    { words: ["They", "play", "games", "after", "class"], answer: ["They", "play", "games", "after", "class"] },
    { words: ["My", "brother", "likes", "chocolate", "cake"], answer: ["My", "brother", "likes", "chocolate", "cake"] },
    { words: ["We", "walk", "to", "school", "together"], answer: ["We", "walk", "to", "school", "together"] },
    { words: ["The", "baby", "is", "sleeping", "now"], answer: ["The", "baby", "is", "sleeping", "now"] },
    { words: ["I", "drink", "milk", "every", "morning"], answer: ["I", "drink", "milk", "every", "morning"] },
  ],
  medium: [
    { words: ["I", "am", "learning", "English"], answer: ["I", "am", "learning", "English"] },
    { words: ["He", "goes", "to", "school", "every", "day"], answer: ["He", "goes", "to", "school", "every", "day"] },
    { words: ["She", "always", "speaks", "with", "confidence"], answer: ["She", "always", "speaks", "with", "confidence"] },
    { words: ["We", "should", "practice", "speaking", "English"], answer: ["We", "should", "practice", "speaking", "English"] },
    { words: ["My", "favorite", "subject", "is", "mathematics"], answer: ["My", "favorite", "subject", "is", "mathematics"] },
    { words: ["He", "finished", "his", "homework", "on", "time"], answer: ["He", "finished", "his", "homework", "on", "time"] },
    { words: ["The", "library", "has", "hundreds", "of", "books"], answer: ["The", "library", "has", "hundreds", "of", "books"] },
    { words: ["She", "wrote", "a", "letter", "to", "her", "friend"], answer: ["She", "wrote", "a", "letter", "to", "her", "friend"] },
    { words: ["They", "celebrated", "their", "victory", "together"], answer: ["They", "celebrated", "their", "victory", "together"] },
    { words: ["The", "teacher", "explains", "the", "lesson", "clearly"], answer: ["The", "teacher", "explains", "the", "lesson", "clearly"] },
    { words: ["The", "students", "prepared", "for", "the", "science", "fair"], answer: ["The", "students", "prepared", "for", "the", "science", "fair"] },
    { words: ["My", "cousin", "usually", "reads", "before", "going", "to", "bed"], answer: ["My", "cousin", "usually", "reads", "before", "going", "to", "bed"] },
    { words: ["We", "should", "arrive", "early", "for", "the", "meeting"], answer: ["We", "should", "arrive", "early", "for", "the", "meeting"] },
    { words: ["Her", "presentation", "was", "clear", "and", "very", "engaging"], answer: ["Her", "presentation", "was", "clear", "and", "very", "engaging"] },
    { words: ["They", "cleaned", "the", "classroom", "after", "the", "activity"], answer: ["They", "cleaned", "the", "classroom", "after", "the", "activity"] },
  ],
  hard: [
    { words: ["Confidence", "is", "the", "key", "to", "success"], answer: ["Confidence", "is", "the", "key", "to", "success"] },
    { words: ["He", "demonstrated", "exceptional", "skills", "during", "the", "test"], answer: ["He", "demonstrated", "exceptional", "skills", "during", "the", "test"] },
    { words: ["The", "government", "should", "prioritize", "education"], answer: ["The", "government", "should", "prioritize", "education"] },
    { words: ["She", "spoke", "eloquently", "in", "front", "of", "the", "audience"], answer: ["She", "spoke", "eloquently", "in", "front", "of", "the", "audience"] },
    { words: ["Learning", "a", "new", "language", "opens", "many", "doors"], answer: ["Learning", "a", "new", "language", "opens", "many", "doors"] },
    { words: ["They", "worked", "together", "to", "overcome", "every", "obstacle"], answer: ["They", "worked", "together", "to", "overcome", "every", "obstacle"] },
    { words: ["Consistent", "practice", "leads", "to", "mastery", "in", "any", "skill"], answer: ["Consistent", "practice", "leads", "to", "mastery", "in", "any", "skill"] },
    { words: ["The", "results", "showed", "that", "hard", "work", "pays", "off"], answer: ["The", "results", "showed", "that", "hard", "work", "pays", "off"] },
    { words: ["Communication", "skills", "are", "essential", "for", "every", "profession"], answer: ["Communication", "skills", "are", "essential", "for", "every", "profession"] },
    { words: ["She", "maintained", "a", "positive", "attitude", "throughout", "the", "challenge"], answer: ["She", "maintained", "a", "positive", "attitude", "throughout", "the", "challenge"] },
    { words: ["Effective", "planning", "helps", "teams", "deliver", "projects", "on", "time"], answer: ["Effective", "planning", "helps", "teams", "deliver", "projects", "on", "time"] },
    { words: ["Critical", "thinking", "enables", "students", "to", "analyze", "complex", "problems"], answer: ["Critical", "thinking", "enables", "students", "to", "analyze", "complex", "problems"] },
    { words: ["The", "conference", "highlighted", "innovative", "solutions", "for", "urban", "mobility"], answer: ["The", "conference", "highlighted", "innovative", "solutions", "for", "urban", "mobility"] },
    { words: ["Researchers", "evaluated", "multiple", "variables", "before", "publishing", "their", "conclusions"], answer: ["Researchers", "evaluated", "multiple", "variables", "before", "publishing", "their", "conclusions"] },
    { words: ["Strong", "leadership", "inspires", "people", "to", "collaborate", "during", "uncertainty"], answer: ["Strong", "leadership", "inspires", "people", "to", "collaborate", "during", "uncertainty"] },
  ],
};

const ROUND_LENGTH = 10;

const HINT_CONFIGS = {
  firstWord: { label: "First Word", icon: "1️⃣", cost: 8, helperText: "Places the first word of the sentence for you." },
  nextWord: { label: "Next Word", icon: "➡️", cost: 10, helperText: "Reveals and places the next correct word in sequence." },
};

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildTiles(words) {
  return shuffleArray(words.map((w, i) => ({ id: `${i}-${w}`, word: w })));
}

export default function SentenceScramble({ difficulty, onNextDifficulty }) {
  const { addScore, updateStreak, addWordPracticed, user, spendCoins, canAfford } = useContext(UserContext);
  const playError = useErrorSound();
  const [roundSeed, setRoundSeed] = useState(0);
  const adaptiveDifficulty = useMemo(
    () => getAdaptiveDifficulty(difficulty, user?.streak || 0, roundSeed),
    [difficulty, user?.streak, roundSeed]
  );

  const deck = useMemo(
    () =>
      buildQuestionDeck({
        items: SCRAMBLE_DATA[adaptiveDifficulty] || SCRAMBLE_DATA.easy,
        count: ROUND_LENGTH,
        gameKey: "sentence-scramble",
        difficulty: adaptiveDifficulty,
        replaySeed: roundSeed,
        getId: (entry) => entry.answer.join("|"),
      }),
    [adaptiveDifficulty, roundSeed]
  );

  const [index, setIndex] = useState(0);
  const [arranged, setArranged] = useState([]);
  const [tileBank, setTileBank] = useState(() => buildTiles(deck[0]?.words || []));
  const [score, setScore] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(() => getTimedRoundSeconds(difficulty));
  const [attempts, setAttempts] = useState(0);
  const [judgeType, setJudgeType] = useState(null);
  const [judgeText, setJudgeText] = useState("");
  const [shake, setShake] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeHintKey, setActiveHintKey] = useState(null);
  const [hintToast, setHintToast] = useState("");
  const [hintAnimatedTileId, setHintAnimatedTileId] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);
  const [interactionFx, setInteractionFx] = useState(null);
  const [topBracketStreak, setTopBracketStreak] = useState(0);
  const [scoreFx, setScoreFx] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const questionStartedAtRef = useRef(Date.now());
  const scoreFxCounterRef = useRef(0);
  const gameShellRef = useRef(null);
  const arrangedRef = useRef(arranged);
  const tileBankRef = useRef(tileBank);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (deck[index]) {
      setTileBank(buildTiles(deck[index].words));
      setArranged([]);
      setAttempts(0);
      setJudgeType(null);
      setJudgeText("");
      setShake(false);
      setShowAnswer(false);
      setHintToast("");
      setHintAnimatedTileId(null);
      questionStartedAtRef.current = Date.now();
      setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
    }
  }, [index, deck]);

  useEffect(() => {
    arrangedRef.current = arranged;
  }, [arranged]);

  useEffect(() => {
    tileBankRef.current = tileBank;
  }, [tileBank]);

  useEffect(() => {
    if (roundComplete || questionTimeLeft <= 0 || judgeType === "success" || showAnswer) return undefined;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTimeLeft, roundComplete, judgeType, showAnswer]);

  useEffect(() => {
    if (roundComplete || questionTimeLeft > 0 || judgeType === "success" || showAnswer) return;

    setJudgeType("error");
    setJudgeText("⌛ Time's up! Moving to next sentence.");
    setTopBracketStreak(0);
    setShowAnswer(true);
    addScore(difficulty, false);
    updateStreak(false);
    addWordPracticed();
    playError();

    setTimeout(() => advance(), 1200);
  }, [questionTimeLeft, roundComplete, judgeType, showAnswer]);

  useEffect(() => {
    if (!hintToast) return undefined;
    const timer = setTimeout(() => setHintToast(""), 1300);
    return () => clearTimeout(timer);
  }, [hintToast]);

  useEffect(() => {
    if (!hintAnimatedTileId) return undefined;
    const timer = setTimeout(() => setHintAnimatedTileId(null), 450);
    return () => clearTimeout(timer);
  }, [hintAnimatedTileId]);

  const current = deck[index];

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const vibrateSoft = useCallback((pattern = 8) => {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    navigator.vibrate(pattern);
  }, []);

  const placeTile = (tile, options = {}) => {
    const { fromHint = false } = options;
    if (judgeType === "success" || showAnswer) return;
    setTileBank((prev) => prev.filter((t) => t.id !== tile.id));
    setArranged((prev) => [...prev, tile]);
    if (!fromHint) {
      vibrateSoft(8);
    }
    if (fromHint) {
      setHintAnimatedTileId(tile.id);
    }
  };

  const returnTile = (tile) => {
    if (judgeType === "success" || showAnswer) return;
    setArranged((prev) => prev.filter((t) => t.id !== tile.id));
    setTileBank((prev) => [...prev, tile]);
    vibrateSoft(6);
  };

  const advance = () => {
    const next = index + 1;
    if (next >= ROUND_LENGTH) { setRoundComplete(true); } else { setIndex(next); }
  };

  const checkAnswer = () => {
    if (!current) return;
    if (arranged.length !== current.answer.length) {
      vibrateSoft([20, 40, 20]);
      setJudgeType("error"); setJudgeText("Place all words first!"); triggerShake(); return;
    }
    const typed = arranged.map((t) => t.word).join(" ");
    const correct = current.answer.join(" ");
    if (typed === correct) {
      const elapsed = Math.floor((Date.now() - questionStartedAtRef.current) / 1000);
      const timeRemaining = Math.max(1, getTimedRoundSeconds(difficulty) - elapsed);
      const scoreResult = calculateTimedPoints(difficulty, timeRemaining, topBracketStreak);
      const pts = scoreResult.points;
      setScore((prev) => prev + pts);
      setInteractionFx("success");
      vibrateSoft([10, 20, 10]);
      setJudgeType("success");
      setJudgeText(`✓ ${scoreResult.performance}! +${pts} pts${scoreResult.multiplier > 1 ? ` (x${scoreResult.multiplier})` : ""}`);
      setTopBracketStreak(scoreResult.nextTopBracketStreak);
      scoreFxCounterRef.current += 1;
      setScoreFx({
        key: `fx-${scoreFxCounterRef.current}`,
        tier: scoreResult.tier,
        callout: scoreResult.callout,
        multiplier: scoreResult.multiplier,
        points: pts,
      });
      addScore(difficulty, true); updateStreak(true); addWordPracticed();
      setTimeout(() => advance(), getRewardAnimationDuration(scoreResult.tier));
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setTopBracketStreak(0);
      setInteractionFx("error");
      vibrateSoft([16, 32, 16]);
      triggerShake();
      if (next >= 3) {
        setJudgeType("error");
        setJudgeText(`Answer: "${correct}"`);
        setShowAnswer(true);
        addScore(difficulty, false); playError(); updateStreak(false); addWordPracticed();
        setTimeout(() => advance(), 2000);
      } else {
        setJudgeType("error");
        setJudgeText(`Not quite — ${3 - next} ${3 - next === 1 ? "try" : "tries"} left`);
        playError();
        setTimeout(() => { setJudgeType(null); setJudgeText(""); }, 1000);
      }
    }
  };

  const requestHint = (key) => setActiveHintKey(key);

  const toggleFullscreen = useCallback(async () => {
    if (!gameShellRef.current) return;

    try {
      if (document.fullscreenElement === gameShellRef.current) {
        await document.exitFullscreen();
        return;
      }

      if (!document.fullscreenElement) {
        await gameShellRef.current.requestFullscreen();
        return;
      }

      await document.exitFullscreen();
      await gameShellRef.current.requestFullscreen();
    } catch {
      setHintToast("Fullscreen unavailable on this browser.");
    }
  }, []);

  const handleDragStart = (event, tile, source) => {
    if (judgeType === "success" || showAnswer) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-scramble-tile", JSON.stringify({ id: tile.id, source }));
  };

  const getDraggedTilePayload = (event) => {
    const raw = event.dataTransfer.getData("application/x-scramble-tile");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const handleDropToAnswer = (event) => {
    event.preventDefault();
    setDragOverZone(null);

    const payload = getDraggedTilePayload(event);
    if (!payload || payload.source !== "bank") return;
    const tile = tileBankRef.current.find((t) => t.id === payload.id);
    if (tile) {
      setInteractionFx("drop");
      placeTile(tile);
    }
  };

  const handleDropToBank = (event) => {
    event.preventDefault();
    setDragOverZone(null);

    const payload = getDraggedTilePayload(event);
    if (!payload || payload.source !== "arranged") return;
    const tile = arrangedRef.current.find((t) => t.id === payload.id);
    if (tile) {
      setInteractionFx("drop");
      returnTile(tile);
    }
  };

  const confirmHint = () => {
    if (!activeHintKey || !canAfford(HINT_CONFIGS[activeHintKey].cost)) return;
    spendCoins(HINT_CONFIGS[activeHintKey].cost);

    if (activeHintKey === "firstWord") {
      if (arranged.length === 0) {
        const firstWord = current.answer[0];
        const tile = tileBank.find((t) => t.word === firstWord);
        if (tile) {
          placeTile(tile, { fromHint: true });
          setHintToast("Hint used: first word placed.");
        }
      }
    } else if (activeHintKey === "nextWord") {
      const pos = arranged.length;
      if (pos < current.answer.length) {
        const nextWord = current.answer[pos];
        const tile = tileBank.find((t) => t.word === nextWord);
        if (tile) {
          placeTile(tile, { fromHint: true });
          setHintToast("Hint used: next word revealed.");
        }
      }
    }

    setActiveHintKey(null);
  };

  useEffect(() => {
    if (!interactionFx) return undefined;
    const timer = setTimeout(() => setInteractionFx(null), 360);
    return () => clearTimeout(timer);
  }, [interactionFx]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === gameShellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return;

      if (event.key === "Escape" && showInfoPopup) {
        event.preventDefault();
        setShowInfoPopup(false);
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
        return;
      }

      if (roundComplete || judgeType === "success" || showAnswer) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        const lastPlaced = arrangedRef.current[arrangedRef.current.length - 1];
        if (lastPlaced) {
          returnTile(lastPlaced);
        }
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        if (arrangedRef.current.length > 0) {
          checkAnswer();
        }
        return;
      }

      if (event.key >= "1" && event.key <= "9") {
        const idx = Number(event.key) - 1;
        const tile = tileBankRef.current[idx];
        if (tile) {
          event.preventDefault();
          placeTile(tile);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roundComplete, judgeType, showAnswer, toggleFullscreen, showInfoPopup]);

  return (
    <>
      <Navbar />
      <div
        ref={gameShellRef}
        className="relative w-full bg-[#030303] text-slate-200 font-sans overflow-hidden"
        style={{ minHeight: "calc(100dvh - 80px)", marginTop: isFullscreen ? "0px" : "80px" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />
          <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_45%),linear-gradient(120deg,rgba(15,23,42,0.25),rgba(2,6,23,0.6))]" />
        </div>

        <GameHUD
          points={score}
          gameState={judgeType === "success" ? "correct" : judgeType === "error" ? "incorrect" : null}
          difficulty={difficulty}
          time={questionTimeLeft}
          showTimer
          scoreFx={scoreFx}
          topBracketStreak={topBracketStreak}
        />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-3 sm:px-5 py-3 sm:py-4 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-1">
            <span className="bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
              SENTENCE SCRAMBLE
            </span>
            <div className="flex items-center gap-2 text-white/40 font-mono text-xs">
              <button
                onClick={() => setShowInfoPopup(true)}
                className="rounded-lg border border-cyan-300/35 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-300/70 transition"
              >
                Guide
              </button>
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: ROUND_LENGTH }).map((_, i) => (
                  <span key={i} className={`inline-block rounded-full transition-all duration-300 ${i < index ? "w-2 h-2 bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.8)]" : i === index ? "w-2.5 h-2.5 bg-violet-400 ring-2 ring-violet-400/40" : "w-1.5 h-1.5 bg-white/15"}`} />
                ))}
              </div>
              <span className="font-bold"><span className="text-violet-400">{index + 1}</span><span className="text-white/30"> / {ROUND_LENGTH}</span></span>
              <span className="text-yellow-300 font-bold">🪙 {user?.coins || 0}</span>
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${((index + 1) / ROUND_LENGTH) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 min-h-0">
            <section className={`rounded-3xl border bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 min-h-[62dvh] md:min-h-[68dvh] flex flex-col gap-3 transition-all ${interactionFx === "success" ? "border-emerald-400/50 shadow-[0_0_24px_rgba(16,185,129,0.35)]" : interactionFx === "error" ? "border-rose-400/50 shadow-[0_0_24px_rgba(244,63,94,0.28)]" : interactionFx === "drop" ? "border-cyan-300/55 shadow-[0_0_18px_rgba(34,211,238,0.25)]" : "border-white/10"}`}>
              {/* Hints + attempts */}
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(HINT_CONFIGS).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => requestHint(key)}
                    disabled={roundComplete || judgeType === "success" || showAnswer}
                    className="group flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10 hover:border-white/30 transition active:scale-95 disabled:opacity-40"
                  >
                    <span className="transition-transform group-hover:-translate-y-0.5">{cfg.icon}</span>
                    <span className="hidden sm:inline">{cfg.label}</span>
                    <span className="text-yellow-300">{cfg.cost}🪙</span>
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full transition-all ${i < attempts ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "bg-white/15"}`} />
                  ))}
                </div>
              </div>

              <p className="text-center text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-cyan-200/70 px-1 font-semibold">
                Touch friendly mode: tap or drag words in order · tap/drag placed words to return
              </p>

              {/* Answer row */}
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverZone("answer");
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={handleDropToAnswer}
                className={`flex-shrink-0 min-h-[104px] sm:min-h-[120px] rounded-2xl border p-3 flex flex-wrap gap-1.5 items-center content-start transition-all ${shake ? "animate-shake" : ""} ${dragOverZone === "answer" ? "border-cyan-300/60 bg-cyan-500/10" : "border-white/15 bg-white/[0.03]"}`}
              >
                {arranged.length === 0 ? (
                  <p className="text-white/55 text-sm italic px-2 font-medium">Drop words here to build your sentence…</p>
                ) : (
                  arranged.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => returnTile(tile)}
                      draggable={!showAnswer && judgeType !== "success"}
                      onDragStart={(event) => handleDragStart(event, tile, "arranged")}
                      onDragEnd={() => setDragOverZone(null)}
                      className={`px-3.5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-90 border tile-placed-enter ${hintAnimatedTileId === tile.id ? "hint-pop-in" : ""}
                        ${judgeType === "success" ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200 cursor-default shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
                          showAnswer ? "border-rose-400/50 bg-rose-500/15 text-rose-200 cursor-default" :
                          "border-violet-400/40 bg-violet-500/20 text-violet-100 hover:bg-violet-500/35 hover:scale-105 hover:shadow-[0_0_12px_rgba(139,92,246,0.45)]"}`}
                    >
                      {tile.word}
                    </button>
                  ))
                )}
              </div>

              {/* Feedback */}
              {judgeText && (
                <div className={`flex-shrink-0 rounded-xl border px-3 py-2 text-xs font-bold text-center ${judgeType === "success" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-rose-400/40 bg-rose-500/10 text-rose-200"}`}>
                  {judgeText}
                </div>
              )}

              {hintToast && (
                <div className="hint-toast flex-shrink-0 rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-center text-cyan-200">
                  {hintToast}
                </div>
              )}

              {/* Tile bank */}
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverZone("bank");
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={handleDropToBank}
                className={`flex-1 min-h-0 rounded-2xl border p-3 sm:p-3.5 transition-all ${dragOverZone === "bank" ? "border-cyan-300/50 bg-cyan-500/8" : "border-white/20 bg-black/25"}`}
              >
                <div className="h-full w-full flex flex-wrap gap-2.5 content-center justify-center">
                  {tileBank.map((tile, tileIndex) => (
                    <button
                      key={tile.id}
                      onClick={() => placeTile(tile)}
                      draggable={!showAnswer && judgeType !== "success"}
                      onDragStart={(event) => handleDragStart(event, tile, "bank")}
                      onDragEnd={() => setDragOverZone(null)}
                      disabled={judgeType === "success" || showAnswer}
                      style={{ animationDelay: `${tileIndex * 55}ms` }}
                      className="tile-bank-enter group px-3.5 py-2.5 sm:py-3 rounded-xl border border-white/25 bg-white/8 font-bold text-sm text-white hover:bg-violet-500/25 hover:border-violet-400/50 hover:scale-105 hover:shadow-[0_0_14px_rgba(139,92,246,0.4)] transition-all duration-200 active:scale-90 disabled:opacity-30 cursor-pointer select-none"
                    >
                      {tile.word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check button */}
              <div className="flex-shrink-0 sticky bottom-2 sm:bottom-3 z-10">
                <button
                  onClick={checkAnswer}
                  disabled={arranged.length === 0 || judgeType === "success" || showAnswer}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 px-5 py-3.5 font-black text-sm uppercase tracking-wider transition active:scale-95 disabled:opacity-40 shadow-lg shadow-violet-500/30"
                >
                  CHECK ANSWER
                </button>
              </div>
            </section>
          </div>
        </div>

        {showInfoPopup && (
          <div
            className="fixed inset-0 z-[140] bg-black/72 backdrop-blur-sm p-3 sm:p-6 grid place-items-center"
            onClick={() => setShowInfoPopup(false)}
          >
            <div
              className="w-full max-w-xl rounded-3xl border border-cyan-300/25 bg-[#070d1f]/95 shadow-[0_25px_90px_rgba(0,0,0,0.7)] p-3 sm:p-4 grid gap-2.5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/85">Game Guide</p>
                <button
                  onClick={() => setShowInfoPopup(false)}
                  className="h-8 px-3 rounded-lg border border-white/20 bg-white/5 text-white/85 text-xs font-bold hover:bg-white/10 transition"
                >
                  Close
                </button>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">How To Play</p>
                <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-white/85">
                  <p>1. Tap or drag tiles from the word bank.</p>
                  <p>2. Arrange them in the answer area.</p>
                  <p>3. Tap tiles in answer area to send them back.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-violet-200/90">Round Status</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-white/40 text-[10px] uppercase">Words Left</p>
                    <p className="font-black text-lg text-white">{tileBank.length}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-white/40 text-[10px] uppercase">Placed</p>
                    <p className="font-black text-lg text-white">{arranged.length}</p>
                  </div>
                  <div className="col-span-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-white/40 text-[10px] uppercase">Attempts Used</p>
                    <p className="font-black text-lg text-white">{attempts} / 3</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Strategy Tip</p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Start with subject, then verb, then object. If the order feels wrong, drag uncertain words back to the bank and rebuild the sentence in smaller chunks.
                </p>
              </div>
            </div>
          </div>
        )}

        <GameEndOverlay
          open={roundComplete}
          title="Sentence Scramble Complete!"
          score={score}
          practiced={ROUND_LENGTH}
          difficulty={difficulty}
          theme="scramble"
          onNextLevel={difficulty !== "hard" ? onNextDifficulty : undefined}
          onReplay={() => { setRoundComplete(false); setIndex(0); setScore(0); setRoundSeed((prev) => prev + 1); }}
          exitTo="/oneplayer"
        />

        <ArcadePurchaseModal
          open={Boolean(activeHintKey)}
          icon={activeHintKey ? HINT_CONFIGS[activeHintKey].icon : "🪙"}
          title={activeHintKey ? `Use ${HINT_CONFIGS[activeHintKey].label}?` : "Hint"}
          description={activeHintKey ? HINT_CONFIGS[activeHintKey].helperText : ""}
          cost={activeHintKey ? HINT_CONFIGS[activeHintKey].cost : 0}
          inventoryCount={user?.coins || 0}
          confirmLabel="Use Hint"
          confirmDisabled={activeHintKey ? !canAfford(HINT_CONFIGS[activeHintKey].cost) : true}
          helperText={activeHintKey && !canAfford(HINT_CONFIGS[activeHintKey].cost) ? "Not enough coins." : "Applied immediately."}
          onClose={() => setActiveHintKey(null)}
          onConfirm={confirmHint}
        />

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
          .animate-shake { animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both; }

          @keyframes tile-bank-appear {
            0% { opacity: 0; transform: translateY(18px) scale(0.82); }
            60% { opacity: 1; transform: translateY(-3px) scale(1.04); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .tile-bank-enter {
            animation: tile-bank-appear 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }

          @keyframes hint-pop-in {
            0% { opacity: 0; transform: scale(0.6) rotate(-8deg); }
            60% { opacity: 1; transform: scale(1.12) rotate(3deg); }
            100% { opacity: 1; transform: scale(1) rotate(0deg); }
          }
          .hint-pop-in { animation: hint-pop-in 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

          @keyframes hint-toast-in {
            0% { opacity: 0; transform: translateY(-8px) scale(0.92); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .hint-toast { animation: hint-toast-in 0.25s ease both; }

          @keyframes tile-placed {
            0% { opacity: 0; transform: scale(0.72) translateY(-10px); }
            65% { opacity: 1; transform: scale(1.08) translateY(2px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .tile-placed-enter { animation: tile-placed 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        `}</style>
      </div>
    </>
  );
}
