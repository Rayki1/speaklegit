import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import GameHUD from "../components/GameHUD";
import GameEndOverlay from "../components/GameEndOverlay";
import ArcadePurchaseModal from "../components/ArcadePurchaseModal";
import useErrorSound from "../hooks/useErrorSound";
import { calculateTimedPoints, getTimedRoundSeconds } from "../utils/scoring";
import { buildQuestionDeck, getAdaptiveDifficulty } from "../utils/questionDeck";

const VOCAB_PAIRS = {
  easy: [
    { word: "happy", def: "Feeling joyful and full of good spirits" },
    { word: "fast", def: "Moving or able to move at high speed" },
    { word: "brave", def: "Ready to face danger without fear" },
    { word: "kind", def: "Friendly and generous to others" },
    { word: "bright", def: "Full of light, or very intelligent" },
    { word: "loud", def: "Making a lot of noise" },
    { word: "small", def: "Little in size or amount" },
    { word: "clean", def: "Free from dirt or mess" },
    { word: "cold", def: "Having a low temperature" },
    { word: "tall", def: "Of greater than average height" },
    { word: "soft", def: "Gentle or smooth when touched" },
    { word: "quiet", def: "Making little or no noise" },
    { word: "sharp", def: "Having a very thin edge for cutting" },
    { word: "warm", def: "Having a moderate and pleasant heat" },
    { word: "dark", def: "With little or no light present" },
    { word: "sweet", def: "Having the pleasant taste of sugar" },
    { word: "hot", def: "Having a very high temperature" },
    { word: "new", def: "Made or existing only a short time" },
    { word: "old", def: "Having existed for a long time" },
    { word: "big", def: "Large in size or amount" },
    { word: "wet", def: "Covered with water or moisture" },
    { word: "dry", def: "Free from moisture or liquid" },
    { word: "young", def: "Being in an early stage of life" },
    { word: "strong", def: "Having great physical power" },
    { word: "weak", def: "Lacking physical strength or force" },
    { word: "long", def: "Measuring a great distance from end to end" },
    { word: "short", def: "Not tall or not long in length" },
    { word: "heavy", def: "Having great weight" },
    { word: "light", def: "Having little weight; not heavy" },
    { word: "funny", def: "Causing laughter or amusement" },
    { word: "angry", def: "Feeling strong displeasure or rage" },
    { word: "sad", def: "Feeling unhappy or sorrowful" },
    { word: "tired", def: "In need of rest or sleep" },
    { word: "busy", def: "Actively engaged in many tasks at once" },
    { word: "full", def: "Containing as much as possible" },
    { word: "empty", def: "Containing nothing inside" },
    { word: "open", def: "Not closed or blocked off" },
    { word: "round", def: "Having the shape of a circle" },
    { word: "flat", def: "Smooth and level with no raised parts" },
    { word: "rich", def: "Having a lot of money or resources" },
    { word: "clean", def: "Free from dirt or unwanted marks" },
    { word: "safe", def: "Protected from harm or danger" },
    { word: "slow", def: "Moving or happening at a low speed" },
    { word: "smart", def: "Showing quick intelligence or judgment" },
    { word: "early", def: "Happening before the expected time" },
  ],
  medium: [
    { word: "curious", def: "Eager to know or learn something new" },
    { word: "patient", def: "Able to wait calmly without becoming annoyed" },
    { word: "honest", def: "Truthful and sincere in behavior and speech" },
    { word: "generous", def: "Willing to give more than is expected" },
    { word: "confident", def: "Feeling sure about one's own abilities" },
    { word: "creative", def: "Using imagination to produce original ideas" },
    { word: "humble", def: "Having a modest view of one's importance" },
    { word: "polite", def: "Respectful and considerate in manner" },
    { word: "stubborn", def: "Refusing to change one's opinion or action" },
    { word: "anxious", def: "Feeling worried or nervous about something" },
    { word: "grateful", def: "Feeling thankful for a kindness received" },
    { word: "ambitious", def: "Having a strong desire to achieve success" },
    { word: "cautious", def: "Being careful to avoid risks or danger" },
    { word: "sincere", def: "Genuine and honest in what one says or does" },
    { word: "reliable", def: "Consistently good and able to be trusted" },
    { word: "diligent", def: "Showing great care and hard work in one's efforts" },
    { word: "flexible", def: "Able to change or adapt to new situations easily" },
    { word: "optimistic", def: "Hopeful and positive about the future" },
    { word: "energetic", def: "Full of energy and enthusiasm" },
    { word: "persistent", def: "Continuing firmly despite difficulty or opposition" },
    { word: "responsible", def: "Trusted to do what is right or expected" },
    { word: "independent", def: "Not needing help from others to function" },
    { word: "courageous", def: "Brave enough to face danger or difficulty" },
    { word: "thoughtful", def: "Showing care for the needs of others" },
    { word: "observant", def: "Quick to notice things in the environment" },
    { word: "determined", def: "Having a firm goal and refusing to quit" },
    { word: "practical", def: "Focused on real use rather than theory" },
    { word: "logical", def: "Based on clear and sound reasoning" },
    { word: "sensible", def: "Showing good judgment in everyday situations" },
    { word: "tolerant", def: "Willing to accept views different from your own" },
    { word: "disciplined", def: "Showing controlled behavior and good habits" },
    { word: "productive", def: "Able to produce a great amount of useful work" },
    { word: "cooperative", def: "Working well together with others" },
    { word: "sympathetic", def: "Showing care and understanding for others" },
    { word: "dedicated", def: "Giving much time and effort to a goal" },
    { word: "adaptable", def: "Able to adjust well to new conditions" },
    { word: "passionate", def: "Showing very strong feeling or enthusiasm" },
    { word: "innovative", def: "Introducing new and creative ideas or methods" },
    { word: "competitive", def: "Having a strong desire to succeed or win" },
    { word: "enthusiastic", def: "Showing intense and eager interest in something" },
    { word: "insightful", def: "Showing deep and accurate understanding" },
    { word: "methodical", def: "Done in a careful and systematic way" },
    { word: "proactive", def: "Acting in advance to handle future situations" },
    { word: "resourceful", def: "Good at solving problems creatively" },
    { word: "strategic", def: "Planned to achieve long-term goals" },
  ],
  hard: [
    { word: "eloquent", def: "Expressing ideas clearly and persuasively in speech" },
    { word: "resilient", def: "Recovering quickly from difficulties or setbacks" },
    { word: "profound", def: "Very great or having deep meaning and insight" },
    { word: "advocate", def: "A person who publicly supports a cause or policy" },
    { word: "empathy", def: "The ability to understand and share another's feelings" },
    { word: "skeptical", def: "Doubtful about something; not easily convinced" },
    { word: "coherent", def: "Logical, consistent, and easy to understand" },
    { word: "versatile", def: "Able to adapt and excel in many different areas" },
    { word: "meticulous", def: "Showing great attention to every small detail" },
    { word: "tenacious", def: "Very determined and refusing to give up" },
    { word: "pragmatic", def: "Dealing with problems in a practical and sensible way" },
    { word: "astute", def: "Having a clever ability to notice and understand things" },
    { word: "integrity", def: "The quality of being honest and having strong moral values" },
    { word: "persevere", def: "To continue steadfastly despite difficulty or delay" },
    { word: "innovate", def: "To introduce new methods or ideas for the first time" },
    { word: "articulate", def: "Able to express thoughts and ideas clearly and fluently" },
    { word: "ambiguous", def: "Having more than one possible meaning or interpretation" },
    { word: "benevolent", def: "Kind and generous, especially to those in need" },
    { word: "clandestine", def: "Done in secret or kept carefully hidden from others" },
    { word: "ephemeral", def: "Lasting for only a very short time" },
    { word: "fastidious", def: "Very careful and attentive to every small detail" },
    { word: "gregarious", def: "Enjoying the company of other people; sociable" },
    { word: "impeccable", def: "Without any faults or errors; perfectly done" },
    { word: "magnanimous", def: "Generous and forgiving, especially toward rivals" },
    { word: "nonchalant", def: "Appearing relaxed and not worried or concerned" },
    { word: "paramount", def: "More important than everything else" },
    { word: "sagacious", def: "Having sharp judgment and deep practical wisdom" },
    { word: "ubiquitous", def: "Seeming to appear or be present everywhere at once" },
    { word: "zealous", def: "Full of energy and enthusiasm in pursuit of a cause" },
    { word: "acrimonious", def: "Bitter and angry in speech or manner" },
    { word: "altruistic", def: "Caring for others without thinking of personal gain" },
    { word: "candid", def: "Truthful and straightforward, even if blunt" },
    { word: "circumspect", def: "Careful to consider all possible risks before acting" },
    { word: "emulate", def: "To try to match or surpass someone greatly admired" },
    { word: "forbearance", def: "Patient restraint and self-control in difficult situations" },
    { word: "inquisitive", def: "Curious and eager to ask questions and learn" },
    { word: "loquacious", def: "Tending to talk a great deal; very talkative" },
    { word: "pensive", def: "Engaged in deep, serious thought" },
    { word: "voracious", def: "Having a very strong and eager desire for something" },
    { word: "juxtapose", def: "Place two things side by side to highlight their differences" },
    { word: "ameliorate", def: "To make something bad become better" },
    { word: "circumspect", def: "Careful to consider possible consequences" },
    { word: "obdurate", def: "Stubbornly refusing to change opinion" },
    { word: "quixotic", def: "Exceedingly idealistic and unrealistic" },
    { word: "recalcitrant", def: "Resisting authority or control" },
  ],
};

