'use client';

import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export function Confetti() {
  useEffect(() => {
    // Single beautiful burst of confetti from the bottom-right corner, targeting the center
    confetti({
      particleCount: 180,
      spread: 75,
      origin: { x: 0.95, y: 0.95 },
      angle: 220,
      startVelocity: 65,
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
      ticks: 250,
    });
  }, []);

  return null;
}
