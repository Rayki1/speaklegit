import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to enable real-time leaderboard updates
 * Automatically refreshes the leaderboard at specified intervals
 * 
 * @param {Function} refreshFunction - Function to call to refresh leaderboard
 * @param {number} intervalMs - Interval in milliseconds (default: 5000ms = 5 seconds)
 * @param {boolean} enabled - Whether to enable auto-refresh (default: true)
 */
export function useRealtimeLeaderboard(refreshFunction, intervalMs = 5000, enabled = true) {
  const timeoutRef = useRef(null);
  const isActiveRef = useRef(true);
  const isMountedRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  useEffect(() => {
    if (!enabled || !refreshFunction) return;

    isMountedRef.current = true;

    const clearTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const scheduleNextRefresh = () => {
      clearTimer();

      if (!isMountedRef.current || !isActiveRef.current) {
        return;
      }

      timeoutRef.current = setTimeout(async () => {
        if (!isMountedRef.current || !isActiveRef.current) {
          return;
        }

        setIsRefreshing(true);

        try {
          await refreshFunction();
          if (isMountedRef.current) {
            setLastSyncedAt(new Date());
          }
        } finally {
          if (isMountedRef.current) {
            setIsRefreshing(false);
            scheduleNextRefresh();
          }
        }
      }, intervalMs);
    };

    // Set up visibility change listener to pause updates when tab is not visible
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;

      if (isActiveRef.current) {
        refreshFunction();
        setLastSyncedAt(new Date());
        scheduleNextRefresh();
      } else {
        clearTimer();
      }
    };

    // Initial refresh
    (async () => {
      setIsRefreshing(true);
      try {
        await refreshFunction();
        if (isMountedRef.current) {
          setLastSyncedAt(new Date());
        }
      } finally {
        if (isMountedRef.current) {
          setIsRefreshing(false);
          scheduleNextRefresh();
        }
      }
    })();

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      clearTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, refreshFunction, intervalMs]);

  return { isRefreshing, lastSyncedAt };
}
