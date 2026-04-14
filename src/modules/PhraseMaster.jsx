import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import GameHUD from "../components/GameHUD";
import GameEndOverlay from "../components/GameEndOverlay";
import ArcadePurchaseModal from "../components/ArcadePurchaseModal";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useErrorSound from "../hooks/useErrorSound";
import { calculateTimedPoints, getRewardAnimationDuration, getTimedRoundSeconds } from "../utils/scoring";
import { buildQuestionDeck, getAdaptiveDifficulty } from "../utils/questionDeck";

const PHRASE_DATA = {
  easy: [
    { sentence: "I want to drink a ___ of water.", blank: "glass", choices: ["glass", "plate", "book"], full: "I want to drink a glass of water" },
    { sentence: "She reads a ___ every day.", blank: "book", choices: ["book", "chair", "cloud"], full: "She reads a book every day" },
    { sentence: "The ___ is shining in the sky.", blank: "sun", choices: ["sun", "moon", "rain"], full: "The sun is shining in the sky" },
    { sentence: "I brush my ___ every morning.", blank: "teeth", choices: ["teeth", "hair", "shoes"], full: "I brush my teeth every morning" },
    { sentence: "We eat lunch in the ___.", blank: "kitchen", choices: ["kitchen", "bedroom", "garden"], full: "We eat lunch in the kitchen" },
    { sentence: "The dog runs ___ in the park.", blank: "fast", choices: ["fast", "slow", "quiet"], full: "The dog runs fast in the park" },
    { sentence: "She wore a pretty ___ dress.", blank: "blue", choices: ["blue", "loud", "soft"], full: "She wore a pretty blue dress" },
    { sentence: "It is ___ outside today.", blank: "cold", choices: ["cold", "loud", "heavy"], full: "It is cold outside today" },
    { sentence: "He plays ___ after school.", blank: "football", choices: ["football", "music", "books"], full: "He plays football after school" },
    { sentence: "My mother is a good ___.", blank: "cook", choices: ["cook", "chair", "river"], full: "My mother is a good cook" },
    { sentence: "The children ___ in the playground every afternoon.", blank: "play", choices: ["play", "paint", "sleep"], full: "The children play in the playground every afternoon" },
    { sentence: "We ___ our hands before eating.", blank: "wash", choices: ["wash", "draw", "hide"], full: "We wash our hands before eating" },
    { sentence: "She bought a ___ of bread from the bakery.", blank: "loaf", choices: ["loaf", "stone", "blanket"], full: "She bought a loaf of bread from the bakery" },
    { sentence: "The baby is ___ on the bed.", blank: "sleeping", choices: ["sleeping", "flying", "driving"], full: "The baby is sleeping on the bed" },
    { sentence: "I ___ my homework every evening.", blank: "finish", choices: ["finish", "borrow", "forget"], full: "I finish my homework every evening" },
  ],
  medium: [
    { sentence: "The teacher wrote on the ___.", blank: "blackboard", choices: ["blackboard", "window", "ceiling"], full: "The teacher wrote on the blackboard" },
    { sentence: "He ___ to school by bus.", blank: "travels", choices: ["travels", "dances", "sleeps"], full: "He travels to school by bus" },
    { sentence: "Please ___ the door when you leave.", blank: "close", choices: ["close", "paint", "ignore"], full: "Please close the door when you leave" },
    { sentence: "The ___ shines brightly at night.", blank: "moon", choices: ["moon", "grass", "floor"], full: "The moon shines brightly at night" },
    { sentence: "She was ___ to win the competition.", blank: "determined", choices: ["determined", "confused", "hungry"], full: "She was determined to win the competition" },
    { sentence: "He solved the math ___ quickly.", blank: "problem", choices: ["problem", "music", "animal"], full: "He solved the math problem quickly" },
    { sentence: "The library has thousands of ___.", blank: "books", choices: ["books", "chairs", "clouds"], full: "The library has thousands of books" },
    { sentence: "I need to ___ my essay before submitting.", blank: "revise", choices: ["revise", "ignore", "decorate"], full: "I need to revise my essay before submitting" },
    { sentence: "He showed great ___ by helping others.", blank: "kindness", choices: ["kindness", "loudness", "darkness"], full: "He showed great kindness by helping others" },
    { sentence: "She learned a new ___ word in class.", blank: "vocabulary", choices: ["vocabulary", "medicine", "furniture"], full: "She learned a new vocabulary word in class" },
    { sentence: "The manager asked us to ___ the report by Friday.", blank: "submit", choices: ["submit", "ignore", "postpone"], full: "The manager asked us to submit the report by Friday" },
    { sentence: "We need to ___ our budget before the project starts.", blank: "finalize", choices: ["finalize", "scatter", "cancel"], full: "We need to finalize our budget before the project starts" },
    { sentence: "Her explanation was ___ enough for everyone to understand.", blank: "clear", choices: ["clear", "silent", "narrow"], full: "Her explanation was clear enough for everyone to understand" },
    { sentence: "The committee will ___ the proposal next week.", blank: "review", choices: ["review", "bury", "predict"], full: "The committee will review the proposal next week" },
    { sentence: "He remained ___ even under pressure.", blank: "focused", choices: ["focused", "absent", "uncertain"], full: "He remained focused even under pressure" },
  ],
  hard: [
    { sentence: "The scientist made a remarkable ___.", blank: "discovery", choices: ["discovery", "sandwich", "vacation"], full: "The scientist made a remarkable discovery" },
    { sentence: "He spoke with great ___ during the speech.", blank: "confidence", choices: ["confidence", "furniture", "silence"], full: "He spoke with great confidence during the speech" },
    { sentence: "She has a natural ___ for languages.", blank: "talent", choices: ["talent", "traffic", "climate"], full: "She has a natural talent for languages" },
    { sentence: "The medicine had an ___ effect on the patient.", blank: "immediate", choices: ["immediate", "ridiculous", "colorful"], full: "The medicine had an immediate effect on the patient" },
    { sentence: "They ___ their resources to finish the project.", blank: "combined", choices: ["combined", "decorated", "whispered"], full: "They combined their resources to finish the project" },
    { sentence: "His ___ attitude helped him overcome challenges.", blank: "positive", choices: ["positive", "expensive", "dangerous"], full: "His positive attitude helped him overcome challenges" },
    { sentence: "The government aims to ___ poverty.", blank: "eliminate", choices: ["eliminate", "celebrate", "describe"], full: "The government aims to eliminate poverty" },
    { sentence: "She demonstrated exceptional ___ in the debate.", blank: "eloquence", choices: ["eloquence", "darkness", "commerce"], full: "She demonstrated exceptional eloquence in the debate" },
    { sentence: "A good leader must ___ the team effectively.", blank: "motivate", choices: ["motivate", "confuse", "abandon"], full: "A good leader must motivate the team effectively" },
    { sentence: "The study revealed a ___ between diet and health.", blank: "connection", choices: ["connection", "decoration", "confusion"], full: "The study revealed a connection between diet and health" },
    { sentence: "Sustainable policies can ___ long-term economic stability.", blank: "promote", choices: ["promote", "dismiss", "scatter"], full: "Sustainable policies can promote long-term economic stability" },
    { sentence: "The professor asked students to ___ the data critically.", blank: "interpret", choices: ["interpret", "erase", "delay"], full: "The professor asked students to interpret the data critically" },
    { sentence: "Their proposal offered a ___ solution to the crisis.", blank: "comprehensive", choices: ["comprehensive", "fragile", "random"], full: "Their proposal offered a comprehensive solution to the crisis" },
    { sentence: "The research team will ___ their findings next month.", blank: "publish", choices: ["publish", "suspend", "misplace"], full: "The research team will publish their findings next month" },
    { sentence: "Effective communication can ___ misunderstandings in teams.", blank: "prevent", choices: ["prevent", "invite", "duplicate"], full: "Effective communication can prevent misunderstandings in teams" },
  ],
};

