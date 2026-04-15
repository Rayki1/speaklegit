import { useContext, useMemo, useEffect, useState } from "react";
import Card from "./Card";
import { UserContext } from "../context/UserContext";
import { useRealtimeLeaderboard } from "../hooks/useRealtimeLeaderboard";

function Leaderboard() {
  const { leaderboard, user, refreshLeaderboard } = useContext(UserContext);
  const [isSyncing, setIsSyncing] = useState(false);

  // Enable real-time updates that refresh every 5 seconds
  const { manualRefresh } = useRealtimeLeaderboard(
    async () => {
      setIsSyncing(true);
      await refreshLeaderboard?.();
      setIsSyncing(false);
    },
    5000,
    true
  );

  const displayLeaderboard = useMemo(() => {
    if (leaderboard.length === 0) {
      return [
        { name: "Ricky", score: 5250, rank: 1, coins: 120, premiumTier: "gold" },
        { name: "Aly", score: 4800, rank: 2, coins: 95, premiumTier: null },
      ];
    }

    return leaderboard.slice(0, 100).map((entry, idx) => ({
      ...entry,
      name: entry.username || entry.name || "Player",
      rank: entry.rank || idx + 1,
    }));
  }, [leaderboard]);

  const currentUserName = user?.username || user?.name || "Guest";
  const userRank = useMemo(() => {
    return displayLeaderboard.findIndex((entry) => (entry.username || entry.name) === currentUserName);
  }, [displayLeaderboard, currentUserName]);

  const topThree = displayLeaderboard.slice(0, 3);
  const restOfLeaderboard = displayLeaderboard.slice(3);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-center text-lg font-bold uppercase tracking-widest text-white sm:text-xl">
            🏆 Player 1 Leaderboard
          </h2>
          <button
            onClick={manualRefresh}
            disabled={isSyncing}
            className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
              isSyncing
                ? "cursor-wait bg-gray-500/30 text-gray-300"
                : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
            }`}
            title="Manually refresh leaderboard"
          >
            {isSyncing ? "🔄 Syncing..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Top 3 - Responsive Grid */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topThree[1] && (
            <div className="order-1 rounded-lg border border-gray-400/30 bg-gray-800/20 p-3 text-center sm:p-4 transition hover:bg-gray-800/40">
              <p className="mb-2 text-3xl sm:text-4xl">🥈</p>
              <p className="font-bold text-white line-clamp-1 text-sm sm:text-base">{topThree[1].name}</p>
              <p className="text-xs text-white/60">2nd Place</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-300">{topThree[1].score}</p>
            </div>
          )}

          {topThree[0] && (
            <div className="relative order-0 lg:order-1 sm:col-span-2 lg:col-span-1 rounded-lg border border-yellow-400 bg-gradient-to-b from-yellow-900/40 to-yellow-900/10 p-3 sm:p-4 text-center transition hover:from-yellow-900/60 hover:to-yellow-900/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl sm:text-4xl animate-bounce">👑</div>
              <p className="mb-2 text-4xl sm:text-5xl">🥇</p>
              <p className="font-bold text-yellow-300 line-clamp-1 text-sm sm:text-base">{topThree[0].name}</p>
              <p className="text-xs text-yellow-400/60">1st Place</p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-yellow-300">{topThree[0].score}</p>
            </div>
          )}

          {topThree[2] && (
            <div className="order-2 rounded-lg border border-amber-700/30 bg-amber-900/20 p-3 text-center sm:p-4 transition hover:bg-amber-900/40">
              <p className="mb-2 text-3xl sm:text-4xl">🥉</p>
              <p className="font-bold text-white line-clamp-1 text-sm sm:text-base">{topThree[2].name}</p>
              <p className="text-xs text-white/60">3rd Place</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-300">{topThree[2].score}</p>
            </div>
          )}
        </div>
      </div>

      <Card title="📊 Player 1 Rankings">
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {displayLeaderboard.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-white/70 text-sm sm:text-base">
              No leaderboard data yet.
            </div>
          ) : (
            restOfLeaderboard.map((entry) => {
              const isCurrentUser = (entry.username || entry.name) === currentUserName;
              return (
                <div
                  key={`${entry.rank}-${entry.name}`}
                  className={`flex items-center justify-between rounded-lg border p-2 sm:p-3 transition text-sm sm:text-base ${
                    isCurrentUser
                      ? "border-pink-500/50 bg-pink-900/20 hover:bg-pink-900/40"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <span className="w-6 sm:w-8 text-center text-base sm:text-lg font-bold text-white/60 flex-shrink-0">{entry.rank}</span>
                    <div className="min-w-0">
                      <span className={`text-xs sm:text-sm font-semibold line-clamp-1 ${isCurrentUser ? "text-pink-300" : "text-white"}`}>
                        {entry.name}
                        {isCurrentUser && " (You)"}
                      </span>
                      <p className="text-xs text-white/50 line-clamp-1">{entry.premiumTier ? `${entry.premiumTier} • ` : ""}Coins: {entry.coins || 0}</p>
                    </div>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-green-300 flex-shrink-0 ml-2">{entry.score}</span>
                </div>
              );
            })
          )}
        </div>
        
        {/* Real-time sync indicator */}
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-white/50 flex items-center justify-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isSyncing ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`}></span>
            {isSyncing ? "Syncing..." : "Live • Auto-updating"}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Leaderboard;
