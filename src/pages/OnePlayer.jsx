import GameLayout from "../layouts/GameLayout";
import GameMenu from "./GameMenu";

function OnePlayer() {
  return (
    <GameLayout scrollable>
      <div className="relative mx-auto max-w-6xl px-3 py-4 sm:px-4 md:py-6">

        {/* TITLE */}
        <div className="mb-8 text-center relative">
          {/* Glow behind title */}
          <div className="pointer-events-none absolute inset-0 -top-6 flex items-center justify-center">
            <div className="w-64 h-16 bg-pink-500/15 blur-3xl rounded-full" />
          </div>
          <p className="text-[9px] uppercase tracking-[0.5em] text-pink-400/60 mb-3 font-bold">Single Player</p>
          <h1 className="arcade-title relative text-3xl md:text-4xl lg:text-5xl tracking-[0.06em] text-white drop-shadow-[0_0_30px_rgba(236,72,153,0.5)] mb-3">
            ONE PLAYER
          </h1>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-pink-400/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-pink-400/60" />
          </div>
          <p className="text-sm font-medium italic tracking-widest text-white/40">
            Practice English skills solo
          </p>
          {/* Coins display removed */}
        </div>

        <GameMenu mode="one" />
      </div>
    </GameLayout>
  );
}

export default OnePlayer;