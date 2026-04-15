import { useContext, useEffect, useState } from "react";
import GameLayout from "../layouts/GameLayout";
import Leaderboard from "../components/Leaderboard";
import { UserContext } from "../context/UserContext";
import { useRealtimeLeaderboard } from "../hooks/useRealtimeLeaderboard";

function Leaderboards() {
  const [mode, setMode] = useState("player1");
  const { refreshLeaderboard } = useContext(UserContext);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Enable real-time updates
  const { manualRefresh } = useRealtimeLeaderboard(
    async () => {
      await refreshLeaderboard?.();
      setLastUpdated(new Date());
    },
    5000,
    true
  );

  useEffect(() => {
    refreshLeaderboard?.();
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <GameLayout title="🏆 Leaderboards">
      <div className="mx-auto max-w-5xl px-3 sm:px-6">
        <p className="mb-6 text-center text-base sm:text-lg text-white/70">
          Check the top scores and climb the Player 1 rankings.
        </p>

        <div className="mb-4 text-center text-xs text-white/50">
          Last updated: {formatTime(lastUpdated)}
        </div>

        <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-2">
          <button
            onClick={() => setMode("player1")}
            className={`rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 text-left transition ${
              mode === "player1"
                ? "border-pink-400 bg-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.18)]"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-pink-200/70">Leaderboard</p>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-white">Player 1</h2>
            <p className="mt-1 text-xs sm:text-sm text-white/70">Live rankings for one-player accounts.</p>
          </button>

          <button
            onClick={() => setMode("player2")}
            className={`rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 text-left transition ${
              mode === "player2"
                ? "border-purple-400 bg-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.18)]"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-purple-200/70">Leaderboard</p>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-white">Player 2</h2>
            <p className="mt-1 text-xs sm:text-sm text-white/70">Coming soon.</p>
          </button>
        </div>

        {mode === "player1" ? (
          <Leaderboard />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 text-center backdrop-blur-md">
            <div className="mb-4 text-5xl sm:text-6xl">🚧</div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">Player 2 Coming Soon</h3>
            <p className="mt-3 text-sm sm:text-base text-white/70">
              Two-player leaderboard is still being prepared. For now, only Player 1 leaderboard is available.
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
}

export default Leaderboards;
