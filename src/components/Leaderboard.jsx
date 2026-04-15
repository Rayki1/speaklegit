import { useContext, useMemo } from "react";
import Card from "./Card";
import { UserContext } from "../context/UserContext";
import { useRealtimeLeaderboard } from "../hooks/useRealtimeLeaderboard";

function Leaderboard() {
  const { leaderboard, user, refreshLeaderboard } = useContext(UserContext);

  // Enable real-time updates that refresh every 5 seconds
  const { isRefreshing, lastSyncedAt } = useRealtimeLeaderboard(() => refreshLeaderboard?.(), 5000, true);

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
        <div className="mb-4 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <h2 className="text-lg font-bold uppercase tracking-widest text-white sm:text-xl">
            🏆 Player 1 Leaderboard
          </h2>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur-sm">
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${isRefreshing ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
            {isRefreshing ? "Updating live" : "Live updates on"}
            {lastSyncedAt ? ` • ${lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
          </div>
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
            <div className="relative order-0 lg:order-1 sm:col-span-2 lg:col-span-1 rounded-lg border border-yellow-400 bg-gradient-to-b from-yellow-900/40 to-yellow-900/10 p-3 pt-7 sm:p-4 sm:pt-8 text-center transition hover:from-yellow-900/60 hover:to-yellow-900/30">
              <div className="absolute left-1/2 top-0 flex w-full -translate-x-1/2 -translate-y-1/2 justify-center text-4xl sm:text-5xl animate-bounce">👑</div>
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
      </Card>
    </div>
  );
}

export default Leaderboard;
