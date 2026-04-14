import { useState, useEffect } from "react";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import Button from "./Button";

function AdMockup({ onClose, showAd = true }) {
  const { user } = useContext(UserContext);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [adType] = useState(Math.floor(Math.random() * 4));

  const adContent = [
    {
      title: "📱 Arcade Master 2026",
      description: "Download the #1 arcade game now! Free coins inside!",
      icon: "🎮",
      color: "from-blue-900 to-blue-600",
      bgGif: "🕹️",
    },
    {
      title: "💳 Special Promo",
      description: "Get 50% off on premium subscription this month!",
      icon: "💰",
      color: "from-green-900 to-green-600",
      bgGif: "💵",
    },
    {
      title: "🎓 English Mastery Course",
      description: "Speak fluently in just 30 days! Limited slots available.",
      icon: "📚",
      color: "from-purple-900 to-purple-600",
      bgGif: "✏️",
    },
    {
      title: "🎪 Arcade Championship",
      description: "Join our tournament! Win ₱10,000 in prizes!",
      icon: "🏆",
      color: "from-yellow-900 to-yellow-600",
      bgGif: "👾",
    },
  ];

  const ad = adContent[adType];

  useEffect(() => {
    if (!user.premium && showAd) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user.premium, showAd]);

  if (user.premium || !showAd) {
    return null; // No ads for premium users
  }

  if (!showAd) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-md mx-4 rounded-xl border-2 border-white/20 bg-gradient-to-br ${ad.color} p-6 shadow-2xl overflow-hidden`}>
        {/* Decorative blur background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-40 w-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="text-5xl mb-4">{ad.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{ad.title}</h2>
          <p className="text-white/80 mb-6">{ad.description}</p>

          <div className="flex gap-3">
            <Button className="flex-1 btn-3d bg-green-600 hover:bg-green-700">
              Learn More
            </Button>
            <button
              onClick={onClose}
              className={`flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/20 ${
                timeRemaining === 0 ? "" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={timeRemaining > 0}
            >
              {timeRemaining > 0 ? `Close (${timeRemaining}s)` : "✕ Close"}
            </button>
          </div>
        </div>

        {/* Ad label */}
        <div className="absolute top-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white/60">
          AD
        </div>
      </div>
    </div>
  );
}

export default AdMockup;
