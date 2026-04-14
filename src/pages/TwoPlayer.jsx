import GameLayout from "../layouts/GameLayout";
import GameMenu from "./GameMenu";

function TwoPlayer() {
  return (
    <GameLayout scrollable>
      <div className="relative mx-auto max-w-5xl px-3 py-3 sm:px-4 md:py-4">

        {/* TITLE */}
        <div className="mb-5 text-center md:mb-6">
          <h1 className="arcade-title mb-2 text-3xl tracking-[0.08em] text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] md:text-4xl lg:text-5xl">
            TWO PLAYERS
          </h1>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
          <p className="mt-3 text-sm font-medium italic tracking-widest text-white/60 md:text-base">
            ✦ Challenge a friend and see who reigns supreme ✦
          </p>
        </div>

        <GameMenu mode="two" />
      </div>
    </GameLayout>
  );
}

export default TwoPlayer;
