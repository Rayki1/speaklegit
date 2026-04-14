import { useRef, useCallback } from "react";

/**
 * Returns a `playError` function that plays /error.mp3 at the given volume.
 * The Audio object is reused across calls (ref-based) so no extra allocations.
 */
export default function useErrorSound(volume = 0.6) {
  const audioRef = useRef(null);

  const playError = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/error.mp3");
      }
      audioRef.current.volume = volume;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // silently ignore autoplay errors
    }
  }, [volume]);

  return playError;
}
