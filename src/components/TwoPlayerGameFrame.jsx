import { useState } from "react";
import { Link } from "react-router-dom";
import GameLayout from "../layouts/GameLayout";

function TwoPlayerGameFrame({ title, subtitle, howToPlaySteps = [], floatingHud = null, children }) {
  const [showHowToPlay, setShowHowToPlay] = useState(true);

  return (
    <GameLayout>
      <div className="mx-auto max-w-6xl h-full px-2 sm:px-3 py-2 md:py-3 relative flex flex-col gap-2">
        <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_16px_50px_rgba(0,0,0,0.25)] p-3 md:p-4 transition-all duration-300">
          <h1 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
          <p className="mt-1 text-slate-600 text-xs md:text-sm">{subtitle}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHowToPlay(true)}
              className="px-3 py-2 rounded-2xl bg-sky-100 hover:bg-sky-200 text-slate-800 font-semibold transition-all duration-300 hover:-translate-y-0.5"
            >
              How to Play
            </button>

            <Link
              to="/twoplayer"
              className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all duration-300 hover:-translate-y-0.5"
            >
              Back to Menu
            </Link>
          </div>
        </div>

        <div className="flex-1 min-h-0 rounded-3xl bg-white/55 backdrop-blur-md border border-white/60 shadow-[0_16px_50px_rgba(0,0,0,0.25)] p-3 md:p-4 overflow-y-auto">
          {children}
        </div>

        {floatingHud && (
          <div className="fixed top-20 right-4 sm:right-6 z-40 pointer-events-none">
            {floatingHud}
          </div>
        )}

        {showHowToPlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close How to Play"
              onClick={() => setShowHowToPlay(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-sky-100 shadow-[0_30px_90px_rgba(0,0,0,0.35)] p-6 md:p-8 animate-fadeIn">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-slate-800">How to Play</h2>
                  <p className="text-slate-500 text-sm md:text-base mt-1">Read these steps before you start.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHowToPlay(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {howToPlaySteps.slice(0, 2).map((step, index) => (
                  <div key={step} className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                    <p className="text-xs font-bold tracking-wider text-sky-700 mb-1">STEP {index + 1}</p>
                    <p className="text-slate-700 text-sm md:text-base leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowHowToPlay(false)}
                className="mt-5 w-full rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 transition-all duration-300"
              >
                Start Game
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}

export default TwoPlayerGameFrame;
