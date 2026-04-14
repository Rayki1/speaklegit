import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import GameHUD from "../components/GameHUD";
import ArcadePurchaseModal from "../components/ArcadePurchaseModal";
import RollingNumber from "../components/RollingNumber";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useErrorSound from "../hooks/useErrorSound";
import { UserContext } from "../context/UserContext";
import { calculateTimedPoints, getRewardAnimationDuration, getTimedRoundSeconds, getVictoryRank } from "../utils/scoring";

const ROUND_COUNT = 6;
const SKIP_COST = 5;

const QUOTE_PAIRS = [
  {
    id: "heneral-01",
    category: "historical",
    source: "Heneral Luna",
    call: { character: "Miong", line: "Your country is giving you orders, Luna." },
    response: { character: "Heneral Luna", line: "The Philippines does not belong to you." },
  },
  {
    id: "heneral-02",
    category: "historical",
    source: "Heneral Luna",
    call: { character: "Heneral Luna", line: "If we could ambush the Spanish, we can defeat the Americans too." },
    response: { character: "Heneral Luna", line: "Freedom is not flaunted. It is earned." },
  },
  {
    id: "gomburza-01",
    category: "historical",
    source: "Gomburza",
    call: { character: "Padre Gomez", line: "Even if we die, our cause will live on." },
    response: { character: "Padre Burgos", line: "We will not die without reason." },
  },
  {
    id: "otj-01",
    category: "thriller",
    source: "On the Job",
    call: { character: "Tatang", line: "This is our job. We have no choice." },
    response: { character: "Daniel", line: "We always have a choice." },
  },
  {
    id: "sakay-01",
    category: "historical",
    source: "Sakay",
    call: { character: "General", line: "Surrender, Sakay. The fight is over." },
    response: { character: "Sakay", line: "I will never surrender the freedom of my country." },
  },
  {
    id: "magnifico-01",
    category: "drama",
    source: "Magnifico",
    call: { character: "Mother", line: "Why do you always help others?" },
    response: { character: "Magnifico", line: "Because I am happy when they are happy." },
  },
  {
    id: "four-sisters-01",
    category: "drama",
    source: "Four Sisters and a Wedding",
    call: { character: "Gabby", line: "Why do you always argue with each other?" },
    response: { character: "Eldest Sister", line: "Because we are family. That is just how it is." },
  },
  {
    id: "barcelona-01",
    category: "romance",
    source: "Barcelona: A Love Untold",
    call: { character: "Ethan", line: "Where are you going?" },
    response: { character: "Kira", line: "I will follow you wherever you go." },
  },
  {
    id: "boses-01",
    category: "drama",
    source: "Boses",
    call: { character: "Teacher", line: "Why do you not speak?" },
    response: { character: "Child", line: "I speak through music." },
  },
  {
    id: "ekstra-01",
    category: "drama",
    source: "Ekstra",
    call: { character: "Director", line: "Are you ready?" },
    response: { character: "Loida", line: "I am always ready. That is the only thing I know." },
  },
  {
    id: "tanging-yaman-01",
    category: "drama",
    source: "Tanging Yaman",
    call: { character: "Father", line: "Family is the most important thing in life." },
    response: { character: "Child", line: "Yes, Father. You are our strength." },
  },
  {
    id: "milan-01",
    category: "romance",
    source: "Milan",
    call: { character: "Marco", line: "You do not love me. You cannot." },
    response: { character: "Sophia", line: "I love you and that is the truth." },
  },
  {
    id: "otwol-01",
    category: "romance",
    source: "On the Wings of Love",
    call: { character: "Clark", line: "Why are you doing this for me?" },
    response: { character: "Leah", line: "Because I love you. It is that simple." },
  },
  {
    id: "bata-01",
    category: "drama",
    source: "Bata Bata Paano Ka Ginawa",
    call: { character: "Neighbor", line: "How will you raise your child without a father?" },
    response: { character: "Lea", line: "I will do everything for my child." },
  },
  {
    id: "maximo-01",
    category: "indie",
    source: "Ang Pagdadalaga ni Maximo Oliveros",
    call: { character: "Victor", line: "What do you want in life?" },
    response: { character: "Maximo", line: "I just want to live honestly." },
  },
  {
    id: "fot7-01",
    category: "romance",
    source: "For the First Time",
    call: { character: "Rica", line: "Do you love me?" },
    response: { character: "Renz", line: "I love you more than anything." },
  },
  {
    id: "cry-01",
    category: "action",
    source: "Cry of Rage",
    call: { character: "Commander", line: "Do not fight for what you do not understand." },
    response: { character: "Bayani", line: "I will fight for my country until the very end." },
  },
  {
    id: "mano-po-01",
    category: "drama",
    source: "Mano Po",
    call: { character: "Mother", line: "Where are our children now?" },
    response: { character: "Lola Rose", line: "They are still here in our hearts." },
  },
  {
    id: "pa-ok-01",
    category: "comedy",
    source: "Pa-siyam",
    call: { character: "Grandson", line: "Lolo, are you okay?" },
    response: { character: "Lolo", line: "Of course I am okay. I am still alive!" },
  },
  {
    id: "gomburza-02",
    category: "historical",
    source: "Gomburza",
    call: { character: "Jailer", line: "Are you not afraid to die?" },
    response: { character: "Padre Zamora", line: "I am afraid only of living without purpose." },
  },
];

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreAccuracy(input, expected) {
  const inputNorm = normalize(input);
  const expectedNorm = normalize(expected);
  if (!inputNorm || !expectedNorm) return 0;

  if (inputNorm === expectedNorm) return 1;

  const inputWords = inputNorm.split(" ");
  const expectedWords = expectedNorm.split(" ");
  let hits = 0;
  expectedWords.forEach((word) => {
    if (inputWords.includes(word)) hits += 1;
  });

  // Penalize incomplete phrases so partial typing cannot pass as correct.
  const coverage = hits / expectedWords.length;
  const completeness = Math.min(inputWords.length, expectedWords.length) / expectedWords.length;
  return coverage * completeness;
}

