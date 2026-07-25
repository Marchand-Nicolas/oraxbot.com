import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import type { CreateTypes } from "canvas-confetti";
import StarIcon from "./icons/StarIcon";
import styles from "../../styles/components/ui/OraxPlusSuccessModal.module.css";

const CONFETTI_COLORS = ["#00a1e8", "#8151fc", "#ffffff", "#ffd166"];

function fireCelebration(fire: CreateTypes) {
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

export default function OraxPlusSuccessModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current || firedRef.current) return;
    firedRef.current = true;
    const fire = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });
    fireCelebration(fire);
    return () => {
      fire.reset();
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <>
      <canvas ref={canvasRef} className={styles.confettiCanvas} />
      <div className={styles.overlay} role="presentation" onClick={onClose}>
        <section
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="orax-success-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.iconWrapper}>
            <StarIcon className={styles.icon} />
          </div>
          <h2 id="orax-success-title">Thank you for supporting Orax!</h2>
          <p className={styles.subtitle}>
            Your Orax Plus purchase was received. The plan will activate as soon
            as Stripe confirms the payment.
          </p>

          <div className={styles.supportCard}>
            <h3>For priority support:</h3>
            <ul>
              <li>
                <span className={styles.supportLabel}>Email:</span>{" "}
                <a href="mailto:support@oraxbot.com">support@oraxbot.com</a>
              </li>
              <li>
                <span className={styles.supportLabel}>Discord:</span>{" "}
                <a
                  href="https://discord.gg/e3pBtbum4A"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join our server
                </a>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className={styles.continueButton}
            onClick={onClose}
          >
            Continue
          </button>
        </section>
      </div>
    </>,
    document.body,
  );
}
