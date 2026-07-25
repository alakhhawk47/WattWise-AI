import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(targetValue: number, duration: number = 600): number {
  const [currentValue, setCurrentValue] = useState<number>(targetValue);
  const prevValueRef = useRef<number>(targetValue);

  useEffect(() => {
    if (isNaN(targetValue)) {
      setCurrentValue(targetValue);
      return;
    }

    const startValue = prevValueRef.current;
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out quad formula for natural transition
      const easeOutProgress = 1 - (1 - progress) * (1 - progress);
      const nextVal = startValue + (targetValue - startValue) * easeOutProgress;

      setCurrentValue(nextVal);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        prevValueRef.current = targetValue;
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      prevValueRef.current = currentValue;
    };
  }, [targetValue, duration]);

  return currentValue;
}
