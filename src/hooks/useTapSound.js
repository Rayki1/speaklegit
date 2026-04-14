import { useRef, useCallback } from "react";

/**
 * Returns a `playTap` function that plays /taptap.m4a on every letter tap.
 * The Audio object is reused across calls (ref-based) for performance.
 */
export default function useTapSound(volume = 0.5) {
  const audioRef = useRef(null);

  const playTap = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/taptap.m4a");
      }
      audioRef.current.volume = volume;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // silently ignore autoplay errors
    }
  }, [volume]);

  return playTap;
}