const PAIRS_PER_ROUND = 4;
const TOTAL_SETS = 10;

const HINT_CONFIGS = {
  spotlight: { label: "Spotlight", icon: "🔦", cost: 10, helperText: "Briefly highlights a correct word–definition pair." },
  skipPair: { label: "Skip Pair", icon: "⏭", cost: 15, helperText: "Auto-matches one pair for partial points." },
};

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function VocabMatch({ difficulty, onNextDifficulty }) {
  const { addScore, updateStreak, addWordPracticed, user, spendCoins, canAfford } = useContext(UserContext);
  const playError = useErrorSound();
  const [roundSeed, setRoundSeed] = useState(0);
  const adaptiveDifficulty = useMemo(
    () => getAdaptiveDifficulty(difficulty, user?.streak || 0, roundSeed),
    [difficulty, user?.streak, roundSeed]
  );

  const allPairs = useMemo(
    () =>
      buildQuestionDeck({
        items: VOCAB_PAIRS[adaptiveDifficulty] || VOCAB_PAIRS.easy,
        count: PAIRS_PER_ROUND * TOTAL_SETS,
        gameKey: "vocab-match",
        difficulty: adaptiveDifficulty,
        replaySeed: roundSeed,
        getId: (entry) => `${entry.word}|${entry.def}`,
      }),
    [adaptiveDifficulty, roundSeed]
  );

  const [setIndex, setSetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedDef, setSelectedDef] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [spotlightWord, setSpotlightWord] = useState(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [activeHintKey, setActiveHintKey] = useState(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(() => getTimedRoundSeconds(difficulty) * 2);
  const [hintToast, setHintToast] = useState("");
  const [hintBoostWord, setHintBoostWord] = useState(null);
  const [topBracketStreak, setTopBracketStreak] = useState(0);
  const [scoreFx, setScoreFx] = useState(null);
  const scoreFxCounterRef = useRef(0);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!hintToast) return undefined;
    const timer = setTimeout(() => setHintToast(""), 1300);
    return () => clearTimeout(timer);
  }, [hintToast]);

  useEffect(() => {
    if (!hintBoostWord) return undefined;
    const timer = setTimeout(() => setHintBoostWord(null), 450);
    return () => clearTimeout(timer);
  }, [hintBoostWord]);

  const currentPairs = useMemo(() => {
    const start = setIndex * PAIRS_PER_ROUND;
    return allPairs.slice(start, start + PAIRS_PER_ROUND);
  }, [allPairs, setIndex]);

  const shuffledDefs = useMemo(() => shuffleArray([...currentPairs]), [currentPairs]);

  const advanceSet = () => {
    const next = setIndex + 1;
    if (next >= TOTAL_SETS) {
      setRoundComplete(true);
    } else {
      setSetIndex(next);
      setMatched([]);
      setSelectedWord(null);
      setSelectedDef(null);
      setQuestionTimeLeft(getTimedRoundSeconds(difficulty) * 2);
    }
  };

  useEffect(() => {
    if (matched.length === PAIRS_PER_ROUND) {
      setTimeout(() => {
        advanceSet();
      }, 700);
    }
  }, [matched, setIndex]);

  useEffect(() => {
    if (roundComplete || questionTimeLeft <= 0 || matched.length === PAIRS_PER_ROUND) return undefined;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTimeLeft, roundComplete, matched.length]);

  useEffect(() => {
    if (roundComplete || questionTimeLeft > 0 || matched.length === PAIRS_PER_ROUND) return;

    setHintToast("Time's up! Next set.");
    setTopBracketStreak(0);
    addScore(difficulty, false);
    updateStreak(false);
    playError();

    const timer = setTimeout(() => {
      advanceSet();
    }, 850);

    return () => clearTimeout(timer);
  }, [questionTimeLeft, roundComplete, matched.length, setIndex]);

  const attemptMatch = (wordKey, defKey) => {
    if (wordKey === defKey) {
      const timeRemaining = Math.max(1, questionTimeLeft);
      const scoreResult = calculateTimedPoints(difficulty, timeRemaining, topBracketStreak);

      setScore((prev) => prev + scoreResult.points);
      setMatched((prev) => [...prev, wordKey]);
      setSelectedWord(null);
      setSelectedDef(null);
      setHintToast(`${scoreResult.performance}! +${scoreResult.points} pts${scoreResult.multiplier > 1 ? ` (x${scoreResult.multiplier})` : ""}`);
      setTopBracketStreak(scoreResult.nextTopBracketStreak);
      scoreFxCounterRef.current += 1;
      setScoreFx({
        key: `fx-${scoreFxCounterRef.current}`,
        tier: scoreResult.tier,
        callout: scoreResult.callout,
        multiplier: scoreResult.multiplier,
        points: scoreResult.points,
      });
      addScore(difficulty, true);
      updateStreak(true);
      addWordPracticed();
    } else {
      setWrongFlash({ word: wordKey, def: defKey });
      setTimeout(() => { setWrongFlash(null); setSelectedWord(null); setSelectedDef(null); }, 550);
      setTopBracketStreak(0);
      addScore(difficulty, false);
      playError();
      updateStreak(false);
    }
  };

  const handleWordClick = (word) => {
    if (matched.includes(word)) return;
    const next = word === selectedWord ? null : word;
    setSelectedWord(next);
    if (next && selectedDef) attemptMatch(next, selectedDef);
  };

  const handleDefClick = (defWord) => {
    if (matched.includes(defWord)) return;
    const next = defWord === selectedDef ? null : defWord;
    setSelectedDef(next);
    if (next && selectedWord) attemptMatch(selectedWord, next);
  };

  const requestHint = (key) => setActiveHintKey(key);

  const confirmHint = () => {
    if (!activeHintKey || !canAfford(HINT_CONFIGS[activeHintKey].cost)) return;
    spendCoins(HINT_CONFIGS[activeHintKey].cost);

    if (activeHintKey === "spotlight") {
      const unmatched = currentPairs.filter((p) => !matched.includes(p.word));
      if (unmatched.length > 0) {
        const pick = unmatched[0];
        setSpotlightWord(pick.word);
        setHintToast("Hint used: spotlight active.");
        setTimeout(() => setSpotlightWord(null), 1800);
      }
    } else if (activeHintKey === "skipPair") {
      const unmatched = currentPairs.filter((p) => !matched.includes(p.word));
      if (unmatched.length > 0) {
        const pickedWord = unmatched[0].word;
        setMatched((prev) => [...prev, pickedWord]);
        setScore((prev) => prev + 10);
        setHintBoostWord(pickedWord);
        setHintToast("Hint used: one pair auto-matched.");
        addWordPracticed();
      }
    }

    setActiveHintKey(null);
  };

  const totalPairs = PAIRS_PER_ROUND * TOTAL_SETS;

  return (
    <>
      <Navbar />
      <div
        className="relative w-full bg-[#030303] text-slate-200 font-sans overflow-hidden"
        style={{ height: "calc(100dvh - 80px)", marginTop: "80px" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-cyan-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <GameHUD
          points={score}
          gameState={null}
          difficulty={difficulty}
          time={questionTimeLeft}
          showTimer
          scoreFx={scoreFx}
          topBracketStreak={topBracketStreak}
        />

        <div className="relative z-10 h-full max-w-2xl mx-auto px-3 sm:px-4 py-2 flex flex-col gap-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-1 flex-shrink-0">
            <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              VOCAB MATCH
            </span>
            <div className="flex items-center gap-2 text-white/40 font-mono text-xs">
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: TOTAL_SETS }).map((_, i) => (
                  <span key={i} className={`inline-block rounded-full transition-all duration-300 ${i < setIndex ? "w-2 h-2 bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]" : i === setIndex ? "w-2.5 h-2.5 bg-cyan-400 ring-2 ring-cyan-400/40" : "w-1.5 h-1.5 bg-white/15"}`} />
                ))}
              </div>
              <span className="font-bold"><span className="text-cyan-400">{setIndex + 1}</span><span className="text-white/30"> / {TOTAL_SETS}</span></span>
              <span className="text-yellow-300 font-bold">🪙 {user?.coins || 0}</span>
            </div>
          </div>

          {/* Hints + progress */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {Object.entries(HINT_CONFIGS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => requestHint(key)}
                disabled={roundComplete}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 transition active:scale-95 disabled:opacity-40"
              >
                {cfg.icon} <span className="hidden sm:inline">{cfg.label}</span> <span className="text-yellow-300">{cfg.cost}🪙</span>
              </button>
            ))}
            <span className="ml-auto text-[10px] text-white/30">{matched.length}/{PAIRS_PER_ROUND} matched</span>
          </div>

          <p className="text-center text-[11px] sm:text-xs uppercase tracking-[0.16em] text-cyan-100/95 font-extrabold flex-shrink-0 bg-cyan-500/18 border border-cyan-300/35 rounded-lg px-3 py-2 shadow-[0_0_10px_rgba(34,211,238,0.22)]">
            Tap a word, then tap its matching definition.
          </p>

          {hintToast && (
            <div className="hint-toast flex-shrink-0 rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-center text-cyan-200">
              {hintToast}
            </div>
          )}

          {/* Two columns */}
          <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden min-h-0">
            {/* Words */}
            <div className="flex flex-col gap-2 h-full">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100 font-black text-center mb-1.5 flex-shrink-0 bg-cyan-500/20 border border-cyan-300/35 rounded-md px-2 py-1">Words</p>
              {currentPairs.map(({ word }) => {
                const isMatched = matched.includes(word);
                const isSelected = selectedWord === word;
                const isWrong = wrongFlash?.word === word;
                const isSpotlit = spotlightWord === word;
                return (
                  <button
                    key={word}
                    onClick={() => handleWordClick(word)}
                    disabled={isMatched}
                    className={`flex-1 min-h-0 rounded-xl border font-black text-sm transition-all active:scale-95 px-2 ${hintBoostWord === word ? "hint-pop-in" : ""} ${isSpotlit ? "hint-spotlight" : ""}
                      ${isMatched ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 opacity-60 cursor-default" :
                        isSpotlit ? "border-cyan-300 bg-cyan-500/20 text-cyan-100 shadow-[0_0_16px_rgba(6,182,212,0.5)]" :
                        isWrong ? "border-rose-400/50 bg-rose-500/10 text-rose-300" :
                        isSelected ? "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.3)]" :
                        "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/25"}`}
                  >
                    {word} {isMatched && "✓"}
                  </button>
                );
              })}
            </div>

            {/* Definitions */}
            <div className="flex flex-col gap-2 h-full">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100 font-black text-center mb-1.5 flex-shrink-0 bg-cyan-500/20 border border-cyan-300/35 rounded-md px-2 py-1">Definitions</p>
              {shuffledDefs.map(({ word: defWord, def }) => {
                const isMatched = matched.includes(defWord);
                const isSelected = selectedDef === defWord;
                const isWrong = wrongFlash?.def === defWord;
                const isSpotlit = spotlightWord === defWord;
                return (
                  <button
                    key={defWord}
                    onClick={() => handleDefClick(defWord)}
                    disabled={isMatched}
                    className={`flex-1 min-h-0 rounded-xl border text-xs font-semibold text-left px-3 py-1 transition-all active:scale-95 leading-snug ${hintBoostWord === defWord ? "hint-pop-in" : ""} ${isSpotlit ? "hint-spotlight" : ""}
                      ${isMatched ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 opacity-60 cursor-default" :
                        isSpotlit ? "border-cyan-300 bg-cyan-500/20 text-cyan-100 shadow-[0_0_16px_rgba(6,182,212,0.5)]" :
                        isWrong ? "border-rose-400/50 bg-rose-500/10 text-rose-300" :
                        isSelected ? "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.3)]" :
                        "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/25"}`}
                  >
                    {def}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <GameEndOverlay
          open={roundComplete}
          title="Vocab Match Complete!"
          score={score}
          practiced={totalPairs}
          difficulty={difficulty}
          theme="vocabmatch"
          onNextLevel={difficulty !== "hard" ? onNextDifficulty : undefined}
          onReplay={() => { setRoundComplete(false); setSetIndex(0); setMatched([]); setSelectedWord(null); setSelectedDef(null); setScore(0); setRoundSeed((prev) => prev + 1); setQuestionTimeLeft(getTimedRoundSeconds(difficulty) * 2); }}
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
      </div>
    </>
  );
}
