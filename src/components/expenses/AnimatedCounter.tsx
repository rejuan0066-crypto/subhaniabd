import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  className?: string;
}

const AnimatedCounter = ({ value, duration = 1200, prefix = '৳', className }: AnimatedCounterProps) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(tick);
      else prevRef.current = value;
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  const formatted = Math.abs(display).toLocaleString('en-IN');
  return <span className={className}>{display < 0 ? '-' : ''}{prefix}{formatted}</span>;
};

export default AnimatedCounter;
