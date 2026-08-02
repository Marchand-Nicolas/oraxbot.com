import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import type { CreateTypes } from "canvas-confetti";
import StarIcon from "./icons/StarIcon";
import GuildIcon from "../GuildIcon";
import styles from "../../styles/components/ui/OraxPlusApplyModal.module.css";
import type { Guild } from "../../types";
import type { PlatformConfig } from "../../utils/platforms/types";

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

interface OraxPlusApplyModalProps {
  /** The server Orax Plus was just activated on (the purchase server). */
  purchaseGuild: Guild;
  /** Every admin server the user can transfer Orax Plus to. */
  adminGuilds: Guild[];
  /** Platform config — used to resolve guild icon URLs. */
  platform: PlatformConfig;
  /** True while the transfer API request is in flight. */
  submitting: boolean;
  /** Triggered when the user clicks Continue. Receives the server id picked in the dropdown. */
  onConfirm: (selectedGuildId: string) => void;
  /** Triggered when the modal is dismissed (overlay click, close button, or after success). */
  onClose: () => void;
}

export default function OraxPlusApplyModal({
  purchaseGuild = { id: "", name: "", icon: null },
  adminGuilds,
  platform,
  submitting,
  onConfirm,
  onClose,
}: OraxPlusApplyModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState(purchaseGuild?.id);
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

  const otherGuilds = useMemo(
    () => adminGuilds.filter((g) => g.id !== purchaseGuild.id),
    [adminGuilds, purchaseGuild.id],
  );

  const selectedGuild =
    adminGuilds.find((g) => g.id === selectedGuildId) ?? purchaseGuild;
  const isUnchanged = selectedGuildId === purchaseGuild.id;
  const canTransfer = otherGuilds.length > 0;

  if (!mounted) return null;

  return createPortal(
    <>
      <canvas ref={canvasRef} className={styles.confettiCanvas} />
      <div className={styles.overlay} role="presentation" onClick={onClose}>
        <section
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="orax-apply-title"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className={styles.closeButton}
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            disabled={submitting}
          >
            x
          </button>
          <div className={styles.iconWrapper}>
            <StarIcon className={styles.icon} />
          </div>
          <h2 id="orax-apply-title">
            {isUnchanged
              ? "Apply Orax Plus to this server?"
              : "Are you sure you want to apply Orax Plus to this server?"}
          </h2>
          <div className={styles.targetServer}>
            <GuildIcon
              iconUrl={platform.getGuildIconUrl(selectedGuild)}
              name={selectedGuild.name}
              className={styles.guildIcon}
            />
            <span className={styles.guildName}>{selectedGuild.name}</span>
          </div>
          <p className={styles.subtitle}>
            Orax Plus was activated on <strong>{purchaseGuild.name}</strong>.
            {canTransfer
              ? " Pick a different server below if you'd rather use it there."
              : ""}
          </p>
          {canTransfer && (
            <label className={styles.selectWrapper}>
              <span className={styles.selectLabel}>
                Transfer to a different server
              </span>
              <select
                className={styles.select}
                value={selectedGuildId}
                onChange={(event) => setSelectedGuildId(event.target.value)}
                disabled={submitting}
              >
                <option value={purchaseGuild.id}>
                  {purchaseGuild.name} (current)
                </option>
                {otherGuilds.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            className={styles.continueButton}
            onClick={() => onConfirm(selectedGuildId)}
            disabled={submitting}
          >
            {submitting
              ? "Applying..."
              : isUnchanged
                ? "Continue"
                : "Apply to this server"}
          </button>
        </section>
      </div>
    </>,
    document.body,
  );
}
