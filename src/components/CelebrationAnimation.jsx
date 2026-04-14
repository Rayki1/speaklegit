import { useEffect, useState } from "react";

/**
 * CelebrationAnimation Component
 * Displays animated feedback for correct or incorrect answers
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {function} onComplete - Callback when animation completes
 */
function CelebrationAnimation({ isCorrect, onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {isCorrect ? (
        <div className="animate-bounce">
          <div className="relative">
            {/* Green celebration burst */}
            <div className="absolute inset-0 animate-ping">
              <div className="h-32 w-32 rounded-full bg-green-400/30"></div>
            </div>
            
            {/* Main icon */}
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl shadow-green-500/50 animate-scale-up">
              <span className="text-6xl">✓</span>
            </div>
            
            {/* Sparkles */}
            <div className="absolute -top-4 -left-4 text-4xl animate-spin-slow">⭐</div>
            <div className="absolute -top-4 -right-4 text-4xl animate-spin-slow-reverse">✨</div>
            <div className="absolute -bottom-4 -left-4 text-4xl animate-spin-slow-reverse">💚</div>
            <div className="absolute -bottom-4 -right-4 text-4xl animate-spin-slow">🎉</div>
          </div>
          
          <p className="mt-6 text-center text-3xl font-bold text-green-400 animate-pulse">
            Excellent!
          </p>
        </div>
      ) : (
        <div className="animate-shake">
          <div className="relative">
            {/* Red error burst */}
            <div className="absolute inset-0 animate-ping">
              <div className="h-32 w-32 rounded-full bg-red-400/30"></div>
            </div>
            
            {/* Main icon */}
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-2xl shadow-red-500/50 animate-scale-up">
              <span className="text-6xl">✗</span>
            </div>
            
            {/* Error indicators */}
            <div className="absolute -top-4 -left-4 text-4xl animate-bounce">❌</div>
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce delay-100">💔</div>
            <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce delay-200">😔</div>
            <div className="absolute -bottom-4 -right-4 text-4xl animate-bounce delay-300">🔴</div>
          </div>
          
          <p className="mt-6 text-center text-3xl font-bold text-red-400 animate-pulse">
            Try Again!
          </p>
        </div>
      )}
    </div>
  );
}

export default CelebrationAnimation;
