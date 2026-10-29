import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../../../styles/dashboard/UserSettings.module.css";
import Loading from "../../../components/Loading";
import UserMenu from "../../../components/dashboard/UserMenu";
import GuildIcon from "../../../components/GuildIcon";
import OraxPlusThanksModal from "../../../components/ui/OraxPlusThanksModal";
import OraxPlusPlanActions from "../../../components/dashboard/OraxPlusPlanActions";
import { notify } from "../../../components/ui/NotificationSystem";
import { LanguageProvider, useLanguage } from "../../../hooks/useLanguage";
import { usePlatformAuth } from "../../../hooks/usePlatformAuth";
import {
  setActiveTokenCookie,
  setAuthRedirectTarget,
} from "../../../utils/apiClient";
import { getPlatform } from "../../../utils/platforms";
import { platformApi } from "../../../utils/platformApi";
import {
  startOraxPlusCheckout,
  startOraxPlusVote,
  changeOraxPlusServer,
} from "../../../utils/oraxPlus";
import {
  getOraxPlusPricing,
  getPricingRegion,
  type PricingRegion,
} from "../../../utils/pricing";
import {
  setGlobalLanguage,
  getVoteLabel,
  type LanguageCode,
} from "../../../utils/i18n";
import type { PlatformConfig } from "../../../utils/platforms/types";
import type { Guild } from "../../../types";

export const getServerSideProps: GetServerSideProps<{
  pricingRegion: PricingRegion;
}> = async ({ req }) => ({
  props: {
    pricingRegion: getPricingRegion(req.headers["x-vercel-ip-country"]),
  },
});

const DATE_LOCALES: Record<LanguageCode, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

interface Purchase {
  id: number;
  guildId: string | null;
  guildName: string | null;
  guildIcon: string | null;
  guildIconUrl: string | null;
  previousGuildId: string | null;
  plan: "monthly" | "lifetime" | string;
  source: string;
  sourceRef: string | null;
  active: boolean;
  purchasedAt: string | null;
  expiresAt: string | null;
  platform: string;
  stripe: {
    customerId: string | null;
    checkoutSessionId: string | null;
    latestInvoice: string | null;
    paymentIntent: string | null;
    status: string | null;
  };
}

interface PurchaseHistoryResponse {
  result?: boolean;
  supportEmail?: string;
  purchases?: Purchase[];
  message?: string;
}

interface SelfHostedInstanceData {
  id: number;
  guildId?: string | null;
  originUrl: string;
  botUserId: string | null;
  botUsername: string | null;
  status: "running" | "paused_no_plus" | "invalid_token" | "unreachable" | string;
  connected?: boolean;
  lastError: string | null;
}

interface GetFluxerInstanceResponse {
  result?: boolean;
  oraxPlusActive?: boolean;
  oraxPlusSource?: string | null;
  hasVotedFluxerlist?: boolean;
  instance?: SelfHostedInstanceData | null;
  message?: string;
}

interface SetFluxerInstanceResponse {
  result?: boolean;
  instance?: SelfHostedInstanceData;
  message?: string;
}

interface DeleteFluxerInstanceResponse {
  result?: boolean;
  deleted?: boolean;
  message?: string;
}

export default function UserSettingsPage({
  pricingRegion = "default",
}: {
  pricingRegion?: PricingRegion;
}) {
  const router = useRouter();
  const platformSlug = router.query.platform;
  const platform =
    typeof platformSlug === "string" ? getPlatform(platformSlug) : undefined;

  useEffect(() => {
    if (!router.isReady) return;
    if (!platform) window.location.href = "/dashboard";
  }, [router.isReady, platform]);

  if (!platform) return <Loading />;

  return <UserSettings platform={platform} pricingRegion={pricingRegion} />;
}

