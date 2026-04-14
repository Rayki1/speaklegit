import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import GameHUD from "../components/GameHUD";
import GameEndOverlay from "../components/GameEndOverlay";
import ArcadePurchaseModal from "../components/ArcadePurchaseModal";
import useErrorSound from "../hooks/useErrorSound";
import useTapSound from "../hooks/useTapSound";
import { calculateTimedPoints, getRewardAnimationDuration, getTimedRoundSeconds } from "../utils/scoring";
import { buildQuestionDeck, getAdaptiveDifficulty } from "../utils/questionDeck";

const HINT_CONFIG = {
  neonMagnet: {
    label: "Neon Magnet",
    icon: "🧲",
    cost: 15,
    helperText: "Snaps the correct first and last letters into place.",
  },
  shadowLetter: {
    label: "Shadow Letter",
    icon: "👻",
    cost: 10,
    helperText: "Flashes a ghost letter in one empty answer slot for 1.5 seconds.",
  },
};

const wordDataByDifficulty = {
  easy: [
    { word: "cat", hint: "A small furry pet that says meow.", category: "Animals" },
    { word: "dog", hint: "A loyal pet that barks and wags its tail.", category: "Animals" },
    { word: "sun", hint: "The bright star in the sky during daytime.", category: "Nature" },
    { word: "tree", hint: "A tall plant with a trunk and branches.", category: "Nature" },
    { word: "book", hint: "Something you read with pages.", category: "Education" },
    { word: "house", hint: "A building where people live.", category: "Home" },
    { word: "water", hint: "A clear liquid you drink.", category: "Basic" },
    { word: "happy", hint: "Feeling joyful and glad.", category: "Emotions" },
    { word: "apple", hint: "A round fruit that can be red or green.", category: "Food" },
    { word: "chair", hint: "Furniture you sit on.", category: "Home" },
    { word: "heart", hint: "The organ that pumps blood.", category: "Body" },
    { word: "star", hint: "A bright point of light in the night sky.", category: "Space" },
    { word: "island", hint: "A piece of land surrounded by water.", category: "Geography" },
    { word: "pocket", hint: "A small sewn bag in clothing.", category: "Everyday" },
    { word: "window", hint: "An opening in a wall that lets in light.", category: "Home" },
    { word: "rocket", hint: "A vehicle designed to travel through space.", category: "Space" },
    { word: "farmer", hint: "A person who grows crops or raises animals.", category: "Work" },
  ],
  medium: [
    { word: "teacher", hint: "A person who helps students to acquire knowledge.", category: "Education" },
    { word: "purple", hint: "A color made by mixing red and blue.", category: "Colors" },
    { word: "planet", hint: "A celestial body orbiting around a star.", category: "Space" },
    { word: "melody", hint: "A sequence of musical notes that create a tune.", category: "Music" },
    { word: "butterfly", hint: "An insect with colorful wings that goes through metamorphosis.", category: "Nature" },
    { word: "library", hint: "A place where books and resources are kept for reading and study.", category: "Education" },
    { word: "kitchen", hint: "A room where food is prepared and cooked.", category: "Home" },
    { word: "sunshine", hint: "Light and warmth from the sun.", category: "Weather" },
    { word: "elephant", hint: "A large gray animal with a long trunk and tusks.", category: "Animals" },
    { word: "mountain", hint: "A very high landform with a peak.", category: "Geography" },
    { word: "computer", hint: "An electronic device for processing data.", category: "Technology" },
    { word: "hospital", hint: "A place where sick or injured people receive treatment.", category: "Healthcare" },
    { word: "apprentice", hint: "A person learning a trade from a skilled worker.", category: "Work" },
    { word: "bilingual", hint: "Able to speak two languages.", category: "Language" },
    { word: "corridor", hint: "A long passage in a building.", category: "Architecture" },
    { word: "diplomat", hint: "A person representing a country abroad.", category: "Government" },
    { word: "festival", hint: "A celebratory event, often cultural.", category: "Culture" },
  ],
  hard: [
    { word: "accommodate", hint: "To provide lodging or sufficient space for something.", category: "Advanced" },
    { word: "encyclopedia", hint: "A comprehensive reference work with articles on various topics.", category: "Education" },
    { word: "microscope", hint: "An instrument used to see objects that are too small for the naked eye.", category: "Science" },
    { word: "architecture", hint: "The art and science of designing and constructing buildings.", category: "Design" },
    { word: "metamorphosis", hint: "A complete transformation or change in form and structure.", category: "Biology" },
    { word: "photosynthesis", hint: "The process by which plants make food using sunlight.", category: "Biology" },
    { word: "extraordinary", hint: "Very unusual or remarkable beyond what is ordinary.", category: "Advanced" },
    { word: "pharmaceutical", hint: "Relating to medicinal drugs and their preparation.", category: "Medicine" },
    { word: "constellation", hint: "A group of stars forming a recognizable pattern in the night sky.", category: "Astronomy" },
    { word: "appreciation", hint: "Recognition and enjoyment of the good qualities of something.", category: "Emotion" },
    { word: "independence", hint: "The state of being free from outside control or support.", category: "Concept" },
    { word: "refrigerator", hint: "An appliance used to keep food and drinks cold.", category: "Appliance" },
    { word: "demagogue", hint: "A leader who seeks support by appealing to emotions.", category: "Politics" },
    { word: "equivocate", hint: "To use ambiguous language to avoid commitment.", category: "Language" },
    { word: "grandiloquent", hint: "Pompous or extravagant in style or manner.", category: "Language" },
    { word: "iconoclast", hint: "A person who attacks established beliefs.", category: "Philosophy" },
    { word: "magniloquent", hint: "Lofty and bombastic in speech.", category: "Language" },
  ],
};

