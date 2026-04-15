import { useEffect, useRef } from "react";

/**
 * Custom hook to enable real-time leaderboard updates
 * Automatically refreshes the leaderboard at specified intervals
 * 
 * @param {Function} refreshFunction - Function to call to refresh leaderboard
 * @param {number} intervalMs - Interval in milliseconds (default: 5000ms = 5 seconds)
 * @param {boolean} enabled - Whether to enable auto-refresh (default: true)
 */
export function useRealtimeLeaderboard(refreshFunction, intervalMs = 5000, enabled = true) {
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (!enabled || !refreshFunction) return;

    // Set up visibility change listener to pause updates when tab is not visible
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (isActiveRef.current && !intervalRef.current) {
        // Resume updates when tab becomes visible
        refreshFunction();
        intervalRef.current = setInterval(refreshFunction, intervalMs);
      } else if (!isActiveRef.current && intervalRef.current) {
        // Pause updates when tab is hidden to save bandwidth
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Initial refresh
    refreshFunction();

    // Set up interval
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        refreshFunction();
      }
    }, intervalMs);

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, refreshFunction, intervalMs]);

  // Function to manually trigger refresh
  const manualRefresh = () => {
    if (refreshFunction) {
      refreshFunction();
    }
  };

  return { manualRefresh };
}