function createPlayerState() {
  return { score: 0, roundWins: 0, lastGain: 0 };
}

export default function MovieLines() {
  const { addScore, updateStreak, addWordPracticed, user, spendCoins, canAfford } = useContext(UserContext);
  const playError = useErrorSound();

  const [difficulty] = useState("medium");
  const [phase, setPhase] = useState("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [quoteDeck, setQuoteDeck] = useState([]);
  const [score, setScore] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const [inputLine, setInputLine] = useState("");
  const [judgeText, setJudgeText] = useState("");
  const [judgeType, setJudgeType] = useState(null);
  const [retryOpen, setRetryOpen] = useState(false);
  const [retryUsed, setRetryUsed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(() => getTimedRoundSeconds(difficulty));
  const [topBracketStreak, setTopBracketStreak] = useState(0);
  const [scoreFx, setScoreFx] = useState(null);
  const autoCheckKeyRef = useRef("");
  const roundStartedAtRef = useRef(Date.now());
  const scoreFxCounterRef = useRef(0);
  const resultAudioContextRef = useRef(null);

  const { listening, transcript, interimTranscript, supported, speechError, startListening, stopListening, clearTranscript } = useSpeechRecognition({
    singleWord: false,
    interimResults: true,
    continuous: false,
    minConfidence: 0.2,
  });

  const currentQuote = quoteDeck[roundIndex];
  const resultRank = getVictoryRank(score, ROUND_COUNT, difficulty);
  const targetLine = currentQuote?.response.line;
  const targetCharacter = currentQuote?.response.character;
  const callCharacter = currentQuote?.call.character;
  const callLine = currentQuote?.call.line;

  useEffect(() => {
    if (!listening) return;
    const next = (transcript || interimTranscript || "").trim();
    if (next) setInputLine(next);
  }, [listening, transcript, interimTranscript]);

  useEffect(() => {
    clearTranscript();
    setInputLine("");
    autoCheckKeyRef.current = "";
  }, [roundIndex, clearTranscript]);

  const resetRound = () => {
    setInputLine("");
    clearTranscript();
    stopListening();
  };

  const advanceRound = () => {
    const next = roundIndex + 1;
    if (next >= ROUND_COUNT) {
      setPhase("result");
      return;
    }
    setRoundIndex(next);
    setJudgeText("");
    setJudgeType(null);
    setRetryOpen(false);
    setRetryUsed(false);
    setIsChecking(false);
    setShowSkipModal(false);
    autoCheckKeyRef.current = "";
    resetRound();
    roundStartedAtRef.current = Date.now();
    setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
  };

  const startGame = () => {
    const shuffled = shuffleArray(QUOTE_PAIRS).slice(0, ROUND_COUNT);
    setQuoteDeck(shuffled);
    setScore(0);
    setLastGain(0);
    setRoundIndex(0);
    setJudgeText("");
    setJudgeType(null);
    setRetryOpen(false);
    setRetryUsed(false);
    setIsChecking(false);
    setShowSkipModal(false);
    autoCheckKeyRef.current = "";
    resetRound();
    setTopBracketStreak(0);
    roundStartedAtRef.current = Date.now();
    setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
    setPhase("live");
  };

  useEffect(() => {
    if (phase !== "live" || questionTimeLeft <= 0 || isChecking || retryOpen || showSkipModal) return undefined;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, questionTimeLeft, isChecking, retryOpen, showSkipModal]);

  useEffect(() => {
    if (phase !== "live" || questionTimeLeft > 0 || isChecking || showSkipModal) return;

    submitAutoCheck("timeout", { fromRetry: true, forcedFail: true });
  }, [phase, questionTimeLeft, isChecking, showSkipModal]);

  useEffect(() => {
    if (phase !== "result") return undefined;

    const AudioCtx = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;
    if (!AudioCtx) return undefined;

    const playTone = (frequency, delayMs, durationMs, type = "triangle", gainValue = 0.018) => {
      try {
        if (!resultAudioContextRef.current) resultAudioContextRef.current = new AudioCtx();
        const context = resultAudioContextRef.current;
        if (context.state === "suspended") context.resume().catch(() => {});

        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        gain.connect(context.destination);

        const startAt = context.currentTime + delayMs / 1000;
        const endAt = startAt + durationMs / 1000;
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
        oscillator.start(startAt);
        oscillator.stop(endAt);
      } catch {
        // Ignore audio errors to keep results screen stable.
      }
    };

    playTone(430, 300, 110, "sine", 0.01);
    playTone(620, 900, 130, "triangle", 0.014);
    playTone(780, 1450, 180, "triangle", 0.018);
    if (resultRank.label === "LEGENDARY!") {
      playTone(980, 2350, 220, "sawtooth", 0.02);
    }

    return undefined;
  }, [phase, resultRank.label]);

  const submitAutoCheck = (lineToCheck, { fromRetry = false, forcedFail = false } = {}) => {
    if (phase !== "live" || !targetLine || isChecking) return;
    const cleanedLine = (lineToCheck || "").trim();
    if (!cleanedLine && !forcedFail) return;

    setIsChecking(true);
    const accuracy = forcedFail ? 0 : scoreAccuracy(cleanedLine, targetLine);
    const success = !forcedFail && accuracy >= 0.58;

    if (!success && !fromRetry && !retryUsed) {
      setJudgeType("error");
      setJudgeText("That didn't quite match. Try once more!");
      playError();
      setRetryUsed(true);
      setRetryOpen(true);
      setIsChecking(false);
      return;
    }

    if (success) {
      const elapsed = Math.floor((Date.now() - roundStartedAtRef.current) / 1000);
      const timeRemaining = Math.max(1, getTimedRoundSeconds(difficulty) - elapsed);
      const scoreResult = calculateTimedPoints(difficulty, timeRemaining, topBracketStreak);
      const gained = scoreResult.points;

      setScore((prev) => prev + gained);
      setLastGain(gained);
      setJudgeType("success");
      setJudgeText(`Great as ${targetCharacter}! ${scoreResult.performance} +${gained} pts${scoreResult.multiplier > 1 ? ` (x${scoreResult.multiplier})` : ""}`);
      setTopBracketStreak(scoreResult.nextTopBracketStreak);
      scoreFxCounterRef.current += 1;
      setScoreFx({
        key: `fx-${scoreFxCounterRef.current}`,
        tier: scoreResult.tier,
        callout: scoreResult.callout,
        multiplier: scoreResult.multiplier,
        points: gained,
      });
      addScore(difficulty, true);
      updateStreak(true);
      addWordPracticed();
      resetRound();
      setTimeout(() => advanceRound(), getRewardAnimationDuration(scoreResult.tier));
    } else {
      setLastGain(0);
      setJudgeType("error");
      setJudgeText("Scene missed. Moving on...");
      setTopBracketStreak(0);
      addScore(difficulty, false);
      playError();
      updateStreak(false);
      addWordPracticed();
      resetRound();
      setTimeout(() => advanceRound(), 1400);
    }
    setIsChecking(false);
  };

  useEffect(() => {
    if (phase !== "live" || listening || retryOpen || isChecking || showSkipModal) return ;
    const cleanedLine = inputLine.trim();
    if (!cleanedLine) return undefined;

    const expectedWordCount = normalize(targetLine || "").split(" ").filter(Boolean).length;
    const typedWordCount = normalize(cleanedLine).split(" ").filter(Boolean).length;
    if (typedWordCount < expectedWordCount) return undefined;

    const key = `${roundIndex}-${normalize(cleanedLine)}`;
    if (autoCheckKeyRef.current === key) return undefined;
    const timer = setTimeout(() => {
      autoCheckKeyRef.current = key;
      submitAutoCheck(cleanedLine, { fromRetry: retryUsed });
    }, 700);
    return () => clearTimeout(timer);
  }, [inputLine, phase, listening, retryOpen, isChecking, showSkipModal, roundIndex, retryUsed, targetLine]);

  const handleSkip = () => {
    if (phase !== "live") return;
    if (!canAfford(SKIP_COST)) {
      setJudgeType("error");
      setJudgeText(`Need ${SKIP_COST} coins to skip.`);
      return;
    }
    setShowSkipModal(true);
  };

  const confirmSkipUse = () => {
    const success = spendCoins(SKIP_COST);
    if (!success) { setShowSkipModal(false); return; }
    setShowSkipModal(false);
    setTopBracketStreak(0);
    setJudgeType("success");
    setJudgeText(`Scene skipped. -${SKIP_COST} coins.`);
    resetRound();
    setTimeout(() => advanceRound(), 1000);
  };

  return (
    <>
      <Navbar />

      {/* ── Full-screen cinematic shell ── */}
      <div
        className="relative w-full text-slate-200 font-sans overflow-x-hidden overflow-y-auto scrollbar-hide selection:bg-fuchsia-500/30"
        style={{ minHeight: "calc(100dvh - 80px)", marginTop: "80px" }}
      >
        {/* ── Cinematic background ── */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#040210]" />
          {/* Main radial spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(109,40,217,0.22),transparent_65%)]" />
          {/* Side ambient glows */}
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-violet-800/12 blur-[120px]" />
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-fuchsia-800/10 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full bg-indigo-900/15 blur-[80px]" />
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)", backgroundSize: "80px 80px" }}
          />
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

        {/* ══════════════════════════════════════════════
            LIVE GAME — full screen two-column layout
        ══════════════════════════════════════════════ */}
        {phase === "live" && currentQuote && (
          <div className="relative z-10 min-h-full flex flex-col px-3 sm:px-5 lg:px-8 xl:px-10 pt-3 pb-4 gap-3">

            {/* ── HUD bar ── */}
            <div className="flex-shrink-0 flex items-center gap-3">
              {/* Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_6px_rgba(217,70,239,1)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-fuchsia-300">Movie Lines</span>
              </div>
              {/* Progress dots */}
              <div className="flex items-center gap-1.5 flex-1">
                {Array.from({ length: ROUND_COUNT }).map((_, i) => (
                  <div key={i} className="relative flex-1 h-[3px] rounded-full bg-white/8 overflow-hidden">
                    <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                      i < roundIndex ? "w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 shadow-[0_0_6px_rgba(217,70,239,0.8)]"
                      : i === roundIndex ? "w-1/2 bg-fuchsia-400 animate-pulse"
                      : "w-0"
                    }`} />
                  </div>
                ))}
              </div>
              {/* Scene counter + coins */}
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-white/30 font-mono">
                  <span className="text-fuchsia-400">{roundIndex + 1}</span>
                  <span className="text-white/20"> / {ROUND_COUNT}</span>
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-yellow-400/20 bg-yellow-500/8 text-yellow-300 text-[10px]">
                  🪙 {user?.coins || 0}
                </span>
              </div>
            </div>

            {/* ── Two-column game area ── */}
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-3 sm:gap-4">

              {/* ════ LEFT: Cinematic scene card ════ */}
              <div className="relative rounded-[1.75rem] overflow-hidden flex flex-col min-h-0"
                style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.2), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)" }}
              >
                {/* Deep cinematic gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#12082a] via-[#1a0a3a] to-[#0d0620]" />
                {/* Spotlight from top-center */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-[radial-gradient(ellipse,rgba(139,92,246,0.25)_0%,transparent_70%)]" />
                {/* Left purple accent bar */}
                <div className="absolute left-0 inset-y-0 w-[3px] bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent opacity-80" />
                {/* Top glow line */}
                <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />

                {/* Source badge — floating top */}
                <div className="relative flex-shrink-0 flex items-center justify-center pt-5 pb-2 px-6">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                    <span className="text-base">🎬</span>
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-bold">{currentQuote.source}</span>
                  </div>
                </div>

                {/* Quote content — centered vertically */}
                <div className="relative flex-1 flex flex-col items-start justify-center px-5 sm:px-8 md:px-10 py-5 sm:py-6">
                  {/* Character label */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="w-5 h-[2px] bg-fuchsia-500/60 rounded-full" />
                    <p className="text-[9px] uppercase tracking-[0.45em] text-fuchsia-300/70 font-black">{callCharacter} says</p>
                  </div>
                  {/* The quote */}
                  <blockquote className="relative">
                    <span className="absolute -top-4 -left-2 text-6xl text-fuchsia-500/20 font-serif leading-none select-none">"</span>
                    <p className="relative text-xl sm:text-2xl md:text-3xl lg:text-[2rem] font-light text-white/95 italic leading-[1.45] tracking-wide font-serif pl-2">
                      {callLine}
                    </p>
                    <span className="text-4xl text-fuchsia-500/20 font-serif leading-none select-none">"</span>
                  </blockquote>
                  {/* Category pill */}
                  <div className="mt-5">
                    <span className="px-3 py-1 rounded-full border border-violet-400/15 bg-violet-500/8 text-[9px] uppercase tracking-[0.35em] text-violet-300/50 font-bold">
                      {currentQuote.category}
                    </span>
                  </div>
                </div>

                {/* Bottom fade overlay */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#0d0620]/80 to-transparent pointer-events-none" />
              </div>

              {/* ════ RIGHT: Response panel ════ */}
              <div className="flex flex-col gap-3 min-h-0">

                {/* Response card */}
                <div className={`relative flex-1 rounded-[1.75rem] overflow-hidden flex flex-col min-h-0 transition-all duration-300 ${
                  listening ? "shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_0_50px_rgba(52,211,153,0.12)]"
                  : judgeType === "success" ? "shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_0_40px_rgba(52,211,153,0.08)]"
                  : judgeType === "error" ? "shadow-[0_0_0_1px_rgba(251,113,133,0.25),0_0_40px_rgba(251,113,133,0.08)]"
                  : "shadow-[0_0_0_1px_rgba(139,92,246,0.15),0_32px_80px_rgba(0,0,0,0.5)]"
                }`}>
                  {/* BG */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#100525] via-[#0c041e] to-[#080315]" />
                  {listening && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(52,211,153,0.08),transparent_60%)]" />}
                  <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-400/30 to-transparent" />

                  <div className="relative flex-1 flex flex-col p-5 sm:p-6 gap-4 min-h-0">

                    {/* Role header row */}
                    <div className="flex-shrink-0 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.5em] text-white/30 mb-1.5 font-bold flex items-center gap-1.5">
                          <span>🎭</span> Your line as
                        </p>
                        <p className="text-xl sm:text-2xl font-black leading-none"
                          style={{ background: "linear-gradient(135deg, #e879f9, #a855f7, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                        >{targetCharacter}</p>
                      </div>
                      {/* Status pill */}
                      <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all duration-300 ${
                        listening ? "border-emerald-400/40 bg-emerald-500/12 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.2)]"
                        : speechError === "noisy" ? "border-amber-400/35 bg-amber-500/10 text-amber-300"
                        : speechError === "no-speech" ? "border-rose-400/35 bg-rose-500/10 text-rose-300"
                        : "border-white/10 bg-white/5 text-white/30"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${listening ? "bg-emerald-400 animate-ping" : "bg-white/25"}`} />
                        {listening ? "Listening…" : speechError === "noisy" ? "Too noisy" : speechError === "no-speech" ? "Try again" : "Ready"}
                      </div>
                    </div>

                    {/* Waveform */}
                    <div className="flex-shrink-0 flex items-end gap-[3px] h-10 px-1">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-full transition-all duration-75 ${listening ? "bg-gradient-to-t from-fuchsia-600 via-violet-400 to-cyan-300 opacity-90" : "bg-white/10"}`}
                          style={{
                            width: "2.5px",
                            height: listening
                              ? `${6 + Math.abs(Math.sin(i * 0.6 + Date.now() * 0.003)) * 28}px`
                              : `${3 + Math.abs(Math.sin(i * 0.4)) * 6}px`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Feedback banner */}
                    {judgeText && (
                      <div className={`flex-shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold border flex items-center gap-2.5 transition-all duration-300 ${
                        judgeType === "success"
                          ? "border-emerald-400/25 bg-emerald-500/8 text-emerald-300"
                          : "border-rose-400/25 bg-rose-500/8 text-rose-300"
                      }`}>
                        <span className="text-base">{judgeType === "success" ? "✅" : "❌"}</span>
                        <span>{judgeText}</span>
                      </div>
                    )}

                    {/* Textarea */}
                    <textarea
                      value={inputLine}
                      onChange={(e) => setInputLine(e.target.value)}
                      placeholder={`Speak or type: "${targetLine}"`}
                      disabled={phase !== "live" || isChecking}
                      className="flex-1 w-full rounded-2xl border border-white/8 bg-black/50 px-4 py-3 text-sm text-white/90 placeholder:text-white/20 outline-none focus:border-fuchsia-400/40 focus:shadow-[0_0_0_1px_rgba(217,70,239,0.2)] resize-none disabled:opacity-50 transition-all duration-200 min-h-[72px] sm:min-h-[80px] leading-relaxed"
                    />
                  </div>
                </div>

                {/* ── Action buttons ── */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                  {/* Primary row */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto]">
                    {/* SPEAK — main CTA */}
                    <button
                      type="button"
                      onClick={() => { stopListening(); clearTranscript(); setInputLine(""); autoCheckKeyRef.current = ""; startListening(); }}
                      disabled={!supported || listening || phase !== "live" || retryOpen}
                      className="relative col-span-2 sm:col-span-1 overflow-hidden flex items-center justify-center gap-2.5 rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
                      style={{
                        background: "linear-gradient(135deg, #c026d3, #7c3aed, #4f46e5)",
                        boxShadow: "0 8px 32px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                      }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <span className="relative text-lg">🎤</span>
                      <span className="relative">SPEAK</span>
                    </button>
                    {/* STOP */}
                    <button
                      type="button"
                      onClick={() => { stopListening(); clearTranscript(); autoCheckKeyRef.current = ""; }}
                      disabled={!listening}
                      className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 h-12 sm:h-auto w-full sm:w-14 text-base text-white/50 transition-all duration-200 active:scale-95 disabled:opacity-25"
                    >
                      ⏹
                    </button>
                    {/* SKIP */}
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={phase !== "live" || retryOpen || !canAfford(SKIP_COST)}
                      className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/4 hover:bg-white/8 h-12 sm:h-auto w-full sm:w-16 py-2 text-[9px] font-bold text-white/30 hover:text-white/55 transition-all duration-200 active:scale-95 disabled:opacity-20 leading-tight"
                    >
                      <span>SKIP</span>
                      <span className="text-yellow-400/60">-{SKIP_COST}🪙</span>
                    </button>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="button"
                    onClick={() => submitAutoCheck(inputLine)}
                    disabled={!inputLine.trim() || isChecking || phase !== "live"}
                    className="w-full rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/8 hover:bg-fuchsia-500/15 hover:border-fuchsia-400/35 px-4 py-3 text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300/80 hover:text-fuchsia-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-25"
                  >
                    ✓ Submit Line
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            INTRO overlay — premium cinematic
        ══════════════════════════════════════════════ */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <div className="relative w-full max-w-xl">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-fuchsia-600/20 via-violet-600/15 to-indigo-600/20 rounded-[3rem] blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-[#07060f]/95 backdrop-blur-3xl p-8 shadow-[0_40px_120px_rgba(0,0,0,0.9)]">
                {/* Top accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-32 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent rounded-full" />

                <div className="text-center mb-8">
                  <span className="inline-block text-5xl mb-4">🎬</span>
                  <p className="text-[9px] uppercase tracking-[0.5em] text-fuchsia-400/70 mb-2 font-bold">Single Player</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                    Movie Lines
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-violet-400 to-indigo-400">
                      Challenge
                    </span>
                  </h2>
                </div>

                <p className="text-sm text-white/55 leading-relaxed mb-6 text-center">
                  You will see iconic scenes from Filipino films — all in English. Speak or type the response line as accurately as possible to earn points!
                </p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { icon: "🇵🇭", label: "Filipino films" },
                    { icon: "🎤", label: "Speak the line" },
                    { icon: "⭐", label: `${ROUND_COUNT} rounds total` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-3 text-center">
                      <div className="text-xl mb-1">{item.icon}</div>
                      <p className="text-[10px] text-white/55 leading-tight font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={startGame}
                  className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 px-5 py-4 font-black uppercase tracking-[0.25em] text-white text-sm transition-all duration-200 active:scale-[0.98] shadow-[0_8px_32px_rgba(139,92,246,0.4)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.55)]"
                >
                  🎬 Start Performance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            RESULT overlay — premium cinematic
        ══════════════════════════════════════════════ */}
        {phase === "result" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <div className="relative w-full max-w-xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-fuchsia-600/20 via-violet-600/15 to-indigo-600/20 rounded-[3rem] blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-[#07060f]/95 backdrop-blur-3xl p-8 shadow-[0_40px_120px_rgba(0,0,0,0.9)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-32 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent rounded-full" />

                {(resultRank.label === "LEGENDARY!" || resultRank.label === "PRO!") && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {Array.from({ length: resultRank.label === "LEGENDARY!" ? 24 : 14 }).map((_, index) => (
                      <span
                        key={`movie-confetti-left-${index}`}
                        className="movie-confetti"
                        style={{ left: `${10 + Math.random() * 16}%`, bottom: `${-8 + Math.random() * 8}%`, animationDelay: `${index * 60}ms` }}
                      />
                    ))}
                    {Array.from({ length: resultRank.label === "LEGENDARY!" ? 24 : 14 }).map((_, index) => (
                      <span
                        key={`movie-confetti-right-${index}`}
                        className="movie-confetti"
                        style={{ right: `${10 + Math.random() * 16}%`, bottom: `${-8 + Math.random() * 8}%`, animationDelay: `${index * 60}ms` }}
                      />
                    ))}
                  </div>
                )}

                <div className="text-center mb-6">
                  <span className="inline-block text-5xl mb-3 movie-result-banner">🎭</span>
                  <p className="text-[9px] uppercase tracking-[0.5em] text-white/35 mb-1">Performance Complete</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">Scene's Over!</h2>
                  <p className={`mt-3 text-lg font-black tracking-[0.25em] ${resultRank.accent === "gold" ? "text-yellow-300" : resultRank.accent === "silver" ? "text-slate-200" : resultRank.accent === "good" ? "text-cyan-200" : "text-orange-200"}`}>
                    {resultRank.label}
                  </p>
                </div>

                {/* Score display */}
                <div className="relative rounded-2xl overflow-hidden border border-fuchsia-400/20 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/15 to-indigo-600/15" />
                  <div className="relative px-6 py-6 text-center">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 mb-2">Final Score</p>
                    <RollingNumber
                      end={score}
                      duration={1300}
                      startImmediately
                      triggerKey={`movie-score-${score}`}
                      className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-fuchsia-200 to-fuchsia-400 movie-score-roll"
                    />
                    <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Total Points</p>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Performance</p>
                    <p className="mt-2 text-2xl font-black text-white">{resultRank.percent}%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Scenes</p>
                    <p className="mt-2 text-2xl font-black text-cyan-300">{ROUND_COUNT}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={startGame}
                    className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 px-4 py-3.5 font-black text-sm uppercase tracking-[0.15em] text-white transition-all duration-200 active:scale-95 shadow-[0_6px_20px_rgba(139,92,246,0.35)]"
                  >
                    Play Again
                  </button>
                  <Link
                    to="/oneplayer"
                    className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3.5 text-center font-black text-sm uppercase tracking-[0.15em] text-white transition-all duration-200"
                  >
                    Exit
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}


        <style>{`
          @keyframes movieConfetti {
            0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
            15% { opacity: 1; }
            100% { transform: translate3d(var(--movie-drift, 0px), -520px, 0) rotate(460deg); opacity: 0; }
          }
          @keyframes movieBannerPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          @keyframes movieScorePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.04); }
          }
          .movie-confetti {
            position: absolute;
            width: 12px;
            height: 16px;
            border-radius: 3px;
            background: linear-gradient(180deg, #f5d0fe, #a855f7);
            opacity: 0;
            --movie-drift: 0px;
            animation: movieConfetti 3.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .movie-confetti:nth-child(3n) { background: linear-gradient(180deg, #fde68a, #f59e0b); --movie-drift: 48px; }
          .movie-confetti:nth-child(3n+1) { background: linear-gradient(180deg, #93c5fd, #22d3ee); --movie-drift: -42px; }
          .movie-result-banner { animation: movieBannerPulse 2.4s ease-in-out infinite; }
          .movie-score-roll { animation: movieScorePulse 0.9s ease-out infinite; }
        `}</style>
        {/* ── Retry modal ── */}
        {retryOpen && phase === "live" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-3 bg-rose-600/15 rounded-[2rem] blur-xl" />
              <div className="relative rounded-[1.8rem] border border-rose-300/20 bg-[#100a18] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.85)]">
                <div className="text-center mb-5">
                  <span className="inline-block text-3xl mb-2">🎬</span>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-rose-300/60 mb-1">Last Chance</p>
                  <h3 className="text-xl font-black text-white">Retry This Line?</h3>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-5 text-center">One more try! Fail again and the scene is skipped.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setRetryOpen(false); setInputLine(""); clearTranscript(); autoCheckKeyRef.current = ""; if (supported) startListening(); }}
                    className="rounded-xl border border-emerald-400/30 bg-emerald-500/12 hover:bg-emerald-500/20 px-3 py-3 text-xs font-black uppercase tracking-widest text-emerald-200 transition-all duration-200"
                  >
                    Retry Now
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRetryOpen(false); submitAutoCheck(inputLine || "no attempt", { fromRetry: true, forcedFail: true }); }}
                    className="rounded-xl border border-rose-400/30 bg-rose-500/12 hover:bg-rose-500/20 px-3 py-3 text-xs font-black uppercase tracking-widest text-rose-200 transition-all duration-200"
                  >
                    Skip Scene
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ArcadePurchaseModal
          open={showSkipModal}
          icon="⏭"
          title="Use Skip?"
          description="Spend coins to skip this scene and move to the next one."
          cost={SKIP_COST}
          inventoryCount={user?.coins || 0}
          confirmLabel="Use Skip"
          confirmDisabled={!canAfford(SKIP_COST)}
          helperText={canAfford(SKIP_COST) ? "This consumes coins instantly." : "You need more coins before you can skip."}
          onClose={() => setShowSkipModal(false)}
          onConfirm={confirmSkipUse}
        />
      </div>
    </>
  );
}