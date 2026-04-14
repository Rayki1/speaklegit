import { useContext, useMemo } from "react";
import Card from "./Card";
import { UserContext } from "../context/UserContext";

function Leaderboard() {
  const { leaderboard, user } = useContext(UserContext);

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
        <h2 className="mb-4 text-center text-lg font-bold uppercase tracking-widest">🏆 Player 1 Leaderboard</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {topThree[1] && (
            <div className="order-1 rounded-lg border border-gray-400/30 bg-gray-800/20 p-4 text-center">
              <p className="mb-2 text-4xl">🥈</p>
              <p className="font-bold text-white">{topThree[1].name}</p>
              <p className="text-sm text-white/60">2nd Place</p>
              <p className="mt-3 text-2xl font-bold text-gray-300">{topThree[1].score}</p>
            </div>
          )}

          {topThree[0] && (
            <div className="relative order-0 rounded-lg border border-yellow-400 bg-gradient-to-b from-yellow-900/40 to-yellow-900/10 p-4 text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-4xl">👑</div>
              <p className="mb-2 text-4xl">🥇</p>
              <p className="font-bold text-yellow-300">{topThree[0].name}</p>
              <p className="text-sm text-yellow-400/60">1st Place</p>
              <p className="mt-3 text-3xl font-bold text-yellow-300">{topThree[0].score}</p>
            </div>
          )}

          {topThree[2] && (
            <div className="order-2 rounded-lg border border-amber-700/30 bg-amber-900/20 p-4 text-center">
              <p className="mb-2 text-4xl">🥉</p>
              <p className="font-bold text-white">{topThree[2].name}</p>
              <p className="text-sm text-white/60">3rd Place</p>
              <p className="mt-3 text-2xl font-bold text-amber-300">{topThree[2].score}</p>
            </div>
          )}
        </div>
      </div>

      <Card title="📊 Player 1 Rankings">
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {displayLeaderboard.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-white/70">
              No leaderboard data yet.
            </div>
          ) : (
            restOfLeaderboard.map((entry) => {
              const isCurrentUser = (entry.username || entry.name) === currentUserName;
              return (
                <div
                  key={`${entry.rank}-${entry.name}`}
                  className={`flex items-center justify-between rounded-lg border p-3 transition ${
                    isCurrentUser
                      ? "border-pink-500/50 bg-pink-900/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center text-lg font-bold text-white/60">{entry.rank}</span>
                    <div>
                      <span className={`text-sm font-semibold ${isCurrentUser ? "text-pink-300" : "text-white"}`}>
                        {entry.name}
                        {isCurrentUser && " (You)"}
                      </span>
                      <p className="text-xs text-white/50">Coins: {entry.coins || 0}{entry.premiumTier ? ` • ${entry.premiumTier}` : ""}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-300">{entry.score}</span>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {userRank >= 0 && displayLeaderboard[userRank] && (
        <div className="rounded-lg border border-pink-500/30 bg-pink-900/20 p-4 text-center">
          <p className="text-sm text-white/60">Your Current Position</p>
          <p className="mt-1 text-3xl font-bold text-pink-300">#{userRank + 1}</p>
          <p className="mt-1 text-xl font-bold text-white">{displayLeaderboard[userRank]?.score} points</p>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
