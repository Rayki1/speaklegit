import { useContext } from "react";
import Card from "../components/Card";
import { UserContext } from "../context/UserContext";

function Progress() {
  const { user } = useContext(UserContext);

  return (
    <Card title="📈 Progress">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
          <span className="text-white/70">Words practiced</span>
          <span className="text-2xl font-bold text-pink-300">{user.progress.wordsPracticed}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
          <span className="text-white/70">Levels completed</span>
          <span className="text-2xl font-bold text-purple-300">{user.progress.levelsCompleted}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
          <span className="text-white/70">Current streak</span>
          <span className="text-2xl font-bold text-yellow-300">{user.streak} 🔥</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
          <span className="text-white/70">Total score</span>
          <span className="text-2xl font-bold text-green-300">{user.score}</span>
        </div>

        {/* Coins Section */}
        <div className="rounded-lg bg-gradient-to-r from-yellow-900/40 to-amber-900/40 p-3 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <span className="text-white/70">💰 Coins</span>
            <span className="text-2xl font-bold text-yellow-300">{user.coins}</span>
          </div>
        </div>

        {/* Premium Status */}
        {user.premium && (
          <div className="rounded-lg bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-3 border border-purple-500/30">
            <p className="text-sm text-purple-300 font-semibold">
              👑 Premium Member
            </p>
            {user.premiumExpiry && (
              <p className="text-xs text-white/60 mt-1">
                Expires: {new Date(user.premiumExpiry).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {user.badges.length > 0 && (
          <div className="rounded-lg bg-gradient-to-r from-yellow-900/40 to-orange-900/40 p-3">
            <p className="mb-2 text-sm text-white/70">Badges earned:</p>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <span key={badge} className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-200">
                  🏆 {badge}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default Progress;
