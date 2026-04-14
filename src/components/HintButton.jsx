import { useState } from "react";
import Button from "./Button";

/**
 * HintButton Component
 * Provides hints to users during gameplay
 * @param {string} hint - The hint text to display
 * @param {number} cost - Cost in coins to reveal hint (default: 5)
 * @param {function} onUseHint - Callback when hint is used
 */
function HintButton({ hint, cost = 5, onUseHint }) {
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const handleClick = () => {
    if (!hintUsed && onUseHint) {
      const canUse = onUseHint(cost);
      if (canUse) {
        setShowHint(true);
        setHintUsed(true);
      }
    } else if (!hintUsed) {
      setShowHint(true);
      setHintUsed(true);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="secondary"
        onClick={handleClick}
        disabled={hintUsed}
        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
      >
        {hintUsed ? "💡 Hint Used" : `💡 Get Hint (${cost} coins)`}
      </Button>
      
      {showHint && (
        <div className="rounded-lg border border-yellow-400/50 bg-gradient-to-br from-yellow-900/40 to-orange-900/40 p-4 shadow-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm font-semibold text-yellow-300 mb-1">Hint:</p>
              <p className="text-white/90">{hint}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HintButton;
