import type { CreateTypes } from "canvas-confetti";

export const CONFETTI_COLORS = ["#00a1e8", "#8151fc", "#ffffff", "#ffd166"];

export function fireCelebration(fire: CreateTypes) {
  const defaults = {
    spread: 70,
    ticks: 200,
    gravity: 0.9,
    decay: 0.93,
    startVelocity: 35,
    colors: CONFETTI_COLORS,
  };

  function shoot(pair: { particleRatio: number; angle: number }) {
    fire({
      ...defaults,
      particleCount: Math.floor(200 * pair.particleRatio),
      origin: { y: 0.6 },
      ...pair,
    });
  }

  const bursts = [
    { particleRatio: 0.25, angle: 60 },
    { particleRatio: 0.2, angle: 120 },
    { particleRatio: 0.35, angle: 60 },
    { particleRatio: 0.1, angle: 120 },
    { particleRatio: 0.3, angle: 60 },
    { particleRatio: 0.25, angle: 120 },
  ];

  bursts.forEach((b, i) => {
    setTimeout(() => shoot(b), i * 120);
  });

  setTimeout(() => {
    fire({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: CONFETTI_COLORS,
    });
    fire({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: CONFETTI_COLORS,
    });
  }, 250);
}
