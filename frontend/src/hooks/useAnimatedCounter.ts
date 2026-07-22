import { useState, useEffect } from "react";

export function useAnimatedCounter(targetValue: number, duration: number = 800): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    
    if (isNaN(targetValue)) {
      setCount(targetValue);
      return;
    }

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out quad formula
      const easeOutProgress = 1 - (1 - progress) * (1 - progress);
      const currentCount = startValue + (targetValue - startValue) * easeOutProgress;

      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetValue, duration]);

  return count;
}
