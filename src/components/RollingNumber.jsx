import { useEffect, useRef, useState } from "react";

/**
 * RollingNumber Component
 * Animates a number counting up from 0 to the target value
 * Used for stats and counters to create engaging visual effects
 */
function RollingNumber({ end, duration = 2000, startImmediately = false, triggerKey = 0, className = "" }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    setCount(0);
    setHasStarted(startImmediately);
  }, [end, triggerKey, startImmediately]);

  useEffect(() => {
    if (startImmediately) {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateCount = () => {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
          setCount(end);
          return;
        }

        const progress = 1 - remaining / duration;
        const eased = 1 - Math.pow(1 - progress, 5);
        const currentCount = Math.floor(eased * end);
        setCount(currentCount);

        requestAnimationFrame(updateCount);
      };

      requestAnimationFrame(updateCount);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
          
          const startTime = Date.now();
          const endTime = startTime + duration;

          const updateCount = () => {
            const now = Date.now();
            const remaining = endTime - now;
            
            if (remaining <= 0) {
              setCount(end);
              return;
            }

            const progress = 1 - (remaining / duration);
            const eased = 1 - Math.pow(1 - progress, 5);
            const currentCount = Math.floor(eased * end);
            setCount(currentCount);
            
            requestAnimationFrame(updateCount);
          };

          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasStarted, startImmediately, triggerKey]);

  return (
    <span ref={elementRef} className={`tabular-nums ${className}`.trim()}>
      {count.toLocaleString()}
    </span>
  );
}

export default RollingNumber;
