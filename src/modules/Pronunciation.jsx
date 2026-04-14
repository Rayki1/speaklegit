/**
 * =============================================================================
 * PRONUNCIATION GAME MODULE
 * =============================================================================
 * 
 * PURPOSE:
 * Main game logic for pronunciation practice using speech recognition.
 * Players speak words shown on screen and get real-time feedback.
 * 
 * GAME FLOW:
 * 1. Select difficulty (Easy/Medium/Hard)
 * 2. Get random word list based on difficulty
 * 3. Display word and listen to player's pronunciation
 * 4. Compare spoken word with target word
 * 5. Award points for correct pronunciation
 * 6. Move to next word
 * 
 * SCORING SYSTEM:
 * - Easy: +10 points per correct word, no timer
 * - Medium: +15 points per correct word
 * - Hard: +25 points per correct word, 5-minute timer
 * 
 * FEATURES:
 * - Real-time speech recognition
 * - Character-by-character error highlighting
 * - Skip functionality with custom modal
 * - Visual feedback (colors, animations)
 * - Progress tracking
 * 
 * =============================================================================
 */

import { useContext, useMemo, useRef, useState, useEffect } from "react";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useErrorSound from "../hooks/useErrorSound";
import GameHUD from "../components/GameHUD";
import GameEndOverlay from "../components/GameEndOverlay";
import ArcadePurchaseModal from "../components/ArcadePurchaseModal";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import { getRandomWordsByDifficulty } from "../utils/wordPools";
import { getCharacterDiff } from "../utils/animations";
import { pronunciationWords } from "../utils/wordPools";
import { formatSyllables, validateSpokenWord, getIPAPhonetic } from "../utils/pronunciationHelpers";
import { calculateTimedPoints, getRewardAnimationDuration, getTimedRoundSeconds } from "../utils/scoring";
import { buildQuestionDeck, getAdaptiveDifficulty } from "../utils/questionDeck";

const SKIP_COST = 5;

