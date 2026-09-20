import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../../../styles/dashboard/UserSettings.module.css";
import Loading from "../../../components/Loading";
import UserMenu from "../../../components/dashboard/UserMenu";
import GuildIcon from "../../../components/GuildIcon";
import OraxPlusThanksModal from "../../../components/ui/OraxPlusThanksModal";
import { LanguageProvider, useLanguage } from "../../../hooks/useLanguage";
import { usePlatformAuth } from "../../../hooks/usePlatformAuth";
import {
  setActiveTokenCookie,
  setAuthRedirectTarget,
} from "../../../utils/apiClient";
import { getPlatform } from "../../../utils/platforms";
import { platformApi } from "../../../utils/platformApi";
import { setGlobalLanguage, type LanguageCode } from "../../../utils/i18n";
import type { PlatformConfig } from "../../../utils/platforms/types";

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

export default function UserSettingsPage() {
  const router = useRouter();
  const platformSlug = router.query.platform;
  const platform =
    typeof platformSlug === "string" ? getPlatform(platformSlug) : undefined;

  useEffect(() => {
    if (!router.isReady) return;
    if (!platform) window.location.href = "/dashboard";
  }, [router.isReady, platform]);

  if (!platform) return <Loading />;

  return <UserSettings platform={platform} />;
}

function UserSettings({ platform }: { platform: PlatformConfig }) {
  const { user, loading } = usePlatformAuth(platform);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [supportEmail, setSupportEmail] = useState("support@oraxbot.com");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

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
  }, [platform.slug]);

  return (
    <LanguageProvider lang="en">
      {user && <UserMenu user={user} platform={platform} />}
      <UserSettingsContent
        platform={platform}
        purchases={purchases}
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
  purchases,
  supportEmail,
  historyLoading,
  historyError,
  pageLoading,
  showThanks,
  onCloseThanks,
}: {
  platform: PlatformConfig;
  purchases: Purchase[];
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
