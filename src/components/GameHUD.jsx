import { useEffect, useMemo, useRef, useState } from "react";
import { getRewardAnimationDuration, getTimedRoundSeconds } from "../utils/scoring";

function GameHUD({ time, points, gameState, difficulty, showTimer = true, scoreFx = null, topBracketStreak = 0 }) {
  const getDefaultIntensity = () => {
    if (typeof window === "undefined") return "balanced";
    const memory = Number(window.navigator?.deviceMemory || 0);
    const cores = Number(window.navigator?.hardwareConcurrency || 0);
    if ((memory && memory <= 4) || (cores && cores <= 4)) return "lite";
    return "balanced";
  };

  const loadSettings = () => {
    if (typeof window === "undefined") {
      return {
        intensity: "balanced",
        audioEnabled: true,
        cameraShakeEnabled: true,
        debugEnabled: false,
      };
    }

    const fallback = {
      intensity: getDefaultIntensity(),
      audioEnabled: true,
      cameraShakeEnabled: true,
      debugEnabled: false,
    };

    try {
      const raw = window.localStorage.getItem("speaks-hud-settings");
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      const intensity = ["lite", "balanced", "extreme"].includes(parsed?.intensity)
        ? parsed.intensity
        : fallback.intensity;

      return {
        intensity,
        audioEnabled: parsed?.audioEnabled !== false,
        cameraShakeEnabled: parsed?.cameraShakeEnabled !== false,
        debugEnabled: Boolean(parsed?.debugEnabled),
      };
    } catch {
      return fallback;
    }
  };

  const [hudSettings, setHudSettings] = useState(() => loadSettings());
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("speaks-hud-settings", JSON.stringify(hudSettings));
  }, [hudSettings]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const roundSeconds = getTimedRoundSeconds(difficulty);
  const safeTime = Math.max(0, Number.isFinite(time) ? time : 0);
  const ratio = roundSeconds > 0 ? safeTime / roundSeconds : 0;

  const timerClass = ratio > 0.66 ? "text-emerald-300" : ratio > 0.33 ? "text-amber-300" : "text-rose-400 animate-pulse";
  const timerBorderClass = ratio > 0.66 ? "border-emerald-500/30" : ratio > 0.33 ? "border-amber-500/30" : "border-rose-500/35";
  const timerLabelClass = ratio > 0.66 ? "text-emerald-300/70" : ratio > 0.33 ? "text-amber-300/70" : "text-rose-300/80";
  const timerStage = ratio > 0.6 ? "calm" : ratio > 0.3 ? "hurry" : "panic";
  const comboActive = topBracketStreak >= 3;

  const [fxState, setFxState] = useState(null);
  const audioContextRef = useRef(null);
  const tickTimerRef = useRef(null);
  const lastScoreFxKeyRef = useRef(null);

  const intensityProfile =
    hudSettings.intensity === "lite"
      ? { confettiCount: 9, starsCount: 5, vignetteOpacity: "rgba(0,0,0,0.4)", tickVolume: 0.75 }
      : hudSettings.intensity === "extreme"
      ? { confettiCount: 28, starsCount: 16, vignetteOpacity: "rgba(0,0,0,0.68)", tickVolume: 1.15 }
      : { confettiCount: 18, starsCount: 10, vignetteOpacity: "rgba(0,0,0,0.55)", tickVolume: 1 };

  const particles = useMemo(() => {
    if (!fxState) return [];

    if (fxState.tier === 1) {
      return Array.from({ length: intensityProfile.confettiCount }).map((_, index) => ({
        id: `confetti-${index}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 140 - 70,
      }));
    }

    if (fxState.tier === 2) {
      return Array.from({ length: intensityProfile.starsCount }).map((_, index) => ({
        id: `star-${index}`,
        x: 35 + Math.random() * 30,
        y: 40 + Math.random() * 20,
      }));
    }

    return [];
  }, [fxState, intensityProfile.confettiCount, intensityProfile.starsCount]);

  const trailParticles = useMemo(() => {
    if (!fxState?.points) return [];
    return Array.from({ length: fxState.tier === 1 ? 8 : fxState.tier === 2 ? 5 : 3 }).map((_, index) => ({
      id: `trail-${index}`,
      left: 48 + Math.random() * 8,
      top: 42 + index * 5,
      delay: index * 70,
    }));
  }, [fxState]);

  const playBeep = (frequency = 520, durationMs = 70, type = "square", gainValue = 0.015) => {
    if (!hudSettings.audioEnabled) return;
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      const context = audioContextRef.current;
      if (context.state === "suspended") context.resume().catch(() => {});

      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = gainValue;

      osc.connect(gain);
      gain.connect(context.destination);

      const now = context.currentTime;
      gain.gain.setValueAtTime(gainValue, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
      osc.start(now);
      osc.stop(now + durationMs / 1000);
    } catch {
      // Ignore audio failures silently to avoid breaking gameplay.
    }
  };

  useEffect(() => {
    if (!scoreFx?.key || scoreFx.key === lastScoreFxKeyRef.current) return;

    lastScoreFxKeyRef.current = scoreFx.key;
    setFxState({ ...scoreFx });

    if (scoreFx.multiplier > 1) {
      playBeep(920, 90, "triangle", 0.02);
    }

    const timer = setTimeout(() => setFxState(null), getRewardAnimationDuration(scoreFx.tier));
    return () => clearTimeout(timer);
  }, [scoreFx, hudSettings.audioEnabled]);

  useEffect(() => {
    if (!showTimer) return undefined;

    const intervalByStage = timerStage === "calm" ? 1100 : timerStage === "hurry" ? 700 : 340;
    const frequencyByStage = timerStage === "calm" ? 430 : timerStage === "hurry" ? 520 : 620;
    const baseVolume = timerStage === "calm" ? 0.008 : timerStage === "hurry" ? 0.012 : 0.016;
    const volumeByStage = baseVolume * intensityProfile.tickVolume;

    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    if (!hudSettings.audioEnabled) return undefined;

    tickTimerRef.current = setInterval(() => {
      playBeep(frequencyByStage, 45, "square", volumeByStage);
    }, intervalByStage);

    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [timerStage, showTimer, hudSettings.audioEnabled, intensityProfile.tickVolume]);

  const timerStageLabel = timerStage === "calm" ? "Calm" : timerStage === "hurry" ? "Hurry" : "Panic";

  return (
    <>
      {showTimer && timerStage === "panic" && (
        <div
          className="pointer-events-none fixed inset-0 z-40"
          style={{ background: `radial-gradient(circle at center, rgba(0,0,0,0) 35%, ${intensityProfile.vignetteOpacity} 100%)` }}
        />
      )}

      {fxState && (
        <div
          className={`pointer-events-none fixed inset-0 z-[70] flex items-center justify-center ${fxState.tier === 1 && hudSettings.cameraShakeEnabled ? "fx-camera-shake" : ""}`}
        >
          {fxState.tier === 1 && (
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((p) => (
                <span key={p.id} className="fx-confetti" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%, -50%) rotate(${p.r}deg)` }} />
              ))}
            </div>
          )}

          {fxState.tier === 2 && (
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((p) => (
                <span key={p.id} className="fx-star" style={{ left: `${p.x}%`, top: `${p.y}%` }}>✦</span>
              ))}
            </div>
          )}

          <div
            className={`arcade-title px-5 py-2 rounded-2xl border text-2xl sm:text-4xl font-black tracking-[0.18em] ${
              fxState.tier === 1
                ? "fx-tier1 border-yellow-300/70 text-yellow-200"
                : fxState.tier === 2
                ? "fx-tier2 border-cyan-300/70 text-cyan-200"
                : "fx-tier3 border-orange-300/70 text-orange-200"
            }`}
          >
            {fxState.callout || (fxState.tier === 1 ? "PERFECT!" : fxState.tier === 2 ? "GREAT!" : "SAFE!")}
            {fxState.tier === 3 && <span className="ml-2 inline-block text-xl align-middle">💧</span>}
          </div>

          {fxState.points ? (
            <div className={`absolute mt-24 text-lg sm:text-2xl font-black tracking-[0.14em] ${fxState.tier === 1 ? "fx-points-tier1 text-yellow-300" : fxState.tier === 2 ? "fx-points-tier2 text-cyan-200" : "fx-points-tier3 text-orange-200"}`}>
              +{fxState.points}
            </div>
          ) : null}

          {trailParticles.map((trail) => (
            <span
              key={trail.id}
              className="fx-trail"
              style={{ left: `${trail.left}%`, top: `${trail.top}%`, animationDelay: `${trail.delay}ms` }}
            />
          ))}
        </div>
      )}

      <div className="fixed top-[72px] right-3 sm:right-5 z-50 flex flex-col items-end gap-2 pointer-events-none">
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setShowSettingsPanel((prev) => !prev)}
            className="rounded-xl border border-white/20 bg-black/70 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/75 shadow-lg transition hover:border-white/40 hover:text-white active:scale-95"
          >
            FX
          </button>

          {showSettingsPanel && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/15 bg-black/90 p-3 shadow-2xl backdrop-blur-xl">
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/40">Effects</p>

              <div className="mt-2 flex gap-1">
                {[
                  { key: "lite", label: "Lite" },
                  { key: "balanced", label: "Balanced" },
                  { key: "extreme", label: "Extreme" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setHudSettings((prev) => ({ ...prev, intensity: option.key }))}
                    className={`flex-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition active:scale-95 ${
                      hudSettings.intensity === option.key
                        ? "border-cyan-300/70 bg-cyan-500/20 text-cyan-100"
                        : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-1.5">
                <button
                  onClick={() => setHudSettings((prev) => ({ ...prev, audioEnabled: !prev.audioEnabled }))}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-left text-[10px] font-bold text-white/80 transition hover:bg-white/10"
                >
                  Audio: {hudSettings.audioEnabled ? "On" : "Off"}
                </button>
                <button
                  onClick={() => setHudSettings((prev) => ({ ...prev, cameraShakeEnabled: !prev.cameraShakeEnabled }))}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-left text-[10px] font-bold text-white/80 transition hover:bg-white/10"
                >
                  Camera Shake: {hudSettings.cameraShakeEnabled ? "On" : "Off"}
                </button>
                <button
                  onClick={() => setHudSettings((prev) => ({ ...prev, debugEnabled: !prev.debugEnabled }))}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-left text-[10px] font-bold text-white/80 transition hover:bg-white/10"
                >
                  Debug Panel: {hudSettings.debugEnabled ? "On" : "Off"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative group pointer-events-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-orange-500 rounded-xl blur-sm opacity-45 group-hover:opacity-65 transition-opacity duration-300 animate-pulse"></div>
          <div className="relative bg-black/85 backdrop-blur-md border border-yellow-500/35 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-lg text-right min-w-[64px] sm:min-w-[80px]">
            <span className="text-[7px] sm:text-[8px] text-yellow-400/80 arcade-title tracking-[0.18em] flex items-center justify-end gap-0.5 leading-none mb-0.5">
              <span>✦</span> PTS <span>✦</span>
            </span>
            <div className={`arcade-title text-xl sm:text-2xl font-black leading-none transition-all duration-300 ${
              gameState === "correct"
                ? "text-lime-400 scale-110 drop-shadow-[0_0_10px_rgba(163,230,53,0.8)]"
                : gameState === "incorrect"
                ? "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.8)]"
                : "bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent"
            }`}>
              {points}
            </div>
            {comboActive && (
              <div className="mt-1 text-[10px] font-black tracking-wider text-orange-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]">
                🔥 x2
              </div>
            )}
          </div>
        </div>

        {showTimer && (
          <div className="relative pointer-events-auto">
            <div className={`relative bg-black/80 backdrop-blur-md border px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-lg text-right min-w-[64px] sm:min-w-[80px] ${timerBorderClass}`}>
              <span className={`text-[7px] sm:text-[8px] arcade-title tracking-[0.15em] block leading-none mb-0.5 ${timerLabelClass}`}>TIME</span>
              <div className={`arcade-title text-lg sm:text-xl font-black leading-none ${timerClass}`}>
                {formatTime(safeTime)}
              </div>
            </div>
          </div>
        )}

        {hudSettings.debugEnabled && (
          <div className="pointer-events-auto w-[175px] rounded-xl border border-fuchsia-400/35 bg-[#150926]/85 p-2 text-[10px] font-bold text-fuchsia-100 shadow-xl backdrop-blur-md">
            <p className="text-[9px] uppercase tracking-[0.2em] text-fuchsia-300/80">Debug HUD</p>
            <div className="mt-1 space-y-0.5">
              <div>Stage: {timerStageLabel}</div>
              <div>Ratio: {Math.round(ratio * 100)}%</div>
              <div>Tier: {fxState?.tier || "-"}</div>
              <div>Callout: {fxState?.callout || "-"}</div>
              <div>Combo: {comboActive ? "x2 active" : "off"}</div>
              <div>Streak: {topBracketStreak}</div>
              <div>FX: {hudSettings.intensity}</div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fxTier1Pop {
            0% { transform: scale(0) translateY(0); opacity: 0; }
            15% { transform: scale(1.2) translateY(0); opacity: 1; }
            55% { transform: scale(1.28) translateY(-28px); opacity: 1; }
            100% { transform: scale(1.2) translateY(-54px); opacity: 0; }
          }
          @keyframes fxTier2Float {
            0% { transform: scale(0) rotate(-10deg) translateY(0); opacity: 0; }
            25% { transform: scale(1.15) rotate(-4deg) translateY(-4px); opacity: 1; }
            70% { transform: scale(1.22) rotate(8deg) translateY(-34px); opacity: 1; }
            100% { transform: scale(1.14) rotate(12deg) translateY(-50px); opacity: 0; }
          }
          @keyframes fxTier3Wobble {
            0% { transform: scale(0) translateY(10px); opacity: 0; }
            35% { transform: scale(1.14) translateY(-2px) rotate(-7deg); opacity: 1; }
            55% { transform: scale(1.06) translateY(0) rotate(7deg); opacity: 1; }
            100% { transform: scale(0.98) translateY(14px) rotate(0deg); opacity: 0; }
          }
          @keyframes fxCameraShake {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-5px, 1px); }
            20% { transform: translate(5px, -1px); }
            30% { transform: translate(-4px, 1px); }
            40% { transform: translate(4px, -1px); }
            50% { transform: translate(-3px, 1px); }
            60% { transform: translate(3px, -1px); }
            70% { transform: translate(-2px, 0); }
            80% { transform: translate(2px, 0); }
            90% { transform: translate(-1px, 0); }
          }
          @keyframes fxConfetti {
            0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
            100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.9); opacity: 0; }
          }
          @keyframes fxStarTwinkle {
            0% { transform: scale(0.2); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: scale(1.1); opacity: 0; }
          }
          @keyframes fxPointTrail {
            0% { transform: scale(0.3) translateY(0); opacity: 0; }
            35% { opacity: 1; }
            100% { transform: scale(1) translateY(-34px); opacity: 0; }
          }
          @keyframes fxPointFloatTier1 {
            0% { transform: scale(0.8) translateY(0); opacity: 0; }
            20% { transform: scale(1.08) translateY(-6px); opacity: 1; }
            70% { transform: scale(1.12) translateY(-34px); opacity: 1; }
            100% { transform: scale(1) translateY(-62px); opacity: 0; }
          }
          @keyframes fxPointFloatTier2 {
            0% { transform: scale(0.8) translateY(0); opacity: 0; }
            30% { transform: scale(1.02) translateY(-10px); opacity: 1; }
            100% { transform: scale(1) translateY(-42px); opacity: 0; }
          }
          @keyframes fxPointFloatTier3 {
            0% { transform: scale(0.75) translateY(0); opacity: 0; }
            35% { transform: scale(1) translateY(-6px); opacity: 1; }
            100% { transform: scale(0.96) translateY(18px); opacity: 0; }
          }
          .fx-tier1 { animation: fxTier1Pop 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; background: rgba(65, 45, 0, 0.45); box-shadow: 0 0 42px rgba(250, 204, 21, 0.5); text-shadow: 0 0 18px rgba(250, 204, 21, 0.85); }
          .fx-tier2 { animation: fxTier2Float 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; background: rgba(7, 39, 52, 0.45); box-shadow: 0 0 28px rgba(34, 211, 238, 0.38); }
          .fx-tier3 { animation: fxTier3Wobble 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; background: rgba(57, 33, 8, 0.45); box-shadow: 0 0 22px rgba(251, 146, 60, 0.35); }
          .fx-camera-shake { animation: fxCameraShake 1.4s ease-in-out; }
          .fx-confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 2px;
            background: linear-gradient(135deg, #fde047, #f59e0b);
            --dx: 0px;
            --dy: 0px;
            animation: fxConfetti 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .fx-confetti:nth-child(odd) { --dx: 80px; --dy: -90px; }
          .fx-confetti:nth-child(even) { --dx: -80px; --dy: -90px; }
          .fx-star {
            position: absolute;
            color: #67e8f9;
            font-size: 14px;
            animation: fxStarTwinkle 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
            text-shadow: 0 0 10px rgba(103, 232, 249, 0.9);
          }
          .fx-trail {
            position: absolute;
            width: 7px;
            height: 7px;
            border-radius: 999px;
            background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(250,204,21,0.75) 45%, rgba(250,204,21,0) 100%);
            animation: fxPointTrail 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            opacity: 0;
          }
          .fx-points-tier1 { animation: fxPointFloatTier1 2s cubic-bezier(0.23, 1, 0.32, 1) forwards; text-shadow: 0 0 14px rgba(250, 204, 21, 0.7); }
          .fx-points-tier2 { animation: fxPointFloatTier2 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
          .fx-points-tier3 { animation: fxPointFloatTier3 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        `}</style>
      </div>
    </>
  );
}

export default GameHUD;
