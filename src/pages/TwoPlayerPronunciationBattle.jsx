import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DifficultySelector from "../components/DifficultySelector";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useErrorSound from "../hooks/useErrorSound";
import { getRandomWordsByDifficulty, pronunciationWords } from "../utils/wordPools";
import { validateSpokenWord } from "../utils/pronunciationHelpers";
import { formatSyllables, getIPAPhonetic } from "../utils/pronunciationHelpers";

const TURN_DURATION = 30;
const COUNTDOWN_STEPS = ["3", "2", "1", "START!"];
const PLAYERS = [
  { id: "A", name: "Player A" },
  { id: "B", name: "Player B" },
];

function basePointsForDifficulty(difficulty) {
  if (difficulty === "hard") return 30;
  if (difficulty === "medium") return 20;
  return 10;
}

function BattleArena({ difficulty }) {
  const [phase, setPhase] = useState("intro");
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION);
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [streaks, setStreaks] = useState({ A: 0, B: 0 });
  const [currentIndexes, setCurrentIndexes] = useState({ A: 0, B: 0 });
  const [feedback, setFeedback] = useState("Tap anywhere to begin the battle.");
  const [feedbackType, setFeedbackType] = useState(null);
  const [wordLists, setWordLists] = useState({ A: [], B: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultFlash, setResultFlash] = useState(null);
  const [roundSummary, setRoundSummary] = useState("Battle ready. Tap the mic button when the active turn begins.");
  const [showRulesModal, setShowRulesModal] = useState(false);

  const activePlayer = PLAYERS[activePlayerIndex];
  const activeWordList = wordLists[activePlayer.id] || [];
  const currentWord = activeWordList[currentIndexes[activePlayer.id]] || "confidence";
  const basePoints = basePointsForDifficulty(difficulty);

  useEffect(() => {
    setWordLists({
      A: getRandomWordsByDifficulty(pronunciationWords, difficulty, 40),
      B: getRandomWordsByDifficulty(pronunciationWords, difficulty, 40),
    });
  }, [difficulty]);

  const { listening, transcript, interimTranscript, supported, speechError, startListening, stopListening, clearTranscript } = useSpeechRecognition({
    singleWord: true,
    interimResults: true,
    continuous: false,
    expectedText: currentWord,
    minConfidence: 0.22,
  });
  const lastInterimTokenRef = useRef("");
  const lastFinalTokenRef = useRef("");

  const normalizedTranscript = useMemo(
    () => transcript.toLowerCase().replace(/[^a-z]/g, ""),
    [transcript]
  );

  const normalizedInterim = useMemo(
    () => interimTranscript.toLowerCase().replace(/[^a-z]/g, ""),
    [interimTranscript]
  );

  useEffect(() => {
    clearTranscript();
    lastInterimTokenRef.current = "";
    lastFinalTokenRef.current = "";
  }, [currentWord, activePlayerIndex, phase, clearTranscript]);

  useEffect(() => {
    if (phase !== "countdown") return undefined;

    setCountdownIndex(0);
    const timer = setInterval(() => {
      setCountdownIndex((prev) => {
        if (prev >= COUNTDOWN_STEPS.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setTimeLeft(TURN_DURATION);
            setFeedback(`${PLAYERS[activePlayerIndex].name}, speak now.`);
            setFeedbackType(null);
            setRoundSummary(`${PLAYERS[activePlayerIndex].name} is live for 30 seconds.`);
            setPhase("turn");
          }, 260);
          return prev;
        }

        return prev + 1;
      });
    }, 720);

    return () => clearInterval(timer);
  }, [phase, activePlayerIndex]);

  useEffect(() => {
    if (phase !== "turn") return undefined;

    if (timeLeft <= 0) {
      stopListening();
      clearTranscript();

      if (activePlayerIndex === 0) {
        setActivePlayerIndex(1);
        setFeedback("Player B, tap to begin your turn.");
        setFeedbackType(null);
        setRoundSummary("Player A finished. Awaiting Player B transition tap.");
        setPhase("transition");
      } else {
        setRoundSummary("Both turns complete. Final scores locked.");
        setPhase("results");
      }

      return undefined;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, timeLeft, activePlayerIndex, stopListening]);

  useEffect(() => {
    if (!resultFlash) return undefined;

    const timer = setTimeout(() => {
      setResultFlash(null);
    }, 850);

    return () => clearTimeout(timer);
  }, [resultFlash]);

  const launchCountdown = () => {
    if (phase === "intro" || phase === "transition") {
      clearTranscript();
      setCountdownIndex(0);
      setPhase("countdown");
    }
  };

  const handlePronunciationCheck = useCallback((spokenWord) => {
    const validation = validateSpokenWord(currentWord, spokenWord);

    if (validation.match) {
      const playerId = activePlayer.id;
      const nextStreak = streaks[playerId] + 1;
      const streakBonus = nextStreak % 3 === 0 ? 50 : 0;
      const totalPoints = basePoints + streakBonus;

      setScores((prev) => ({ ...prev, [playerId]: prev[playerId] + totalPoints }));
      setStreaks((prev) => ({ ...prev, [playerId]: nextStreak }));
      setCurrentIndexes((prev) => {
        if (playerId === "B") {
          const bLength = Math.max(wordLists.B.length, 1);
          let randomIndex = Math.floor(Math.random() * bLength);
          if (bLength > 1 && randomIndex === prev.B) {
            randomIndex = (randomIndex + 1) % bLength;
          }
          return { ...prev, B: randomIndex };
        }

        return { ...prev, [playerId]: prev[playerId] + 1 };
      });
      clearTranscript();
      setFeedback(
        streakBonus
          ? `${activePlayer.name} nailed it. +${basePoints} and +50 streak bonus.`
          : `${activePlayer.name} scored +${basePoints}.`
      );
      setFeedbackType("success");
      setResultFlash("success");
      setRoundSummary(
        streakBonus
          ? `${activePlayer.name} is on fire. Every third correct word adds +50.`
          : `${activePlayer.name} cleared the word and moves to the next target.`
      );
    } else {
      setStreaks((prev) => ({ ...prev, [activePlayer.id]: 0 }));
      setFeedback(validation.suggestion || `${activePlayer.name}, try that word again.`);
      setFeedbackType("error");
      setResultFlash("error");
      setRoundSummary(`${activePlayer.name}'s streak reset. The same word stays active.`);
      playError();
    }

    setTimeout(() => {
      setIsProcessing(false);
    }, 250);
  }, [activePlayer, basePoints, currentWord, streaks, wordLists.B.length]);

  useEffect(() => {
    if (phase !== "turn" || !normalizedInterim || normalizedInterim.length < 2 || isProcessing) return;

    const token = `${activePlayer.id}:${currentIndexes[activePlayer.id]}:${normalizedInterim}`;
    if (token === lastInterimTokenRef.current) return;

    const quickValidation = validateSpokenWord(currentWord, normalizedInterim);
    if (quickValidation.match && quickValidation.score > 85) {
      lastInterimTokenRef.current = token;
      setIsProcessing(true);
      handlePronunciationCheck(normalizedInterim);
    }
  }, [phase, normalizedInterim, isProcessing, currentWord, handlePronunciationCheck, activePlayer.id, currentIndexes]);

  useEffect(() => {
    if (phase !== "turn" || !normalizedTranscript || normalizedTranscript.length < 1 || isProcessing) return;

    const token = `${activePlayer.id}:${currentIndexes[activePlayer.id]}:${normalizedTranscript}`;
    if (token === lastFinalTokenRef.current) return;
    lastFinalTokenRef.current = token;

    setIsProcessing(true);
    handlePronunciationCheck(normalizedTranscript);
  }, [phase, normalizedTranscript, isProcessing, handlePronunciationCheck, activePlayer.id, currentIndexes]);

  const winner = useMemo(() => {
    if (scores.A === scores.B) return null;
    return scores.A > scores.B ? PLAYERS[0] : PLAYERS[1];
  }, [scores]);

  return (
    <>
      <Navbar />
      <div className="relative w-full overflow-x-hidden overflow-y-auto scrollbar-hide bg-[#08070f] text-slate-200 font-sans selection:bg-pink-500/30" style={{ height: "calc(100vh - 80px)", marginTop: "80px" }}>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[180px] animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem]"></div>
        </div>

        <main className="relative z-10 min-h-full max-w-6xl mx-auto p-3 sm:p-4">
          <div className="min-h-full">
            <div className={`relative min-h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#12121e]/95 backdrop-blur-2xl shadow-2xl ${resultFlash === "success" ? "ring-2 ring-emerald-400/60" : resultFlash === "error" ? "ring-2 ring-rose-400/60" : ""}`}>
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 blur-[100px] pointer-events-none"></div>

              <div className="flex min-h-full flex-col px-5 py-5 md:px-8 md:py-7">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Pronunciation Battle</p>
                    <h1 className="mt-2 text-2xl md:text-4xl font-black tracking-tight text-white">Player A vs Player B</h1>
                    <p className="mt-2 text-sm md:text-base text-white/60">Sequential high-score battle using Web Speech API and local state only.</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRulesModal(true)}
                      className="h-[58px] rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-5 text-left text-white transition-all hover:bg-fuchsia-500/20 active:scale-95"
                    >
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Battle Rules</p>
                      <p className="mt-1 text-sm font-black tracking-[0.18em] text-fuchsia-200 uppercase">Open Pop-up</p>
                    </button>
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-center min-w-[140px]">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Active Turn</p>
                      <p className="mt-1 text-lg font-black text-cyan-200">{PLAYERS[activePlayerIndex].name}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {PLAYERS.map((player, playerIndex) => {
                    const isActive = playerIndex === activePlayerIndex && phase === "turn";
                    return (
                      <div
                        key={player.id}
                        className={`relative min-w-0 overflow-hidden rounded-3xl border px-5 py-5 transition-all ${
                          isActive
                            ? "border-cyan-400/50 bg-[linear-gradient(135deg,rgba(6,182,212,0.16),rgba(17,24,39,0.92))] shadow-[0_0_32px_rgba(34,211,238,0.16)]"
                            : "border-white/10 bg-[linear-gradient(135deg,rgba(30,27,75,0.58),rgba(15,23,42,0.88))]"
                        }`}
                      >
                        <div className="absolute inset-0 pointer-events-none">
                          <div className={`absolute -top-12 ${player.id === "A" ? "-left-10" : "-right-10"} h-28 w-28 rounded-full ${isActive ? "bg-cyan-400/12" : "bg-fuchsia-400/10"} blur-3xl`}></div>
                        </div>
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">{player.name}</p>
                            <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-white/35">Score</p>
                            <p className="mt-2 text-5xl font-black text-white tabular-nums leading-none">{scores[player.id]}</p>
                          </div>

                          <div className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 shadow-inner shadow-black/20 sm:w-auto sm:min-w-[112px] sm:text-right sm:shrink-0">
                            <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">Streak</p>
                            <p className="mt-2 text-3xl font-black text-orange-300 tabular-nums leading-none">{streaks[player.id]}</p>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/30">Combo</p>
                          </div>
                        </div>

                        {isActive && (
                          <div className="relative mt-5 overflow-hidden rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2">
                            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-cyan-400/0 via-cyan-300/20 to-cyan-400/0 animate-pulse"></div>
                            <p className="relative text-center text-[10px] font-black uppercase tracking-[0.35em] text-cyan-100">
                              Live Turn
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col items-center px-2 pb-6 text-center">
                  <div className={`relative w-full max-w-4xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-8 md:px-10 md:py-9 shadow-[0_20px_80px_rgba(0,0,0,0.35)] transition-all duration-300 ${resultFlash === "success" ? "ring-2 ring-emerald-400/55 shadow-[0_0_45px_rgba(52,211,153,0.25)]" : ""}`}>
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute left-1/2 top-0 h-28 w-80 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[90px]"></div>
                      <div className="absolute bottom-0 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[80px]"></div>
                      {resultFlash === "success" && (
                        <>
                          <div className="absolute inset-0 bg-emerald-400/8 animate-pulse"></div>
                          <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-emerald-300/25 blur-2xl animate-ping"></div>
                        </>
                      )}
                    </div>

                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.42em] text-white/35">Pronounce the word</p>
                        <div className="rounded-2xl border border-yellow-400/25 bg-yellow-500/10 px-3 py-2 text-right min-w-[86px]">
                          <p className="text-[9px] uppercase tracking-[0.28em] text-white/45">Timer</p>
                          <p className="mt-0.5 text-2xl font-black text-yellow-300 tabular-nums leading-none">{timeLeft}s</p>
                        </div>
                      </div>
                      <h2 className="mt-5 break-words text-5xl md:text-6xl xl:text-7xl font-black tracking-tight text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.2)]">
                        {currentWord}
                      </h2>

                      <div className="mt-5 text-2xl md:text-4xl xl:text-[2.6rem] text-cyan-300/95 font-semibold tracking-wide">
                        {formatSyllables(currentWord)}
                      </div>

                      <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-5 py-4 text-purple-200/90 shadow-[0_0_24px_rgba(168,85,247,0.12)]">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">IPA Guide</p>
                          <p className="mt-2 font-mono text-xl md:text-3xl tracking-wider">[{getIPAPhonetic(currentWord)}]</p>
                        </div>

                        <button
                          type="button"
                          className="group flex h-16 min-w-[220px] items-center justify-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-6 text-cyan-100 transition-all hover:bg-cyan-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
                          onClick={() => {
                            const utterance = new SpeechSynthesisUtterance(currentWord);
                            utterance.rate = 0.82;
                            window.speechSynthesis.speak(utterance);
                          }}
                          disabled={phase !== "turn"}
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cyan-100 transition-transform group-hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </span>
                          <span className="text-left">
                            <span className="block text-[10px] uppercase tracking-[0.3em] text-white/35">Audio Guide</span>
                            <span className="mt-1 block text-sm font-black uppercase tracking-[0.22em]">Play sample</span>
                          </span>
                        </button>
                      </div>

                      <div className="mt-8 flex flex-col items-center gap-5">
                        <button
                          onClick={startListening}
                          disabled={phase !== "turn" || listening || !supported}
                          className="h-16 min-w-[260px] rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500 hover:from-fuchsia-500 hover:via-pink-500 hover:to-rose-400 disabled:from-slate-700 disabled:via-slate-700 disabled:to-slate-700 disabled:text-white/45 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.25em] shadow-[0_12px_35px_rgba(190,24,93,0.32)] transition-all active:scale-95"
                        >
                          {listening ? "Listening" : "Tap To Speak"}
                        </button>

                        {listening && (
                          <div className="flex items-end gap-2 h-16 rounded-full border border-pink-400/15 bg-pink-500/8 px-5 py-2">
                            {[...Array(8)].map((_, index) => (
                              <div
                                key={index}
                                className="w-3 rounded-full bg-gradient-to-t from-fuchsia-500 to-pink-300 animate-bounce"
                                style={{ animationDelay: `${index * 0.08}s`, height: `${35 + index * 6}%` }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 w-full max-w-4xl">
                    <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-left shadow-[0_12px_45px_rgba(0,0,0,0.18)]">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Battle Feed</p>
                      <p className="mt-3 text-sm leading-relaxed text-white/72">{roundSummary}</p>
                    </div>
                  </div>

                  <div className={`mt-6 min-h-[3rem] max-w-4xl text-lg md:text-2xl font-black uppercase tracking-[0.15em] ${feedbackType === "success" ? "text-emerald-300" : feedbackType === "error" ? "text-rose-300" : "text-cyan-100"}`}>
                    {feedback}
                  </div>
                  {speechError && (
                    <p className="mt-2 text-sm font-bold uppercase tracking-wider text-amber-400 animate-in slide-in-from-bottom-4">
                      {speechError === "noisy"
                        ? "🔇 Too much noise? Try raising your voice!"
                        : "🎤 We didn't hear you — please try again!"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {showRulesModal && (
          <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#12121e]/95 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.65)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400"></div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Battle Rules</p>
              <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-white">Pronunciation High-Score Rules</h2>
              <div className="mt-6 space-y-4 text-base md:text-lg text-white/78 leading-relaxed">
                <p>Each player gets 30 seconds.</p>
                <p>Every correct pronunciation awards {basePoints} points.</p>
                <p>Every 3 consecutive correct words awards an extra 50 points.</p>
                <p>Player A finishes first, then Player B takes the same battle format.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="mt-8 h-12 w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black tracking-[0.2em] uppercase transition-all hover:from-fuchsia-500 hover:to-pink-500 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {(phase === "intro" || phase === "transition" || phase === "countdown") && (
          <button
            type="button"
            onClick={launchCountdown}
            disabled={phase === "countdown"}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 text-left"
          >
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#12121e]/95 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.65)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400"></div>
              {phase !== "countdown" ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">High Score Battle</p>
                  <h2 className="mt-4 text-3xl md:text-5xl font-black text-white tracking-tight">
                    {phase === "intro" ? "Player A vs Player B: High Score Battle!" : "Player B's Turn"}
                  </h2>
                  <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed">
                    {phase === "intro"
                      ? "Tap anywhere to start the 3-2-1 countdown. Player A goes first, then Player B gets the same 30-second pronunciation sprint."
                      : "Tap anywhere to trigger the next countdown and hand the microphone to Player B."}
                  </p>
                  <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-yellow-200 text-sm">
                    Every 3 consecutive correct pronunciations adds a +50 streak bonus.
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Get Ready</p>
                  <div className="mt-5 text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.25)] animate-pulse">
                    {COUNTDOWN_STEPS[countdownIndex]}
                  </div>
                </div>
              )}
            </div>
          </button>
        )}

        {phase === "results" && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(28)].map((_, index) => (
                <span
                  key={index}
                  className="absolute block h-3 w-3 rounded-sm animate-confetti"
                  style={{
                    left: `${(index * 13) % 100}%`,
                    top: `-${(index % 5) * 10}%`,
                    background: index % 3 === 0 ? "#f472b6" : index % 3 === 1 ? "#22d3ee" : "#facc15",
                    animationDelay: `${index * 0.08}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#12121e]/95 p-8 shadow-[0_28px_120px_rgba(0,0,0,0.65)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400"></div>
              <div className="absolute -top-24 left-8 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-[100px]"></div>
              <div className="absolute -bottom-20 right-10 h-52 w-52 rounded-full bg-cyan-500/15 blur-[120px]"></div>

              <div className="relative text-center">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Battle Results</p>
                <h2 className="mt-4 text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_24px_rgba(255,255,255,0.16)]">
                  {winner ? `${winner.name} Wins!` : "It’s a Tie!"}
                </h2>
                <p className="mt-4 text-white/70 text-base md:text-lg">
                  {winner ? "The neon crown goes to the higher scorer." : "Both players finished with the same score."}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {PLAYERS.map((player) => (
                    <div
                      key={player.id}
                      className={`rounded-3xl border px-5 py-5 ${winner?.id === player.id ? "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_28px_rgba(34,211,238,0.14)]" : "border-white/10 bg-white/5"}`}
                    >
                      <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{player.name}</p>
                      <p className="mt-3 text-5xl font-black text-white tabular-nums">{scores[player.id]}</p>
                      <p className="mt-2 text-sm text-orange-200">Final streak peak: {streaks[player.id]}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => {
                      setScores({ A: 0, B: 0 });
                      setStreaks({ A: 0, B: 0 });
                      setCurrentIndexes({ A: 0, B: 0 });
                      setActivePlayerIndex(0);
                      setTimeLeft(TURN_DURATION);
                      setFeedback("Tap anywhere to begin the battle.");
                      setFeedbackType(null);
                      setRoundSummary("Local state only. No leaderboard writes in this session.");
                      setIsProcessing(false);
                      setResultFlash(null);
                      setPhase("intro");
                      setWordList(getRandomWordsByDifficulty(pronunciationWords, difficulty, 40));
                    }}
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
          </div>
        )}

        <style>{`
          @keyframes confetti {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(540deg); opacity: 0.2; }
          }

          .animate-confetti {
            animation: confetti 4.6s linear infinite;
          }
        `}</style>
      </div>
    </>
  );
}

export default function TwoPlayerPronunciationBattle() {
  const playError = useErrorSound();
  const [difficulty, setDifficulty] = useState(null);

  if (!difficulty) {
    return <DifficultySelector onSelect={setDifficulty} />;
  }

  return <BattleArena difficulty={difficulty} />;
}