const ROUND_LENGTH = 10;

const HINT_CONFIGS = {
  eliminateWrong: { label: "Eliminate", icon: "❌", cost: 8, helperText: "Removes one wrong answer choice." },
  revealAnswer: { label: "Reveal", icon: "💡", cost: 12, helperText: "Highlights the correct choice for you." },
};

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreAccuracy(input, expected) {
  const a = normalize(input).split(" ").filter(Boolean);
  const b = normalize(expected).split(" ").filter(Boolean);
  if (!a.length || !b.length) return 0;
  if (normalize(input) === normalize(expected)) return 1;
  const bSet = new Set(b);
  let hits = 0;
  a.forEach((w) => { if (bSet.has(w)) hits += 1; });
  return hits / Math.max(a.length, b.length);
}

export default function PhraseMaster({ difficulty, onNextDifficulty }) {
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
        items: PHRASE_DATA[adaptiveDifficulty] || PHRASE_DATA.easy,
        count: ROUND_LENGTH,
        gameKey: "phrase-master",
        difficulty: adaptiveDifficulty,
        replaySeed: roundSeed,
        getId: (entry) => entry.full,
      }),
    [adaptiveDifficulty, roundSeed]
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("choose");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [eliminated, setEliminated] = useState([]);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const [shake, setShake] = useState(false);
  const [judgeType, setJudgeType] = useState(null);
  const [judgeText, setJudgeText] = useState("");
  const [score, setScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(() => getTimedRoundSeconds(difficulty));
  const [activeHintKey, setActiveHintKey] = useState(null);
  const [topBracketStreak, setTopBracketStreak] = useState(0);
  const [scoreFx, setScoreFx] = useState(null);
  const autoCheckRef = useRef("");
  const questionStartedAtRef = useRef(Date.now());
  const scoreFxCounterRef = useRef(0);

  const { listening, transcript, interimTranscript, supported, speechError, startListening, stopListening, clearTranscript } = useSpeechRecognition({
    singleWord: false, interimResults: true, continuous: false, minConfidence: 0.2,
  });

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    setIndex(0);
    setPhase("choose");
    setSelectedChoice(null);
    setEliminated([]);
    setRevealedAnswer(false);
    setShake(false);
    setJudgeType(null);
    setJudgeText("");
    setScore(0);
    setRoundComplete(false);
    setActiveHintKey(null);
    setTopBracketStreak(0);
    setScoreFx(null);
    clearTranscript();
    stopListening();
    autoCheckRef.current = "";
    scoreFxCounterRef.current = 0;
    questionStartedAtRef.current = Date.now();
    setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
  }, [difficulty]);

  useEffect(() => {
    if (phase !== "speak" || !transcript.trim() || listening) return;
    const key = `${index}-${normalize(transcript)}`;
    if (autoCheckRef.current === key) return;
    autoCheckRef.current = key;
    checkSpeech(transcript);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, listening, phase, index]);

  useEffect(() => {
    questionStartedAtRef.current = Date.now();
    setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
  }, [index, difficulty]);

  useEffect(() => {
    if (roundComplete || questionTimeLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTimeLeft, roundComplete]);

  useEffect(() => {
    if (roundComplete || questionTimeLeft > 0 || judgeType !== null) return;

    setJudgeType("error");
    setJudgeText("⌛ Time's up! Moving to next phrase.");
    setTopBracketStreak(0);
    updateStreak(false);
    addWordPracticed();
    stopListening();

    setTimeout(() => advance(), 900);
  }, [questionTimeLeft, roundComplete, judgeType]);

  const current = deck[index];

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleChoiceSelect = (choice) => {
    if (phase !== "choose") return;
    setSelectedChoice(choice);
    if (choice === current.blank) {
      setJudgeType("success");
      setJudgeText("✓ Correct! Now speak the full sentence aloud.");
      setTimeout(() => {
        setPhase("speak");
        setJudgeText("");
        setJudgeType(null);
        clearTranscript();
        autoCheckRef.current = "";
      }, 700);
    } else {
      playError();
      setJudgeType("error");
      setJudgeText("✗ Not quite — try again!");
      triggerShake();
      setTimeout(() => { setSelectedChoice(null); setJudgeType(null); setJudgeText(""); }, 800);
    }
  };

  const checkSpeech = (spokenText) => {
    const accuracy = scoreAccuracy(spokenText, current.full);
    const success = accuracy >= 0.55;
    let gained = 0;
    let scoreResult = null;

    if (success) {
      const elapsed = Math.floor((Date.now() - questionStartedAtRef.current) / 1000);
      const timeRemaining = Math.max(1, getTimedRoundSeconds(difficulty) - elapsed);
      scoreResult = calculateTimedPoints(difficulty, timeRemaining, topBracketStreak);
      gained = scoreResult.points;
      setTopBracketStreak(scoreResult.nextTopBracketStreak);
      scoreFxCounterRef.current += 1;
      setScoreFx({
        key: `fx-${scoreFxCounterRef.current}`,
        tier: scoreResult.tier,
        callout: scoreResult.callout,
        multiplier: scoreResult.multiplier,
        points: gained,
      });
      setJudgeText(`🎤 ${scoreResult.performance}! +${gained} pts${scoreResult.multiplier > 1 ? ` (x${scoreResult.multiplier})` : ""}`);
      setJudgeType("success");
    } else {
      setTopBracketStreak(0);
      setJudgeType("warn");
      setJudgeText("Good try! 0 pts");
    }

    setScore((prev) => prev + gained);
    addScore(difficulty, success);
    updateStreak(success);
    addWordPracticed();
    const delay = success && scoreResult ? getRewardAnimationDuration(scoreResult.tier) : 1500;
    setTimeout(() => advance(), delay);
  };

  const advance = () => {
    const next = index + 1;
    if (next >= ROUND_LENGTH) { setRoundComplete(true); return; }
    setIndex(next);
    setPhase("choose");
    setSelectedChoice(null);
    setEliminated([]);
    setRevealedAnswer(false);
    setJudgeType(null);
    setJudgeText("");
    clearTranscript();
    stopListening();
    autoCheckRef.current = "";
    questionStartedAtRef.current = Date.now();
    setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
  };

  const requestHint = (key) => setActiveHintKey(key);

  const confirmHint = () => {
    if (!activeHintKey || !canAfford(HINT_CONFIGS[activeHintKey].cost)) return;
    spendCoins(HINT_CONFIGS[activeHintKey].cost);
    if (activeHintKey === "eliminateWrong") {
      const wrongs = current.choices.filter((c) => c !== current.blank && !eliminated.includes(c));
      if (wrongs.length > 0) setEliminated((prev) => [...prev, wrongs[0]]);
    } else if (activeHintKey === "revealAnswer") {
      setRevealedAnswer(true);
    }
    setActiveHintKey(null);
  };

  return (
    <>
      <Navbar />
      <div
        className="relative w-full bg-[#030303] text-slate-200 font-sans overflow-hidden"
        style={{ height: "calc(100dvh - 80px)", marginTop: "80px" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
          <div className="absolute bottom-0 -right-20 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" />
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

        <div className="relative z-10 h-full flex flex-col px-4 sm:px-6 lg:px-10 py-3 gap-3 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(251,191,36,1)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.35em] text-amber-300">Phrase Master</span>
            </div>
            <div className="flex items-center gap-1.5 flex-1">
              {Array.from({ length: ROUND_LENGTH }).map((_, i) => (
                <div key={i} className="relative flex-1 h-[3px] rounded-full bg-white/8 overflow-hidden">
                  <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                    i < index ? "w-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                    : i === index ? "w-1/2 bg-amber-400 animate-pulse"
                    : "w-0"
                  }`} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs font-bold flex-shrink-0">
              <span className="text-white/30 font-mono">
                <span className="text-amber-400">{index + 1}</span>
                <span className="text-white/20"> / {ROUND_LENGTH}</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-yellow-400/20 bg-yellow-500/8 text-yellow-300 text-[10px]">
                🪙 {user?.coins || 0}
              </span>
            </div>
          </div>

          {/* Hints row */}
          <div className="flex gap-2 flex-shrink-0">
            {Object.entries(HINT_CONFIGS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => requestHint(key)}
                disabled={phase !== "choose" || roundComplete}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 transition active:scale-95 disabled:opacity-40"
              >
                {cfg.icon} <span className="hidden sm:inline">{cfg.label}</span> <span className="text-yellow-300">{cfg.cost}🪙</span>
              </button>
            ))}
          </div>

          {/* Main card — fills all remaining space */}
          <div className={`flex-1 min-h-0 flex flex-col rounded-3xl border border-white/8 bg-[#0e0a1f]/95 backdrop-blur-xl overflow-hidden transition-all ${shake ? "animate-shake" : ""}`}
            style={{ boxShadow: "0 0 0 1px rgba(251,191,36,0.06), 0 32px 80px rgba(0,0,0,0.6)" }}
          >
            {/* Phase progress bar */}
            <div className="flex gap-1 px-5 pt-4 flex-shrink-0">
              {["choose", "speak"].map((p, i) => (
                <div key={p} className={`h-[3px] rounded-full flex-1 transition-all duration-300 ${
                  phase === p ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  : i < ["choose", "speak"].indexOf(phase) ? "bg-white/25"
                  : "bg-white/8"
                }`} />
              ))}
            </div>

            {/* Content — vertically centered, fills card */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16 py-6 gap-8">

              {/* Sentence display */}
              <div className="w-full max-w-2xl text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4 font-bold">
                  {phase === "choose" ? "Pick the missing word" : "Speak the full sentence"}
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-relaxed">
                  {current?.sentence.split("___").map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className={`inline-block min-w-[100px] border-b-2 text-center mx-2 transition-all duration-300 ${
                          phase === "speak"
                            ? "border-emerald-400 text-emerald-300"
                            : "border-amber-400/60 text-amber-300/70"
                        }`}>
                          {phase === "speak" ? current.blank : "______"}
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>

              {/* Choose phase — answer buttons */}
              {phase === "choose" && (
                <div className="w-full max-w-2xl grid grid-cols-3 gap-3 sm:gap-4">
                  {current?.choices.map((choice) => {
                    const isEliminated = eliminated.includes(choice);
                    const isRevealed = revealedAnswer && choice === current.blank;
                    return (
                      <button
                        key={choice}
                        onClick={() => !isEliminated && handleChoiceSelect(choice)}
                        disabled={isEliminated}
                        className={`relative py-4 sm:py-5 px-3 rounded-2xl border font-black text-sm sm:text-base transition-all active:scale-95
                          ${isEliminated
                            ? "border-white/5 bg-white/3 text-white/20 line-through cursor-not-allowed"
                            : isRevealed
                            ? "border-amber-400/60 bg-amber-500/20 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                            : selectedChoice === choice
                            ? "border-amber-400 bg-amber-500/20 text-amber-200"
                            : "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                          }`}
                      >
                        {choice}
                        {isRevealed && (
                          <span className="absolute -top-2 -right-2 text-[9px] bg-amber-400 text-black rounded-full w-5 h-5 flex items-center justify-center font-black">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Speak phase */}
              {phase === "speak" && (
                <div className="w-full max-w-lg flex flex-col items-center gap-5">
                  {/* Waveform */}
                  <div className="flex items-end gap-[4px] h-12">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-full transition-all duration-75 ${listening ? "bg-gradient-to-t from-amber-600 to-yellow-300 opacity-90" : "bg-white/10"}`}
                        style={{
                          width: "3px",
                          height: listening
                            ? `${8 + Math.abs(Math.sin(i * 0.6 + Date.now() * 0.003)) * 28}px`
                            : `${4 + Math.abs(Math.sin(i * 0.4)) * 8}px`,
                        }}
                      />
                    ))}
                  </div>

                  <p className="text-sm font-bold text-center min-h-[1.5em]">
                    {listening
                      ? <span className="text-amber-300 animate-pulse">🎤 Listening…</span>
                      : speechError === "no-speech"
                      ? <span className="text-rose-400">Didn't hear you — try again</span>
                      : speechError === "noisy"
                      ? <span className="text-amber-400">Too noisy — raise your voice</span>
                      : transcript
                      ? <span className="text-white/60 italic">"{transcript}"</span>
                      : <span className="text-white/30">Press mic to speak the sentence</span>
                    }
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { clearTranscript(); autoCheckRef.current = ""; startListening(); }}
                      disabled={listening || !supported}
                      className="relative overflow-hidden flex items-center gap-2.5 rounded-2xl px-8 py-3.5 font-black text-sm uppercase tracking-[0.2em] text-white transition-all active:scale-[0.97] disabled:opacity-40"
                      style={{
                        background: "linear-gradient(135deg, #d97706, #ea580c)",
                        boxShadow: "0 8px_32px rgba(217,119,6,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                      }}
                    >
                      <span className="text-lg">🎤</span> SPEAK
                    </button>
                  </div>
                </div>
              )}

              {/* Judge feedback */}
              {judgeText && (
                <div className={`w-full max-w-lg rounded-2xl border px-5 py-3 text-sm font-bold text-center flex items-center justify-center gap-2 ${
                  judgeType === "success"
                    ? "border-emerald-400/30 bg-emerald-500/8 text-emerald-200"
                    : judgeType === "warn"
                    ? "border-amber-400/30 bg-amber-500/8 text-amber-200"
                    : "border-rose-400/30 bg-rose-500/8 text-rose-200"
                }`}>
                  <span>{judgeType === "success" ? "✅" : judgeType === "warn" ? "⚠️" : "❌"}</span>
                  {judgeText}
                </div>
              )}
            </div>
          </div>
        </div>

        <GameEndOverlay
          open={roundComplete}
          title="Phrase Master Complete!"
          score={score}
          practiced={ROUND_LENGTH}
          difficulty={difficulty}
          theme="phrase"
          onNextLevel={difficulty !== "hard" ? onNextDifficulty : undefined}
          onReplay={() => { setRoundComplete(false); setIndex(0); setPhase("choose"); setSelectedChoice(null); setEliminated([]); setRevealedAnswer(false); setJudgeType(null); setJudgeText(""); setScore(0); setRoundSeed((prev) => prev + 1); clearTranscript(); autoCheckRef.current = ""; }}
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
        `}</style>
      </div>
    </>
  );
}
