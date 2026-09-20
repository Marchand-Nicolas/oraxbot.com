import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import StarIcon from "./icons/StarIcon";
import GuildIcon from "../GuildIcon";
import styles from "../../styles/components/ui/OraxPlusApplyModal.module.css";
import type { Guild } from "../../types";
import type { PlatformConfig } from "../../utils/platforms/types";
import { t } from "../../utils/i18n";
import { fireCelebration } from "../../utils/confettiCelebration";

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
              ? t("oraxPlus.applySameTitle")
              : t("oraxPlus.applyDifferentTitle")}
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
            {t("oraxPlus.applySubtitle", { server: purchaseGuild.name })}
            {canTransfer ? t("oraxPlus.applySubtitleTransfer") : ""}
          </p>
          {canTransfer && (
            <label className={styles.selectWrapper}>
              <span className={styles.selectLabel}>
                {t("oraxPlus.applyTransferLabel")}
              </span>
              <select
                className={styles.select}
                value={selectedGuildId}
                onChange={(event) => setSelectedGuildId(event.target.value)}
                disabled={submitting}
              >
                <option value={purchaseGuild.id}>
                  {purchaseGuild.name} {t("oraxPlus.applyCurrent")}
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
              ? t("oraxPlus.applying")
              : isUnchanged
                ? t("oraxPlus.applyContinue")
                : t("oraxPlus.applyToServer")}
          </button>
        </section>
      </div>
    </>,
    document.body,
  );
}
