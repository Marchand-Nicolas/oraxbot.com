import styles from "../../styles/Dashboard.module.css";
import type { OraxPlusPricing } from "../../utils/pricing";
import { t } from "../../utils/i18n";

export interface OraxPlusPlanActionsProps {
  pricing: OraxPlusPricing;
  voteLabel?: string;
  showVoteButton?: boolean;
  showMonthlyButton?: boolean;
  showLifetimeButton?: boolean;
  onVote?: () => void;
  onCheckout: (plan: "monthly" | "lifetime") => void;
}

export default function OraxPlusPlanActions({
  pricing,
  voteLabel,
  showVoteButton = true,
  showMonthlyButton = true,
  showLifetimeButton = true,
  onVote,
  onCheckout,
}: OraxPlusPlanActionsProps) {
  const hasVote = Boolean(showVoteButton && voteLabel && onVote);
  if (!hasVote && !showMonthlyButton && !showLifetimeButton) return null;

  return (
    <div className={styles.planActions}>
      {hasVote && (
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onVote}
        >
          {voteLabel}
        </button>
      )}
      {showMonthlyButton && (
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => onCheckout("monthly")}
        >
          {t("oraxPlus.subscribe", { price: pricing.monthly })}
        </button>
      )}
      {showLifetimeButton && (
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => onCheckout("lifetime")}
        >
          {t("oraxPlus.lifetime", { price: pricing.lifetime })}
        </button>
      )}
    </div>
  );
}