function shuffleWord(word) {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function shuffleArray(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function createTiles(word, roundIndex) {
  return shuffleWord(word).split("").map((char, index) => ({
    id: `${roundIndex}-${char}-${index}`,
    letter: char,
    used: false,
    pulse: false,
  }));
}

function Spelling({ difficulty = "medium", onNextDifficulty, isAdActive = false }) {
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
  const playTap = useTapSound();

  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("idle");
  const [shake, setShake] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [points, setPoints] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundSeed, setRoundSeed] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(() => getTimedRoundSeconds(difficulty));
  const [tiles, setTiles] = useState([]);
  const [answerSlots, setAnswerSlots] = useState([]);
  const [shadowPreviewIndex, setShadowPreviewIndex] = useState(null);
  const [magnetTargets, setMagnetTargets] = useState([]);
  const [hintMessage, setHintMessage] = useState("");
  const [activeHintKey, setActiveHintKey] = useState(null);
  const [hintFxKey, setHintFxKey] = useState(null);
  const [topBracketStreak, setTopBracketStreak] = useState(0);
  const [scoreFx, setScoreFx] = useState(null);
  const questionStartedAtRef = useRef(Date.now());
  const scoreFxCounterRef = useRef(0);
  const adPausedAtRef = useRef(null);
  const adaptiveDifficulty = useMemo(
    () => getAdaptiveDifficulty(difficulty, user?.streak || 0, roundSeed),
    [difficulty, user?.streak, roundSeed]
  );

  const roundLength = 10;
  const wordData = wordDataByDifficulty[adaptiveDifficulty] || wordDataByDifficulty.medium;
  const shuffledWordData = useMemo(
    () =>
      buildQuestionDeck({
        items: wordData,
        count: Math.min(roundLength, wordData.length),
        gameKey: "spelling",
        difficulty: adaptiveDifficulty,
        replaySeed: roundSeed,
        getId: (entry) => entry.word,
      }),
    [wordData, adaptiveDifficulty, roundSeed]
  );
  const currentWordData = shuffledWordData[index] || shuffledWordData[0];
  const word = currentWordData.word.toUpperCase();
  const input = useMemo(
    () => answerSlots.map((slot) => slot?.letter || "").join(""),
    [answerSlots]
  );

  // Lock body scroll while game is open
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    setTiles(createTiles(word, index));
    setAnswerSlots(Array.from({ length: word.length }, () => null));
    setStatus("idle");
    setShowDefinition(false);
    setShadowPreviewIndex(null);
    setMagnetTargets([]);
    setHintMessage("");
    setActiveHintKey(null);
    setHintFxKey(null);
    questionStartedAtRef.current = Date.now();
    setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
  }, [index, word]);

  useEffect(() => {
    if (isAdActive || roundComplete || status === "success" || questionTimeLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdActive, questionTimeLeft, roundComplete, status]);

  useEffect(() => {
    if (isAdActive) {
      if (adPausedAtRef.current === null) {
        adPausedAtRef.current = Date.now();
      }
      return;
    }

    if (adPausedAtRef.current !== null) {
      const pausedDuration = Date.now() - adPausedAtRef.current;
      questionStartedAtRef.current += pausedDuration;
      adPausedAtRef.current = null;
    }
  }, [isAdActive]);

  useEffect(() => {
    if (isAdActive || roundComplete || status !== "idle" || questionTimeLeft > 0) return;

    setStatus("error");
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
    }, 900);
  }, [isAdActive, questionTimeLeft, roundComplete, status, index, roundLength, points]);

  useEffect(() => {
    if (shadowPreviewIndex === null) return undefined;

    const timer = setTimeout(() => {
      setShadowPreviewIndex(null);
    }, 1500);

    return () => clearTimeout(timer);
  }, [shadowPreviewIndex]);

  useEffect(() => {
    if (!magnetTargets.length) return undefined;

    const timer = setTimeout(() => {
      setMagnetTargets([]);
      setTiles((prev) => prev.map((tile) => ({ ...tile, pulse: false })));
    }, 900);

    return () => clearTimeout(timer);
  }, [magnetTargets]);

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

  const resetAnswerBoard = () => {
    setTiles((prev) => prev.map((tile) => ({ ...tile, used: false, pulse: false })));
    setAnswerSlots(Array.from({ length: word.length }, () => null));
    setShadowPreviewIndex(null);
    setMagnetTargets([]);
    if (status === "error" && questionTimeLeft > 0) setStatus("idle");
  };

  const handleKeyPress = (tileId) => {
    if (status === "success" || roundComplete) return;

    const tile = tiles.find((item) => item.id === tileId);
    const nextIndex = answerSlots.findIndex((slot) => slot === null);

    if (!tile || tile.used || nextIndex === -1) return;

    playTap();
    setTiles((prev) => prev.map((item) => (item.id === tileId ? { ...item, used: true, pulse: false } : item)));
    setAnswerSlots((prev) => {
      const next = [...prev];
      next[nextIndex] = { letter: tile.letter, tileId, source: "manual" };
      return next;
    });

    if (status === "error" && questionTimeLeft > 0) setStatus("idle");
  };

  const handleSlotClick = (slotIndex) => {
    if (status === "success" || roundComplete) return;
    const slot = answerSlots[slotIndex];
    if (!slot) return;

    playTap();
    setTiles((prev) => prev.map((tile) => tile.id === slot.tileId ? { ...tile, used: false, pulse: false } : tile));
    setAnswerSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    if (status === "error" && questionTimeLeft > 0) setStatus("idle");
  };

  const checkSpelling = () => {
    if (status !== "idle" || input.length === 0 || roundComplete) return;

    const correct = input.toUpperCase() === word;

    if (correct) {
      setStatus("success");
      const elapsed = Math.floor((Date.now() - questionStartedAtRef.current) / 1000);
      const timeRemaining = Math.max(1, getTimedRoundSeconds(difficulty) - elapsed);
      const scoreResult = calculateTimedPoints(difficulty, timeRemaining, topBracketStreak);
      const pointsGained = scoreResult.points;

      setPoints((prev) => prev + pointsGained);
      setPracticeCount((prev) => prev + 1);
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
          setRoundComplete(true);
          return;
        }
        setIndex((prev) => prev + 1);
      }, getRewardAnimationDuration(scoreResult.tier));
    } else {
      playError();
      setStatus("error");
      setTopBracketStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      updateStreak(false);
    }
  };

  const canUseMagnet = () => {
    if (roundComplete || status === "success") return false;
    const targetIndexes = Array.from(new Set([0, word.length - 1]));
    return targetIndexes.some((targetIndex) => answerSlots[targetIndex]?.letter !== word[targetIndex]);
  };

  const canUseShadow = () => {
    if (roundComplete || status === "success") return false;
    return answerSlots.some((slot) => slot === null);
  };

  const applyNeonMagnet = () => {
    if (!canUseMagnet()) {
      setHintMessage("Neon Magnet needs an incorrect edge slot to snap into place.");
      return false;
    }

    const targetIndexes = Array.from(new Set([0, word.length - 1]));
    const nextTiles = tiles.map((tile) => ({ ...tile, pulse: false }));
    const nextSlots = [...answerSlots];
    const pulsedTargets = [];

    for (const targetIndex of targetIndexes) {
      const correctLetter = word[targetIndex];
      const existingSlot = nextSlots[targetIndex];

      if (existingSlot?.letter === correctLetter) {
        pulsedTargets.push(targetIndex);
        continue;
      }

      if (existingSlot?.tileId) {
        const occupiedTile = nextTiles.find((tile) => tile.id === existingSlot.tileId);
        if (occupiedTile) occupiedTile.used = false;
        nextSlots[targetIndex] = null;
      }

      let sourceTile = nextTiles.find((tile) => tile.letter === correctLetter && !tile.used);

      if (!sourceTile) {
        const sourceIndex = nextSlots.findIndex(
          (slot, slotIndex) => slotIndex !== targetIndex && slot?.letter === correctLetter
        );

        if (sourceIndex !== -1) {
          const sourceSlot = nextSlots[sourceIndex];
          sourceTile = nextTiles.find((tile) => tile.id === sourceSlot.tileId);
          nextSlots[sourceIndex] = null;
        }
      }

      if (!sourceTile) continue;

      sourceTile.used = true;
      sourceTile.pulse = true;
      nextSlots[targetIndex] = { letter: correctLetter, tileId: sourceTile.id, source: "magnet" };
      pulsedTargets.push(targetIndex);
    }

    if (!pulsedTargets.length) {
      setHintMessage("No eligible letter tile was available for the magnet.");
      return false;
    }

    setTiles(nextTiles);
    setAnswerSlots(nextSlots);
    setMagnetTargets(pulsedTargets);
    setShadowPreviewIndex(null);
    setHintMessage("Neon Magnet locked the edges.");
    setHintFxKey("neonMagnet");
    if (status === "error" && questionTimeLeft > 0) setStatus("idle");
    return true;
  };

  const applyShadowLetter = () => {
    if (!canUseShadow()) {
      setHintMessage("Shadow Letter only works while there is an empty answer slot.");
      return false;
    }

    const emptyIndexes = answerSlots
      .map((slot, slotIndex) => (slot === null ? slotIndex : null))
      .filter((slotIndex) => slotIndex !== null);
    const selectedIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    setShadowPreviewIndex(selectedIndex);
    setHintMessage("Shadow Letter revealed a ghost clue.");
    setHintFxKey("shadowLetter");
    return true;
  };

  const applyHintEffect = (hintKey) => {
    if (hintKey === "neonMagnet") return applyNeonMagnet();
    if (hintKey === "shadowLetter") return applyShadowLetter();
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

  const levelsCompleted = Math.floor(practiceCount / 3);

  return (
    <>
      <Navbar />
      <div className="relative w-full bg-[#030303] text-slate-200 font-sans overflow-hidden selection:bg-pink-500/30" style={{ height: "calc(100dvh - 80px)", marginTop: "80px" }}>
        <GameHUD
          points={points}
          gameState={status === "success" ? "correct" : status === "error" ? "incorrect" : null}
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
          <div className="flex items-center justify-center w-full h-full group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>

            <div className={`relative w-full h-full bg-[#161129]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-300 ${shake ? "animate-shake" : ""} flex flex-col`}>
              <div className="flex items-center justify-between px-3 md:px-5 py-2 md:py-3 border-b border-white/5 bg-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
                    SPELLING
                  </span>
                  <span className="text-white/30 text-xs font-medium hidden sm:inline">| {difficulty} · {currentWordData.category}</span>
                </div>
                <div className="flex items-center gap-2 text-white/40 font-mono">
                  <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: roundLength }).map((_, i) => (
                      <span key={i} className={`inline-block rounded-full transition-all duration-300 ${i < index ? "w-2 h-2 bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.8)]" : i === index ? "w-2.5 h-2.5 bg-pink-400 ring-2 ring-pink-400/40 shadow-[0_0_10px_rgba(236,72,153,0.6)]" : "w-1.5 h-1.5 bg-white/15"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold">
                    <span className="text-pink-400">{index + 1}</span>
                    <span className="text-white/30"> / {roundLength}</span>
                  </span>
                  <span className="text-yellow-300 font-bold text-xs">🪙 {user?.coins || 0}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-3 md:px-5 py-3 md:py-4 space-y-3 overflow-hidden">
                {showDefinition && (
                  <div className="max-w-2xl px-6 py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-in fade-in zoom-in-95">
                    <p className="text-center text-sm italic text-amber-200">"{currentWordData.hint}"</p>
                  </div>
                )}

                {hintMessage && (
                  <div className="hint-toast max-w-xl rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-center text-sm text-cyan-100">
                    {hintMessage}
                  </div>
                )}

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

                <div className="relative">
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {tiles.map((tile) => (
                      <button
                        key={tile.id}
                        onClick={() => handleKeyPress(tile.id)}
                        disabled={status === "success" || tile.used}
                        className={`w-11 h-12 md:w-14 md:h-14 border-b-4 rounded-xl flex items-center justify-center text-xl md:text-3xl font-black transition-all duration-300 active:translate-y-1 active:border-b-0 disabled:opacity-35 disabled:cursor-not-allowed ${
                          tile.used
                            ? "bg-[#111219] border-white/5 text-white/20"
                            : tile.pulse
                            ? "bg-cyan-500/20 border-cyan-300/40 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.25)] -translate-y-1 hint-pop-in"
                            : "bg-[#1a1b23] hover:bg-[#24252d] border-black/40 hover:-translate-y-1 hover:border-pink-500/30"
                        }`}
                      >
                        {tile.letter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-1.5 md:gap-2 flex-wrap">
                  {word.split("").map((letter, slotIndex) => {
                    const slot = answerSlots[slotIndex];
                    const isMagnetTarget = magnetTargets.includes(slotIndex);
                    const showShadow = shadowPreviewIndex === slotIndex && !slot;

                    return (
                      <button
                        key={slotIndex}
                        onClick={() => handleSlotClick(slotIndex)}
                        disabled={status === "success" || !slot}
                        className={`w-9 h-11 md:w-11 md:h-13 rounded-xl border-2 flex items-center justify-center text-lg md:text-xl font-black transition-all duration-300 ${
                          status === "success"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-default"
                            : status === "error"
                            ? "border-rose-500 bg-rose-500/10 text-rose-400 cursor-pointer hover:bg-rose-500/20"
                            : slot
                            ? isMagnetTarget
                              ? "border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.35)] scale-105 cursor-pointer hover:bg-cyan-500/20 active:scale-95 hint-pop-in"
                              : "border-pink-500 bg-pink-500/5 text-white cursor-pointer hover:bg-pink-500/15 hover:border-pink-400 active:scale-95"
                            : showShadow
                            ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-100/70 animate-pulse hint-spotlight cursor-default"
                            : "border-white/10 text-white/20 cursor-default"
                        }`}
                      >
                        {slot?.letter || (showShadow ? letter : "")}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl w-full">
                  <button
                    onClick={resetAnswerBoard}
                    disabled={roundComplete}
                    className="flex-1 min-w-[120px] py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10 active:scale-95 text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowDefinition((prev) => !prev)}
                    disabled={roundComplete}
                    className="flex-1 min-w-[120px] py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                  >
                    Definition Hint
                  </button>
                </div>
              </div>

              <div className="px-3 md:px-5 py-3 flex items-center justify-center gap-3 bg-black/20 border-t border-white/5">
                <button
                  onClick={checkSpelling}
                  disabled={status === "success" || input.length === 0 || roundComplete}
                  className={`flex-1 max-w-md py-3 px-6 rounded-xl font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    status === "success"
                      ? "bg-emerald-600 shadow-emerald-900/40"
                      : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-purple-500/20"
                  }`}
                >
                  {status === "success" ? (
                    <>
                      <span className="text-2xl">✓</span>
                      CORRECT!
                    </>
                  ) : (
                    <>CHECK ANSWER</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="hidden">
            <StatRow label="Words practiced" value={practiceCount} color="text-pink-400" />
            <StatRow label="Levels completed" value={levelsCompleted} />
            <StatRow label="Current streak" value={user?.streak || 0} color="text-orange-400" />
            <StatRow label="Total score" value={points} color="text-emerald-400" />
          </div>
        </main>

        <GameEndOverlay
          open={roundComplete}
          title="Spelling Round Complete"
          score={points}
          practiced={roundLength}
          difficulty={difficulty}
          theme="spelling"
          onNextLevel={difficulty !== "hard" ? onNextDifficulty : undefined}
          onReplay={() => {
            setRoundComplete(false);
            setIndex(0);
            setStatus("idle");
            setShake(false);
            setShowDefinition(false);
            setPoints(0);
            setPracticeCount(0);
            setRoundSeed((prev) => prev + 1);
            setTiles([]);
            setAnswerSlots([]);
            setShadowPreviewIndex(null);
            setMagnetTargets([]);
            setHintMessage("");
            setActiveHintKey(null);
            setHintFxKey(null);
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
          helperText={activeHintKey && !canAfford(HINT_CONFIG[activeHintKey].cost) ? "Not enough coins in your wallet yet." : "If you confirm, the hint is bought and applied instantly."}
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

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
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

export default Spelling;