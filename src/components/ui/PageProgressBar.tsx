'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageProgressBar() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    progressRef.current = 0;
    setVisible(true);

    const tick = () => {
      const p = progressRef.current;
      let increment: number;
      if (p < 30) increment = 1.8;
      else if (p < 60) increment = 0.8;
      else if (p < 85) increment = 0.3;
      else increment = 0.08;

      progressRef.current = Math.min(p + increment, 94);
      if (barRef.current) {
        barRef.current.style.width = `${progressRef.current}%`;
      }
      timerRef.current = setTimeout(tick, 80);
    };
    timerRef.current = setTimeout(tick, 80);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    progressRef.current = 100;
    if (barRef.current) {
      barRef.current.style.width = '100%';
    }
    const t = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(() => {
        progressRef.current = 0;
        if (barRef.current) {
          barRef.current.style.width = '0%';
        }
      }, 500);
    }, 200);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div id="page-progress-track" className={visible ? 'visible' : ''}>
      <div id="page-progress-bar" ref={barRef} />
    </div>
  );
}
