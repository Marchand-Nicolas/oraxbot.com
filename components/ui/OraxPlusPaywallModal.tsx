import { useEffect, useRef, type ReactNode } from "react";
import ActionModal, { type ActionModalAction } from "./ActionModal";
import actionStyles from "../../styles/components/ui/ActionModal.module.css";
import { trackOraxPlusEvent, type OraxPlusOrigin } from "../../utils/oraxPlus";
import type { PlatformConfig } from "../../utils/platforms";
import type { OraxPlusPricing } from "../../utils/pricing";
import { t } from "../../utils/i18n";

export type OraxPlusPlan = "monthly" | "lifetime";

export interface OraxPlusActionButtonsProps {
  pricing: OraxPlusPricing;
  voteLabel?: string;
  onVote?: () => void;
  onCheckout: (plan: OraxPlusPlan) => void;
  checkoutLabels?: Partial<Record<OraxPlusPlan, string>>;
  className?: string;
}

export function buildOraxPlusActions({
  pricing,
  voteLabel,
  onVote,
  onCheckout,
  checkoutLabels,
  wrapAction = (fn) => fn,
}: OraxPlusActionButtonsProps & {
  wrapAction?: (action: () => void) => () => void;
}): ActionModalAction[] {
  return [
    ...(voteLabel && onVote
      ? [
          {
            label: voteLabel,
            variant: "secondary" as const,
            onClick: wrapAction(onVote),
          },
        ]
      : []),
    {
      label:
        checkoutLabels?.monthly ??
        t("oraxPlus.subscribe", { price: pricing.monthly }),
      variant: "primary",
      onClick: wrapAction(() => onCheckout("monthly")),
    },
    {
      label:
        checkoutLabels?.lifetime ??
        t("oraxPlus.lifetime", { price: pricing.lifetime }),
      variant: "primary",
      onClick: wrapAction(() => onCheckout("lifetime")),
    },
  ];
}

export function OraxPlusActionButtons(props: OraxPlusActionButtonsProps) {
  const actions = buildOraxPlusActions(props);
  return (
    <div className={props.className || actionStyles.actions}>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={[
            actionStyles.actionButton,
            actionStyles[action.variant || "secondary"],
          ].join(" ")}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

interface OraxPlusPaywallModalProps {
  title: string;
  description: ReactNode;
  /** Paywall recorded as `paywall_shown` when the modal opens. */
  origin: OraxPlusOrigin;
  /** Server the user acts from (one of theirs). */
  guildId: string;
  groupId?: string | number;
  /** On /join: attributes the paywall to the group's owner server. */
  linkId?: string;
  platform?: PlatformConfig;
  pricing: OraxPlusPricing;
  /** Vote button label; the button is hidden without it. */
  voteLabel?: string;
  onVote?: () => void;
  onCheckout: (plan: OraxPlusPlan) => void;
  /** Replaces the default "Subscribe" / "Lifetime" labels. */
  checkoutLabels?: Partial<Record<OraxPlusPlan, string>>;
  onClose: () => void;
}

/**
 * The Orax Plus paywall modal shared by every page: an optional vote button
 * followed by the monthly and lifetime checkouts as primary actions. Each
 * button closes the modal before running its action.
 */
export default function OraxPlusPaywallModal({
  title,
  description,
  origin,
  guildId,
  groupId,
  linkId,
  platform,
  pricing,
  voteLabel,
  onVote,
  onCheckout,
  checkoutLabels,
  onClose,
}: OraxPlusPaywallModalProps) {
  // The modal unmounts when closed, so mounting is one paywall shown. The
  // ref keeps Strict Mode's double effect run from counting it twice.
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackOraxPlusEvent(
      "paywall_shown",
      { origin, guildId, groupId, linkId },
      platform,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeThen = (action: () => void) => () => {
    onClose();
    action();
  };

  const actions = buildOraxPlusActions({
    pricing,
    voteLabel,
    onVote,
    onCheckout,
    checkoutLabels,
    wrapAction: closeThen,
  });

  return (
    <ActionModal
      title={title}
      description={description}
      actions={actions}
      onClose={onClose}
    />
  );
}