function UserSettings({
  platform,
  pricingRegion,
}: {
  platform: PlatformConfig;
  pricingRegion: PricingRegion;
}) {
  const { user, guilds, loading } = usePlatformAuth(platform);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [supportEmail, setSupportEmail] = useState("support@oraxbot.com");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  useEffect(() => {
    setActiveTokenCookie(platform.cookieName);
    setAuthRedirectTarget(`/dashboard/${platform.slug}/settings`);
  }, [platform]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const oraxPlusResult = params.get("orax_plus");
    const stripeSessionId = params.get("session_id");
    if (oraxPlusResult === "success" || stripeSessionId) {
      setShowThanks(true);
      const cleaned = new URLSearchParams(window.location.search);
      cleaned.delete("orax_plus");
      cleaned.delete("session_id");
      const search = cleaned.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (search ? `?${search}` : "") + window.location.hash,
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(false);
    platformApi<PurchaseHistoryResponse>("get_orax_plus_purchase_history")
      .then((res) => {
        if (cancelled) return;
        if (res.result) {
          setPurchases(res.purchases || []);
          if (res.supportEmail) setSupportEmail(res.supportEmail);
        } else {
          setHistoryError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setHistoryError(true);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [platform.slug, historyRefresh]);

  return (
    <LanguageProvider lang="en">
      {user && <UserMenu user={user} platform={platform} />}
      <UserSettingsContent
        platform={platform}
        pricingRegion={pricingRegion}
        guilds={guilds}
        purchases={purchases}
        onRefreshPurchases={() => setHistoryRefresh((c) => c + 1)}
        supportEmail={supportEmail}
        historyLoading={historyLoading}
        historyError={historyError}
        pageLoading={loading && !user}
        showThanks={showThanks}
        onCloseThanks={() => setShowThanks(false)}
      />
    </LanguageProvider>
  );
}

function guildIconUrl(purchase: Purchase, platform: PlatformConfig) {
  if (purchase.guildIconUrl) return purchase.guildIconUrl;
  if (!purchase.guildId || !purchase.guildIcon) return null;
  const sourcePlatform =
    purchase.platform === "fluxer" || purchase.platform === "discord"
      ? purchase.platform
      : platform.slug;
  const resolved = getPlatform(sourcePlatform) || platform;
  return resolved.getGuildIconUrl({
    id: purchase.guildId,
    icon: purchase.guildIcon,
  });
}

function UserSettingsContent({
  platform,
  pricingRegion,
  guilds,
  purchases,
  onRefreshPurchases,
  supportEmail,
  historyLoading,
  historyError,
  pageLoading,
  showThanks,
  onCloseThanks,
}: {
  platform: PlatformConfig;
  pricingRegion: PricingRegion;
  guilds: Guild[];
  purchases: Purchase[];
  onRefreshPurchases: () => void;
  supportEmail: string;
  historyLoading: boolean;
  historyError: boolean;
  pageLoading: boolean;
  showThanks: boolean;
  onCloseThanks: () => void;
}) {
  const { t, lang } = useLanguage();
  setGlobalLanguage(lang);
  const [selected, setSelected] = useState<Purchase | null>(null);
  const dateLocale = DATE_LOCALES[lang] || "en-US";
  const pricing = getOraxPlusPricing(pricingRegion, lang);
  const hasUnassignedActivePurchase = purchases.some(
    (p) => p.active && (!p.guildId || p.guildId === "0"),
  );

  function formatDate(value: string | null) {
    if (!value) return t("userSettings.notAvailable");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("userSettings.notAvailable");
    return new Intl.DateTimeFormat(dateLocale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function planLabel(purchase: Purchase) {
    return purchase.plan === "lifetime"
      ? t("userSettings.planLifetime")
      : t("userSettings.planMonthly");
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href={`/dashboard/${platform.slug}`} aria-label={t("userSettings.back")}>
          <svg
            className={styles.back}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </Link>
        <h1 className={styles.title}>{t("userSettings.title")}</h1>
      </div>

      {platform.slug === "fluxer" && (
        <SelfHostedFluxerSection
          platform={platform}
          pricing={pricing}
          guilds={guilds}
          hasUnassignedActivePurchase={hasUnassignedActivePurchase}
          onServerApplied={onRefreshPurchases}
        />
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("userSettings.purchaseHistory")}</h2>
        {historyLoading ? (
          <p className={styles.empty}>{t("common.loading")}</p>
        ) : historyError ? (
          <p className={styles.error}>{t("userSettings.loadFailed")}</p>
        ) : purchases.length === 0 ? (
          <p className={styles.empty}>{t("userSettings.empty")}</p>
        ) : (
          <div className={styles.list}>
            {purchases.map((purchase) => (
              <div key={purchase.id} className={styles.row}>
                <GuildIcon
                  className={styles.guildIcon}
                  iconUrl={guildIconUrl(purchase, platform)}
                  name={purchase.guildName || purchase.guildId || "?"}
                />
                <div className={styles.rowBody}>
                  <span className={styles.guildName}>
                    {purchase.guildName || t("userSettings.unknownServer")}
                  </span>
                  <span className={styles.rowMeta}>
                    {planLabel(purchase)}
                    {" · "}
                    {formatDate(purchase.purchasedAt)}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.viewButton}
                  onClick={() => setSelected(purchase)}
                >
                  {t("userSettings.view")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("userSettings.supportTitle")}</h2>
        <p className={styles.supportText}>{t("userSettings.supportDesc")}</p>
        <a className={styles.supportLink} href={`mailto:${supportEmail}`}>
          {supportEmail}
        </a>
      </section>

      {selected && (
        <PurchaseDetailsModal
          purchase={selected}
          platform={platform}
          formatDate={formatDate}
          planLabel={planLabel(selected)}
          onClose={() => setSelected(null)}
        />
      )}

      {showThanks && <OraxPlusThanksModal onClose={onCloseThanks} />}
      {pageLoading && <Loading />}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function SelfHostedFluxerSection({
  platform,
  pricing,
  guilds,
  hasUnassignedActivePurchase,
  onServerApplied,
}: {
  platform: PlatformConfig;
  pricing: { monthly: string; lifetime: string };
  guilds: Guild[];
  hasUnassignedActivePurchase: boolean;
  onServerApplied: () => void;
}) {
  const { t, lang } = useLanguage();
  const [instance, setInstance] = useState<SelfHostedInstanceData | null>(null);
  const [oraxPlusActive, setOraxPlusActive] = useState<boolean>(false);
  const [oraxPlusSource, setOraxPlusSource] = useState<string | null>(null);
  const [hasVotedFluxerlist, setHasVotedFluxerlist] = useState<boolean>(false);
  const [originUrl, setOriginUrl] = useState<string>("");
  const [botToken, setBotToken] = useState<string>("");
  const [loadingInstance, setLoadingInstance] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [targetGuildId, setTargetGuildId] = useState<string>("");
  const [applyingServer, setApplyingServer] = useState<boolean>(false);
  const voteLabel = platform.vote
    ? getVoteLabel(lang, platform.vote.provider)
    : undefined;
  const voteSource =
    platform.vote?.provider === "fluxerlist" ? "fluxerlist_vote" : "topgg_vote";
  const showVoteButton = Boolean(
    voteLabel && (!oraxPlusActive || oraxPlusSource === voteSource),
  );
  const showMonthlyButton = !oraxPlusActive || oraxPlusSource === voteSource;
  const showLifetimeButton =
    !oraxPlusActive ||
    oraxPlusSource === voteSource ||
    oraxPlusSource === "stripe";

  useEffect(() => {
    if (!targetGuildId && guilds[0]?.id) {
      setTargetGuildId(guilds[0].id);
    }
  }, [guilds, targetGuildId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingInstance(true);
    platformApi<GetFluxerInstanceResponse>("get_fluxer_instance")
      .then((res) => {
        if (cancelled) return;
        if (res.result) {
          setOraxPlusActive(Boolean(res.oraxPlusActive));
          setOraxPlusSource(res.oraxPlusSource ?? null);
          setHasVotedFluxerlist(Boolean(res.hasVotedFluxerlist));
          setInstance(res.instance || null);
          setOriginUrl(res.instance?.originUrl || "");
          setBotToken("");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingInstance(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleVoteUnlock() {
    const res = await startOraxPlusVote(
      "0",
      platform,
      "dashboard",
      hasVotedFluxerlist,
    );
    if (res.activated) {
      setOraxPlusActive(true);
      setOraxPlusSource(voteSource);
      setHasVotedFluxerlist(true);
      onServerApplied();
    }
  }

  async function handleApplyToServer() {
    if (!targetGuildId) return;
    setApplyingServer(true);
    try {
      const res = await changeOraxPlusServer(targetGuildId);
      if (res.result) {
        notify.success(
          t("userSettings.unassignedAppliedTitle"),
          t("userSettings.unassignedAppliedDesc"),
        );
        onServerApplied();
      } else {
        notify.error(
          t("oraxPlus.transferFailedTitle"),
          res.message || t("oraxPlus.transferFailedDesc"),
        );
      }
    } catch {
      notify.error(
        t("oraxPlus.transferFailedTitle"),
        t("oraxPlus.transferFailedDesc"),
      );
    } finally {
      setApplyingServer(false);
    }
  }

  async function handleSave() {
    if (!originUrl.trim()) return;
    setSaving(true);
    try {
      const res = await platformApi<SetFluxerInstanceResponse>(
        "set_fluxer_instance",
        {
          originUrl: originUrl.trim(),
          botToken: botToken.trim() || undefined,
        },
      );
      if (res.result && res.instance) {
        setInstance(res.instance);
        setOriginUrl(res.instance.originUrl);
        setBotToken("");
        notify.success(
          t("userSettings.selfHostedSavedTitle"),
          t("userSettings.selfHostedSavedDesc"),
        );
      } else {
        notify.error(
          t("userSettings.selfHostedErrorTitle"),
          res.message || t("userSettings.loadFailed"),
        );
      }
    } catch {
      notify.error(
        t("userSettings.selfHostedErrorTitle"),
        t("userSettings.loadFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!instance) return;
    setDeleting(true);
    try {
      const res = await platformApi<DeleteFluxerInstanceResponse>(
        "delete_fluxer_instance",
      );
      if (res.result) {
        setInstance(null);
        setOriginUrl("");
        setBotToken("");
        notify.success(
          t("userSettings.selfHostedDeletedTitle"),
          t("userSettings.selfHostedDeletedDesc"),
        );
      } else {
        notify.error(
          t("userSettings.selfHostedErrorTitle"),
          res.message || t("userSettings.loadFailed"),
        );
      }
    } catch {
      notify.error(
        t("userSettings.selfHostedErrorTitle"),
        t("userSettings.loadFailed"),
      );
    } finally {
      setDeleting(false);
    }
  }

  function renderStatusBadge(inst: SelfHostedInstanceData) {
    if (inst.status === "running") {
      return (
        <span className={`${styles.statusBadge} ${styles.statusRunning}`}>
          ●{" "}
          {t("userSettings.selfHostedStatusRunning", {
            bot: inst.botUsername || "Orax",
          })}
        </span>
      );
    }
    if (inst.status === "paused_no_plus") {
      return (
        <span className={`${styles.statusBadge} ${styles.statusPaused}`}>
          ● {t("userSettings.selfHostedStatusPaused")}
        </span>
      );
    }
    return (
      <span className={`${styles.statusBadge} ${styles.statusError}`}>
        ● {inst.lastError || t("userSettings.selfHostedStatusError")}
      </span>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.statusRow} style={{ marginBottom: 6 }}>
        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
          {t("userSettings.selfHostedTitle")}
        </h2>
        {instance && renderStatusBadge(instance)}
      </div>
      <p className={styles.supportText}>{t("userSettings.selfHostedDesc")}</p>
      <div className={styles.instanceCard}>
        {loadingInstance ? (
          <p className={styles.empty}>{t("common.loading")}</p>
        ) : (
          <>
            {!oraxPlusActive && (
              <p className={styles.warningNote}>
                {t("userSettings.selfHostedPlusRequired")}
              </p>
            )}
            <OraxPlusPlanActions
              pricing={pricing}
              voteLabel={voteLabel}
              showVoteButton={showVoteButton}
              showMonthlyButton={showMonthlyButton}
              showLifetimeButton={showLifetimeButton}
              onVote={voteLabel ? handleVoteUnlock : undefined}
              onCheckout={(plan) =>
                startOraxPlusCheckout(
                  "0",
                  `/dashboard/${platform.slug}/settings`,
                  plan,
                  platform,
                )
              }
            />

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="self-hosted-origin">
                {t("userSettings.selfHostedOriginLabel")}
              </label>
              <input
                id="self-hosted-origin"
                type="url"
                className={styles.input}
                placeholder={t("userSettings.selfHostedOriginPlaceholder")}
                value={originUrl}
                onChange={(e) => setOriginUrl(e.target.value)}
                disabled={!oraxPlusActive || saving}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="self-hosted-token">
                {t("userSettings.selfHostedTokenLabel")}
              </label>
              <input
                id="self-hosted-token"
                type="password"
                className={styles.input}
                placeholder={
                  instance
                    ? t("userSettings.selfHostedTokenKeepPlaceholder")
                    : t("userSettings.selfHostedTokenPlaceholder")
                }
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                disabled={!oraxPlusActive || saving}
                autoComplete="new-password"
              />
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSave}
                disabled={
                  !oraxPlusActive ||
                  saving ||
                  !originUrl.trim() ||
                  (!instance && !botToken.trim())
                }
              >
                {saving
                  ? t("userSettings.selfHostedSaving")
                  : t("userSettings.selfHostedConnect")}
              </button>
              {instance && (
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDelete}
                  disabled={deleting || saving}
                >
                  {deleting
                    ? t("userSettings.selfHostedDeleting")
                    : t("userSettings.selfHostedDelete")}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {hasUnassignedActivePurchase && (
        <div className={styles.instanceCard} style={{ marginTop: 14 }}>
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>
              {t("userSettings.unassignedCardTitle")}
            </span>
            <p className={styles.supportText} style={{ margin: 0 }}>
              {t("userSettings.unassignedCardDesc")}
            </p>
          </div>
          {guilds.length > 0 && (
            <div className={styles.buttonRow}>
              <select
                className={styles.select}
                style={{ flex: 1, minWidth: 200 }}
                value={targetGuildId}
                onChange={(e) => setTargetGuildId(e.target.value)}
              >
                {guilds.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleApplyToServer}
                disabled={!targetGuildId || applyingServer}
              >
                {applyingServer
                  ? t("userSettings.unassignedApplying")
                  : t("userSettings.unassignedApplyButton")}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PurchaseDetailsModal({
  purchase,
  platform,
  formatDate,
  planLabel,
  onClose,
}: {
  purchase: Purchase;
  platform: PlatformConfig;
  formatDate: (value: string | null) => string;
  planLabel: string;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [onClose]);

  if (!mounted) return null;

  const na = t("userSettings.notAvailable");
  const status = purchase.active
    ? t("userSettings.statusActive")
    : t("userSettings.statusInactive");

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          type="button"
          aria-label={t("common.close")}
          onClick={onClose}
        >
          x
        </button>
        <div className={styles.modalHeader}>
          <GuildIcon
            className={styles.modalIcon}
            iconUrl={guildIconUrl(purchase, platform)}
            name={purchase.guildName || purchase.guildId || "?"}
          />
          <div>
            <h2 id="purchase-details-title" className={styles.modalTitle}>
              {purchase.guildName || t("userSettings.unknownServer")}
            </h2>
            <p className={styles.modalPlan}>
              {planLabel} · {status}
            </p>
          </div>
        </div>
        <dl className={styles.details}>
          <Detail label={t("userSettings.purchasedAt")} value={formatDate(purchase.purchasedAt)} />
          <Detail
            label={t("userSettings.expiresAt")}
            value={
              purchase.plan === "lifetime"
                ? t("userSettings.neverExpires")
                : formatDate(purchase.expiresAt)
            }
          />
          <Detail
            label={t("userSettings.guildId")}
            value={purchase.guildId || na}
          />
          {purchase.previousGuildId && (
            <Detail
              label={t("userSettings.previousGuildId")}
              value={purchase.previousGuildId}
            />
          )}
          <Detail label={t("userSettings.platform")} value={purchase.platform} />
          {purchase.stripe.customerId && (
            <Detail
              label={t("userSettings.stripeCustomer")}
              value={purchase.stripe.customerId}
            />
          )}
          {purchase.stripe.checkoutSessionId && (
            <Detail
              label={t("userSettings.checkoutSession")}
              value={purchase.stripe.checkoutSessionId}
            />
          )}
          {purchase.stripe.latestInvoice && (
            <Detail
              label={t("userSettings.invoice")}
              value={purchase.stripe.latestInvoice}
            />
          )}
          {purchase.stripe.paymentIntent && (
            <Detail
              label={t("userSettings.paymentIntent")}
              value={purchase.stripe.paymentIntent}
            />
          )}
          {purchase.sourceRef && (
            <Detail label={t("userSettings.reference")} value={purchase.sourceRef} />
          )}
        </dl>
      </section>
    </div>,
    document.body,
  );
}
