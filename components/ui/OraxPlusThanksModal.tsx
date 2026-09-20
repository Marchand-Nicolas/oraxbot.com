import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import StarIcon from "./icons/StarIcon";
import styles from "../../styles/components/ui/OraxPlusApplyModal.module.css";
import { t } from "../../utils/i18n";
import { fireCelebration } from "../../utils/confettiCelebration";

interface OraxPlusThanksModalProps {
  onClose: () => void;
}

export default function OraxPlusThanksModal({
  onClose,
}: OraxPlusThanksModalProps) {
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
          aria-labelledby="orax-thanks-title"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className={styles.closeButton}
            type="button"
            aria-label="Close modal"
            onClick={onClose}
          >
            x
          </button>
          <div className={styles.iconWrapper}>
            <StarIcon className={styles.icon} />
          </div>
          <h2 id="orax-thanks-title">{t("oraxPlus.thanksTitle")}</h2>
          <p className={styles.subtitle}>{t("oraxPlus.thanksDesc")}</p>
          <button
            type="button"
            className={styles.continueButton}
            onClick={onClose}
          >
            {t("oraxPlus.applyContinue")}
          </button>
        </section>
      </div>
    </>,
    document.body,
  );
}