function Pronunciation({ difficulty, onNextDifficulty, isAdActive = false }) {
  const { updateStreak, finalizeRoundScore, addWordPracticed, user, spendCoins, canAfford } = useContext(UserContext);
  const playError = useErrorSound();

  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState("Ready to speak?");
  const [feedbackType, setFeedbackType] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [animatingClass, setAnimatingClass] = useState("");
  const [gameState, setGameState] = useState(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(() => getTimedRoundSeconds(difficulty));
  const [points, setPoints] = useState(0);
  const [wordList, setWordList] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundSeed, setRoundSeed] = useState(0);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [topBracketStreak, setTopBracketStreak] = useState(0);
  const [scoreFx, setScoreFx] = useState(null);
  const adaptiveDifficulty = useMemo(
    () => getAdaptiveDifficulty(difficulty, user?.streak || 0, roundSeed),
    [difficulty, user?.streak, roundSeed]
  );

  const roundLength = 10;

  useEffect(() => {
    if (adaptiveDifficulty) {
      const pool = pronunciationWords[adaptiveDifficulty] || pronunciationWords.easy;
      const deck = buildQuestionDeck({
        items: pool,
        count: Math.min(20, pool.length),
        gameKey: "pronunciation",
        difficulty: adaptiveDifficulty,
        replaySeed: roundSeed,
        getId: (entry) => entry,
      });
      setWordList(deck.length ? deck : getRandomWordsByDifficulty(pronunciationWords, adaptiveDifficulty, 20));
    }
  }, [adaptiveDifficulty, roundSeed]);

  useEffect(() => {
    if (isAdActive || roundComplete || questionTimeLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdActive, questionTimeLeft, roundComplete]);

  const currentWord = wordList[index] || "confidence";

  const { listening, transcript, interimTranscript, speechError, startListening, stopListening, clearTranscript } = useSpeechRecognition({
    singleWord: true,
    interimResults: true,
    continuous: false,
    expectedText: currentWord,
    minConfidence: 0.22,
  });
  const lastInterimTokenRef = useRef("");
  const lastFinalTokenRef = useRef("");
  const questionStartedAtRef = useRef(Date.now());
  const scoreFxCounterRef = useRef(0);
  const adPausedAtRef = useRef(null);

  useEffect(() => {
    if (isAdActive) {
      stopListening();
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
  }, [isAdActive, stopListening]);

  const normalizedTranscript = useMemo(
    () => transcript.toLowerCase().replace(/[^a-z]/g, ""),
    [transcript]
  );

  const normalizedInterim = useMemo(
    () => interimTranscript.toLowerCase().replace(/[^a-z]/g, ""),
    [interimTranscript]
  );

  const normalizedWord = currentWord.toLowerCase().replace(/[^a-z]/g, "");

  useEffect(() => {
    // Reset recognition output every time the target word changes.
    clearTranscript();
    lastInterimTokenRef.current = "";
    lastFinalTokenRef.current = "";
    questionStartedAtRef.current = Date.now();
    setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
  }, [currentWord, index, clearTranscript]);

  useEffect(() => {
    if (isAdActive || roundComplete || questionTimeLeft > 0 || isProcessing) return;

    setIsProcessing(true);
    setFeedback("⌛ Time's up! Moving to next word...");
    setFeedbackType("error");
    setGameState("incorrect");
    setTopBracketStreak(0);
    updateStreak(false);
    addWordPracticed();
    stopListening();
    clearTranscript();

    setTimeout(() => {
      if (index + 1 >= roundLength) {
        finalizeRoundScore(points).catch(() => {});
        setRoundComplete(true);
      } else {
        setIndex((prev) => prev + 1);
        resetState();
      }
      setIsProcessing(false);
    }, 700);
  }, [isAdActive, questionTimeLeft, roundComplete, isProcessing, index, roundLength, points]);

  const checkPronunciation = (spokenWord = normalizedTranscript) => {
    const validation = validateSpokenWord(currentWord, spokenWord);

    if (validation.match) {
      const elapsed = Math.floor((Date.now() - questionStartedAtRef.current) / 1000);
      const timeRemaining = Math.max(1, getTimedRoundSeconds(difficulty) - elapsed);
      const scoreResult = calculateTimedPoints(difficulty, timeRemaining, topBracketStreak);

      setFeedback(`✅ ${scoreResult.performance}! +${scoreResult.points} pts${scoreResult.multiplier > 1 ? ` (x${scoreResult.multiplier})` : ""}`);
      setFeedbackType("success");
      setGameState("correct");
      setAnimatingClass("success-animate");

      setPoints((prev) => prev + scoreResult.points);
      setTopBracketStreak(scoreResult.nextTopBracketStreak);
      scoreFxCounterRef.current += 1;
      setScoreFx({
        key: `fx-${scoreFxCounterRef.current}`,
        tier: scoreResult.tier,
        callout: scoreResult.callout,
        multiplier: scoreResult.multiplier,
        points: scoreResult.points,
      });

      updateStreak(true);
      addWordPracticed();

      setTimeout(() => {
        if (index + 1 >= roundLength) {
          const finalRoundScore = points + scoreResult.points;
          finalizeRoundScore(finalRoundScore).catch(() => {});
          setRoundComplete(true);
          setFeedback("🎉 Round complete!");
          setFeedbackType("success");
          stopListening();
          clearTranscript();
          setIsProcessing(false);
          return;
        }

        stopListening();
        clearTranscript();
        setIndex((prev) => prev + 1);
        resetState();
        setIsProcessing(false);
      }, getRewardAnimationDuration(scoreResult.tier));
    } else {
      const mistakes = getCharacterDiff(normalizedWord, spokenWord);
      setMistakes(mistakes);
      setFeedbackType("error");
      playError();
      setGameState("incorrect");
      setAnimatingClass("error-animate");
      setShowHint(false);

      setFeedback(validation.suggestion || `❌ Not quite. (${validation.score}% match) - Try again.`);

      updateStreak(false);
      setTopBracketStreak(0);

      setTimeout(() => {
        setAnimatingClass("");
        setGameState(null);
        setIsProcessing(false);
      }, 800);
    }
  };

  const resetState = () => {
    setFeedback("Ready to speak?");
    setFeedbackType(null);
    setMistakes([]);
    setShowHint(false);
    setAnimatingClass("");
    setGameState(null);
    setShowSkipModal(false);
  };

  useEffect(() => {
    // Allow single-char interim for short target words (e.g. "b" for "bee")
    const minLen = normalizedWord.length <= 3 ? 1 : 2;
    if (!difficulty || !normalizedInterim || normalizedInterim.length < minLen || isProcessing) return;

    const token = `${index}:${normalizedInterim}`;
    if (token === lastInterimTokenRef.current) return;

    const quickValidation = validateSpokenWord(currentWord, normalizedInterim);

    if (quickValidation.match && quickValidation.score > 85) {
      lastInterimTokenRef.current = token;
      setIsProcessing(true);
      checkPronunciation(normalizedInterim);
    }
  }, [difficulty, normalizedInterim, isProcessing, currentWord, index, normalizedWord]);

  useEffect(() => {
    if (!difficulty || !normalizedTranscript || normalizedTranscript.length < 1 || isProcessing) return;

    const token = `${index}:${normalizedTranscript}`;
    if (token === lastFinalTokenRef.current) return;
    lastFinalTokenRef.current = token;

    setIsProcessing(true);
    checkPronunciation(normalizedTranscript);
  }, [difficulty, normalizedTranscript, isProcessing, index]);

  const handleSkip = () => {
    if (roundComplete) return;

    if (!canAfford(SKIP_COST)) {
      setFeedback(`🔒 You need ${SKIP_COST} coins to use skip.`);
      setFeedbackType("error");
      return;
    }

    setShowSkipModal(true);
  };

  const confirmSkipUse = () => {
    const success = spendCoins(SKIP_COST);

    if (!success) {
      setFeedback(`🔒 You need ${SKIP_COST} coins to use skip.`);
      setFeedbackType("error");
      setShowSkipModal(false);
      return;
    }

    setShowSkipModal(false);
    setTopBracketStreak(0);

    if (index + 1 >= roundLength) {
      setRoundComplete(true);
      return;
    }

    setFeedback(`⏭ Skipped! -${SKIP_COST} coins`);
    setFeedbackType("success");
    stopListening();
    clearTranscript();
    setIndex((prev) => prev + 1);
    resetState();
  };

  const charVisualization = useMemo(() => {
    if (!mistakes.length) return null;

    return normalizedWord.split("").map((char, idx) => {
      const hasError = mistakes.some((e) => e.position === idx);

      return (
        <span
          key={idx}
          className={`px-1 py-0.5 rounded ${
            hasError
              ? "bg-red-500/30 border-b-2 border-red-500 text-red-300"
              : "text-green-300"
          }`}
        >
          {char}
        </span>
      );
    });
  }, [mistakes, normalizedWord]);

  // Lock body scroll while game is open
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
      <div
        className="relative w-full bg-[#030303] text-slate-200 font-sans overflow-hidden selection:bg-purple-500/30"
        style={{ height: "calc(100dvh - 80px)", marginTop: "80px" }}
      >
        <GameHUD
          time={questionTimeLeft}
          points={points}
          gameState={gameState}
          difficulty={difficulty}
          showTimer
          scoreFx={scoreFx}
          topBracketStreak={topBracketStreak}
        />

        {/* Background effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-800/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <main className="relative z-10 h-full max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-center">
          <div className="flex items-center justify-center w-full h-full">
            {/* Glow border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[3rem] blur-2xl opacity-15 pointer-events-none"></div>

            <div className={`relative w-full h-full bg-[#161129]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${animatingClass}`}>
              
              {/* ── Header bar ── */}
              <div className="flex items-center justify-between px-3 md:px-5 py-2 md:py-3 border-b border-white/5 bg-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                    PRONUNCIATION
                  </span>
                  <span className="text-white/30 text-xs hidden sm:inline">| {difficulty}</span>
                </div>
                <div className="flex items-center gap-2 text-white/40 font-mono">
                  <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: roundLength }).map((_, i) => (
                      <span key={i} className={`inline-block rounded-full transition-all duration-300 ${i < index ? "w-2 h-2 bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]" : i === index ? "w-2.5 h-2.5 bg-purple-400 ring-2 ring-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.6)]" : "w-1.5 h-1.5 bg-white/15"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold">
                    <span className="text-purple-400">{index + 1}</span>
                    <span className="text-white/30"> / {roundLength}</span>
                  </span>
                  <span className="text-yellow-300 font-bold text-xs">🪙 {user?.coins || 0}</span>
                </div>
              </div>

              {/* ── Main content ── */}
              <div className="flex-1 flex flex-col items-center justify-center px-3 md:px-6 py-3 md:py-4 space-y-3 overflow-hidden">

                {/* Word display */}
                <div className="text-center space-y-1">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-white/30 font-bold">Pronounce the word</p>
                  <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight transition-all duration-300 ${
                    gameState === "correct"
                      ? "text-emerald-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.6)]"
                      : gameState === "incorrect"
                      ? "text-rose-400 drop-shadow-[0_0_20px_rgba(251,113,133,0.5)]"
                      : "text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                  }`}>
                    {currentWord}
                  </h1>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span className="text-lg sm:text-xl text-cyan-300/80 font-semibold tracking-wide">{formatSyllables(currentWord)}</span>
                    <span className="text-sm sm:text-base text-purple-300/70 font-mono">[{getIPAPhonetic(currentWord)}]</span>
                    <button
                      className="p-1.5 hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-95 text-purple-300/70"
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(currentWord);
                        utterance.rate = 0.8;
                        window.speechSynthesis.speak(utterance);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Listening waveform — CSS-animated bars */}
                {listening && (
                  <div className="flex items-end justify-center gap-[3px] h-10 px-2">
                    {[...Array(14)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-purple-600 to-pink-400 rounded-full mic-bar"
                        style={{ animationDelay: `${i * 0.07}s` }}
                      />
                    ))}
                  </div>
                )}

                {/* Char diff */}
                {gameState === "incorrect" && charVisualization && (
                  <div className="flex flex-wrap justify-center gap-1 text-base px-4 py-2 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                    {charVisualization}
                  </div>
                )}

                {/* "You said" box */}
                <div className="w-full max-w-md">
                  <div className={`text-center px-4 py-3 rounded-2xl border-2 transition-all duration-300 ${
                    listening
                      ? "bg-purple-500/12 border-purple-400/60 shadow-[0_0_24px_rgba(168,85,247,0.25)]"
                      : gameState === "correct"
                      ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                      : gameState === "incorrect"
                      ? "bg-rose-500/10 border-rose-500/40"
                      : "bg-white/5 border-white/15"
                  }`}>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 block mb-1 font-semibold">You said</span>
                    <span className={`text-xl sm:text-2xl font-black tracking-widest ${
                      gameState === "correct" ? "text-emerald-400" : gameState === "incorrect" ? "text-rose-400" : listening ? "text-purple-200" : "text-white/90"
                    }`}>
                      {interimTranscript
                        ? <span className="opacity-70 italic">{interimTranscript}</span>
                        : transcript || (listening ? <span className="animate-pulse">Listening…</span> : <span className="text-white/30">— — —</span>)
                      }
                    </span>
                  </div>
                </div>

                {/* Feedback */}
                {feedbackType && (
                  <p className={`text-sm sm:text-base font-black uppercase tracking-wider text-center px-4 ${
                    feedbackType === "success" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {feedback}
                  </p>
                )}
                {!feedbackType && speechError && (
                  <div className="flex flex-col items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 text-center">
                      {speechError === "noisy" ? "🔇 Too much noise? Try raising your voice!" : "🎤 We didn't hear you — please try again!"}
                    </p>
                    <button
                      onClick={startListening}
                      className="text-xs font-bold text-purple-300 underline underline-offset-2 hover:text-purple-200 transition"
                    >
                      Tap to retry
                    </button>
                  </div>
                )}

                {/* Tip for short/tricky words */}
                {!feedbackType && !listening && normalizedWord.length <= 3 && (
                  <p className="text-[11px] text-amber-300/70 text-center font-semibold">
                    💡 Short word — speak clearly and hold the vowel sound
                  </p>
                )}

                {gameState === "correct" && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-black tracking-wide text-emerald-200 shadow-[0_0_16px_rgba(34,197,94,0.25)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Perfect Pronunciation!
                  </div>
                )}
              </div>

              {/* ── Footer buttons ── */}
              <div className="px-3 md:px-5 py-3 flex flex-wrap items-center justify-center gap-3 bg-black/20 border-t border-white/5">
                <button
                  onClick={() => listening ? stopListening() : startListening()}
                  disabled={roundComplete}
                  className={`flex-[3] min-w-[160px] h-12 md:h-14 flex items-center justify-center gap-2 font-black text-sm md:text-base rounded-xl transition-all active:scale-[0.97] shadow-xl uppercase tracking-wider disabled:opacity-50 relative overflow-hidden ${
                    listening
                      ? "bg-rose-500 shadow-rose-500/40 ring-4 ring-rose-400/30"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-[1.02]"
                  }`}
                >
                  {listening && (
                    <span className="absolute inset-0 rounded-xl animate-ping bg-rose-400/20 pointer-events-none" />
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={listening ? "animate-bounce" : ""}>
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" x2="12" y1="19" y2="22"></line>
                  </svg>
                  {listening ? "STOP" : "🎤 SPEAK"}
                </button>
                <button
                  onClick={handleSkip}
                  disabled={!canAfford(SKIP_COST) || roundComplete}
                  className={`flex-1 min-w-[100px] h-11 md:h-12 flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 ${
                    !canAfford(SKIP_COST) || roundComplete
                      ? "bg-gray-500/20 border border-gray-400/20 text-gray-400 cursor-not-allowed"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" x2="19" y1="5" y2="19"></line>
                  </svg>
                  <span>SKIP <span className="hidden sm:inline">(-{SKIP_COST})</span></span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <GameEndOverlay
          open={roundComplete}
          title="Pronunciation Round Complete"
          score={points}
          practiced={roundLength}
          difficulty={difficulty}
          theme="pronunciation"
          onNextLevel={difficulty !== "hard" ? onNextDifficulty : undefined}
          onReplay={() => {
            setRoundComplete(false);
            setIndex(0);
            setPoints(0);
            setRoundSeed((prev) => prev + 1);
            setFeedback("Ready to speak?");
            setFeedbackType(null);
            setGameState(null);
            setMistakes([]);
            setShowHint(false);
            setShowSkipModal(false);
            setQuestionTimeLeft(getTimedRoundSeconds(difficulty));
          }}
          exitTo="/oneplayer"
        />

        <ArcadePurchaseModal
          open={showSkipModal}
          icon="⏭"
          title="Use Skip?"
          description="Spend coins to skip the current pronunciation word and move forward immediately."
          cost={SKIP_COST}
          inventoryCount={user?.coins || 0}
          confirmLabel="Use Skip"
          confirmDisabled={!canAfford(SKIP_COST)}
          helperText={canAfford(SKIP_COST) ? "This consumes coins instantly." : "You need more coins before you can skip."}
          onClose={() => setShowSkipModal(false)}
          onConfirm={confirmSkipUse}
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
          .slide-in-from-bottom-4 { animation-name: slideInBottom4; }

          @keyframes mic-bar-pulse {
            0%, 100% { height: 20%; opacity: 0.6; }
            50% { height: 90%; opacity: 1; }
          }
          .mic-bar {
            animation: mic-bar-pulse 0.7s ease-in-out infinite;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes slideInBottom4 { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </>
  );
}

export default Pronunciation;