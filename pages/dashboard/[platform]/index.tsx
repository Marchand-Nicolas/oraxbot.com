import type { GetServerSideProps } from "next";
import styles from "../../../styles/Dashboard.module.css";
import type {
  DiscordUser,
  Guild,
  GuildData,
  GuildSettings,
} from "../../../types";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { renderWithRoot } from "../../../utils/reactRoot";
import popup from "../../../utils/popup";
import meteor from "../../../public/icons/meteor.svg";
import CreateGroupMenu from "../../../components/dashboard/CreateGroupMenu";
import Settings from "../../../components/dashboard/Settings";
import UserMenu from "../../../components/dashboard/UserMenu";
import Loading from "../../../components/Loading";
import GuildIcon from "../../../components/GuildIcon";
import HiddenMenu from "../../../components/ui/hiddenMenu";
import { notify } from "../../../components/ui/NotificationSystem";
import ActionModal from "../../../components/ui/ActionModal";
import OraxPlusApplyModal from "../../../components/ui/OraxPlusApplyModal";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import {
  startOraxPlusCheckout as startCheckout,
  startOraxPlusVote as startVote,
  changeOraxPlusServer,
} from "../../../utils/oraxPlus";
import {
  setActiveTokenCookie,
  setAuthRedirectTarget,
} from "../../../utils/apiClient";
import { getPlatform, type PlatformConfig } from "../../../utils/platforms";
import { platformApi } from "../../../utils/platformApi";
import { usePlatformAuth } from "../../../hooks/usePlatformAuth";
import {
  getLanguageByIndex,
  setGlobalLanguage,
  getVoteLabel,
  t as tt,
} from "../../../utils/i18n";
import { LanguageProvider } from "../../../hooks/useLanguage";
import {
  getOraxPlusPricing,
  getPricingRegion,
  type PricingRegion,
} from "../../../utils/pricing";

interface PlatformDashboardPageProps {
  pricingRegion: PricingRegion;
}

export const getServerSideProps: GetServerSideProps<
  PlatformDashboardPageProps
> = async ({ req }) => ({
  props: {
    pricingRegion: getPricingRegion(req.headers["x-vercel-ip-country"]),
  },
});

function formatRemainingPlanTime(expiresAt?: string | null) {
  if (!expiresAt) return null;

  const expiresAtTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtTime)) return null;

  const remainingMs = expiresAtTime - Date.now();
  if (remainingMs <= 0) return tt("time.lessThanMinute");

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (remainingMs >= day) {
    const days = Math.ceil(remainingMs / day);
    return days === 1
      ? tt("time.oneDay", { count: days })
      : tt("time.multipleDays", { count: days });
  }

  if (remainingMs >= hour) {
    const hours = Math.ceil(remainingMs / hour);
    return hours === 1
      ? tt("time.oneHour", { count: hours })
      : tt("time.multipleHours", { count: hours });
  }

  const minutes = Math.ceil(remainingMs / minute);
  return minutes === 1
    ? tt("time.oneMinute", { count: minutes })
    : tt("time.multipleMinutes", { count: minutes });
}

/**
 * Thin Next.js page wrapper that resolves the platform from the URL and
 * redirects to the login hub when the slug is unknown.
 */
export default function PlatformDashboardPage({
  pricingRegion,
}: PlatformDashboardPageProps) {
  const router = useRouter();
  const platformSlug = router.query.platform;
  const platform =
    typeof platformSlug === "string" ? getPlatform(platformSlug) : undefined;

  useEffect(() => {
    if (!router.isReady) return;
    if (!platform) {
      window.location.href = "/dashboard";
    }
  }, [router.isReady, platform]);

  if (!platform) {
    return <Loading />;
  }

  return (
    <Dashboard
      key={platform.slug}
      platform={platform}
      pricingRegion={pricingRegion}
    />
  );
}

function Dashboard({
  platform,
  pricingRegion,
}: {
  platform: PlatformConfig;
  pricingRegion: PricingRegion;
}) {
  const { user, guilds, loading } = usePlatformAuth(platform);

  const [activeUser, setActiveUser] = useState<DiscordUser | undefined>(
    undefined,
  );
  const [activeGuilds, setActiveGuilds] = useState<Guild[]>([]);
  const [guildDatas, setGuildDatas] = useState<GuildData>({});
  const [batchGuildDatas, setBatchGuildDatas] = useState<
    Record<string, GuildData>
  >({});
  const [settings, setSettings] = useState<GuildSettings>({
    lang: 0,
    public: false,
    public_link: "",
    default: true,
  });
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [refreshGuildDatas, setRefreshGuildDatas] = useState(false);
  const [isPollingOraxPlusVote, setIsPollingOraxPlusVote] = useState(false);
  const [showGroupLimitModal, setShowGroupLimitModal] = useState(false);
  const [showOraxPlusApply, setShowOraxPlusApply] = useState(false);
  const [purchaseGuildId, setPurchaseGuildId] = useState<string>("");
  const [isWaitingForActivation, setIsWaitingForActivation] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [voteBaselineExpiresAt, setVoteBaselineExpiresAt] = useState<
    string | null
  >(null);
  const [lastLoadedGuildId, setLastLoadedGuildId] = useState("");
  const votePollAttemptsRef = useRef(0);
  const activationPollAttemptsRef = useRef(0);

  // Mirror the auth hook's loaded data into local state so the rest of the
  // component (originally written with setUser/setGuilds calls) keeps working.
  useEffect(() => {
    setActiveUser(user);
  }, [user]);
  useEffect(() => {
    setActiveGuilds(guilds);
  }, [guilds]);

  // Configure the shared API client to use this platform's token cookie and
  // redirect target. Existing components that read getCookie("token") also
  // work because the auth hook mirrors the token into the shared `token`
  // cookie via persistPlatformToken().
  useEffect(() => {
    setActiveTokenCookie(platform.cookieName);
    setAuthRedirectTarget(`/dashboard/${platform.slug}`);
  }, [platform]);

  useEffect(() => {
    if (activeGuilds.length === 0) return;

    platformApi<{ result?: boolean; servers?: GuildData[] }>(
      "get_servers_data_batch",
      {
        guildIds: activeGuilds.map((g) => g.id),
      },
    )
      .then((res) => {
        if (res.result && res.servers) {
          const serversById = res.servers.reduce<Record<string, GuildData>>(
            (acc, server) => {
              if (typeof server.guildId === "string")
                acc[server.guildId] = server;
              return acc;
            },
            {},
          );
          setBatchGuildDatas(serversById);
        }
      })
      .catch((error) => {
        console.error("Error fetching batch server data:", error);
      });
  }, [activeGuilds, platform]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const oraxPlusResult = params.get("orax_plus");
    if (oraxPlusResult === "success") {
      const guildFromUrl = params.get("guild");
      if (guildFromUrl) {
        setPurchaseGuildId(guildFromUrl);
        setIsWaitingForActivation(true);
      }
      const cleaned = new URLSearchParams(window.location.search);
      cleaned.delete("orax_plus");
      const search = cleaned.toString();
      const newUrl =
        window.location.pathname +
        (search ? `?${search}` : "") +
        window.location.hash;
      window.history.replaceState({}, "", newUrl);
    } else if (oraxPlusResult === "cancelled") {
      notify.error(tt("notifications.checkoutCancelledTitle"), tt("notifications.checkoutCancelledDesc"));
    }
  }, []);

  function endImgLoading(guildId: string) {
    const guildElement = document.getElementById("guild_" + guildId);
    guildElement?.classList.remove("loading");
  }

  const urlGuildId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("guild")
      : "";
  const guildId =
    urlGuildId || activeGuilds.find((g) => platform.isAdmin(g))?.id || "";
  let guild: Guild | undefined = activeGuilds.find(
    (guild) => guild.id === guildId,
  );

  if (!guild) {
    if (activeGuilds.length > 0) {
      guild = activeGuilds.find((guild) => platform.isAdmin(guild));
    }
    if (!guild)
      guild = {
        id: "",
        name: "",
        icon: "",
        owner: false,
        permissions: 2147483647,
        permissions_new: "4398046511103",
      };
  }

  const purchaseGuild =
    activeGuilds.find((g) => g.id === purchaseGuildId) ?? undefined;

  const ownedGroupsCount = guildDatas.ownedGroups?.length || 0;
  const oraxPlus = guildDatas.oraxPlus;
  const groupLimit = oraxPlus?.limits?.groupsPerGuild || 2;
  const channelLimit = oraxPlus?.limits?.channelsPerGroup || 5;
  const voteProvider = platform.vote;
  const lang = getLanguageByIndex(settings.lang ?? 0);
  const pricing = getOraxPlusPricing(pricingRegion, lang);
  setGlobalLanguage(lang);
  const voteLabelText = voteProvider
    ? getVoteLabel(lang, voteProvider.provider)
    : "";
  const voteSource =
    voteProvider?.provider === "fluxerlist" ? "fluxerlist_vote" : "topgg_vote";
  const votePlanExpiresIn =
    oraxPlus?.active && oraxPlus.entitlement?.source === voteSource
      ? formatRemainingPlanTime(oraxPlus.entitlement.expiresAt)
      : null;
  const source = oraxPlus?.entitlement?.source;
  const showVoteButton = voteProvider && (!oraxPlus?.active || source === voteSource);
  const showMonthlyButton = !oraxPlus?.active || source === voteSource;
  const showLifetimeButton =
    !oraxPlus?.active || source === voteSource || source === "stripe";
  const isAtGroupLimit = ownedGroupsCount >= groupLimit;

  const startOraxPlusCheckout = (plan?: "monthly" | "lifetime") =>
    startCheckout(guildId as string, undefined, plan);

  async function startOraxPlusVote() {
    const result = await startVote(guildId as string, platform);

    if (result.activated) {
      setRefreshGuildDatas(true);
      return;
    }

    if (result.voteOpened) {
      setVoteBaselineExpiresAt(oraxPlus?.entitlement?.expiresAt || null);
      setIsPollingOraxPlusVote(true);
    }
  }

  useEffect(() => {
    if (!isPollingOraxPlusVote || !guildId) return;

    votePollAttemptsRef.current = 0;
    setRefreshGuildDatas(true);

    const intervalId = window.setInterval(() => {
      votePollAttemptsRef.current += 1;
      setRefreshGuildDatas(true);

      if (votePollAttemptsRef.current >= 24) {
        window.clearInterval(intervalId);
        setIsPollingOraxPlusVote(false);
        setVoteBaselineExpiresAt(null);
        notify.error(
          tt("oraxPlus.voteNotDetectedTitle"),
          tt("oraxPlus.voteNotDetectedDesc", { context: tt("nav.support").toLowerCase() }),
          { duration: 8000 },
        );
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [guildId, isPollingOraxPlusVote]);

  useEffect(() => {
    if (!isPollingOraxPlusVote) return;
    if (!oraxPlus?.active || oraxPlus.entitlement?.source !== "topgg_vote") {
      return;
    }

    const currentExpiresAt = oraxPlus.entitlement.expiresAt || null;
    const currentExpiresAtTime = currentExpiresAt
      ? new Date(currentExpiresAt).getTime()
      : 0;
    const baselineExpiresAtTime = voteBaselineExpiresAt
      ? new Date(voteBaselineExpiresAt).getTime()
      : 0;

    if (
      !voteBaselineExpiresAt ||
      (currentExpiresAtTime && currentExpiresAtTime > baselineExpiresAtTime)
    ) {
      setIsPollingOraxPlusVote(false);
      setVoteBaselineExpiresAt(null);
      notify.success(
        tt("oraxPlus.activatedTitle"),
        voteBaselineExpiresAt
          ? tt("oraxPlus.activatedExtendedDesc")
          : tt("oraxPlus.activatedNewDesc"),
      );
    }
  }, [
    isPollingOraxPlusVote,
    oraxPlus?.active,
    oraxPlus?.entitlement?.source,
    oraxPlus?.entitlement?.expiresAt,
    voteBaselineExpiresAt,
  ]);

  useEffect(() => {
    if (!isWaitingForActivation || !purchaseGuildId) return;
    // Wait until the dashboard has resolved the active guild list — on the
    // first render after returning from Stripe, `guild?.id` is still the
    // empty-string fallback because `activeGuilds` hasn't been populated
    // by `usePlatformAuth` yet.
    if (!guild?.id) return;
    if (guild.id !== purchaseGuildId) {
      setIsWaitingForActivation(false);
      return;
    }

    activationPollAttemptsRef.current = 0;
    setRefreshGuildDatas(true);

    const intervalId = window.setInterval(() => {
      activationPollAttemptsRef.current += 1;
      setRefreshGuildDatas(true);

      if (activationPollAttemptsRef.current >= 24) {
        window.clearInterval(intervalId);
        setIsWaitingForActivation(false);
        notify.error(
          tt("oraxPlus.activationTimeoutTitle"),
          tt("oraxPlus.activationTimeoutDesc"),
          { duration: 8000 },
        );
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [guild?.id, isWaitingForActivation, purchaseGuildId]);

  useEffect(() => {
    if (!isWaitingForActivation) return;
    if (!guild?.id) return;
    if (guild.id !== purchaseGuildId) return;

    const status = guildDatas.oraxPlus;
    if (!status?.active) return;
    const source = status.entitlement?.source;
    if (source !== "stripe" && source !== "stripe_lifetime") return;

    setIsWaitingForActivation(false);
    setShowOraxPlusApply(true);
  }, [guild?.id, isWaitingForActivation, purchaseGuildId, guildDatas.oraxPlus]);

  async function handleApplyConfirm(selectedGuildId: string) {
    if (selectedGuildId === purchaseGuildId) {
      setShowOraxPlusApply(false);
      return;
    }

    setApplySubmitting(true);
    try {
      const res = await changeOraxPlusServer(selectedGuildId);
      if (res?.result) {
        notify.success(
          tt("oraxPlus.transferTitle"),
          tt("oraxPlus.transferDesc"),
        );
        setShowOraxPlusApply(false);
        setPurchaseGuildId("");
        setBatchGuildDatas({});
      } else {
        notify.error(
          tt("oraxPlus.transferFailedTitle"),
          res?.message || tt("oraxPlus.transferFailedDesc"),
        );
      }
    } catch (error) {
      notify.error(
        tt("oraxPlus.transferFailedTitle"),
        error instanceof Error
          ? error.message
          : tt("oraxPlus.transferFailedDesc"),
      );
    } finally {
      setApplySubmitting(false);
    }
  }

  function handleApplyClose() {
    if (applySubmitting) return;
    setShowOraxPlusApply(false);
  }

  useEffect(() => {
    if (!guild) return;
    if (!guild.id) return;
    if (refreshGuildDatas) {
      setBatchGuildDatas((previous) => {
        const next = { ...previous };
        delete next[guild!.id];
        return next;
      });
      setRefreshGuildDatas(false);
      return;
    }
    if (guild.id !== lastLoadedGuildId) {
      setGuildDatas({});
      setSettings({});
    }

    if (batchGuildDatas[guild.id]) {
      const serverData = batchGuildDatas[guild.id];
      setGuildDatas(serverData);
      if (serverData.settings) setSettings(serverData.settings);
      setLastLoadedGuildId(guild.id);
    } else {
      platformApi<{ result?: boolean; settings?: GuildSettings } & GuildData>(
        "get_server_data",
        {
          guildId: guild.id,
        },
      )
        .then((res) => {
          if (res.result) {
            setGuildDatas(res);
            if (res.settings) setSettings(res.settings);
            setLastLoadedGuildId(guild.id);
          } else {
            setGuildDatas({});
            setSettings({});
            notify.error(
              tt("notifications.serverDataErrorTitle"),
              tt("notifications.serverDataErrorDesc"),
              { duration: 8000 },
            );
          }
        })
        .catch(() => {
          setGuildDatas({});
          setSettings({});
          notify.error(
            tt("notifications.serverDataErrorTitle"),
            tt("notifications.serverDataErrorDesc"),
            { duration: 8000 },
          );
        });
    }
  }, [guild, paymentProgress, refreshGuildDatas, batchGuildDatas, platform]);

  const backgroundImage = platform.getGuildBackgroundUrl(guild);

  return (
    <LanguageProvider lang={lang}>
      {activeUser && <UserMenu user={activeUser} platform={platform} />}
      <div
        style={{
          backgroundImage: backgroundImage
            ? `url('${backgroundImage}')`
            : undefined,
        }}
        className={styles.background}
      />
      <nav className={styles.navbar}>
        {activeGuilds.length > 0
          ? activeGuilds
              .sort((a, b) => {
                const aHasBot = batchGuildDatas[a.id]?.bot ? 1 : 0;
                const bHasBot = batchGuildDatas[b.id]?.bot ? 1 : 0;
                return bHasBot - aHasBot;
              })
              .map((g) =>
                platform.isAdmin(g) ? (
                  <Link
                    key={"nav_guild_" + g.id}
                    href={`/dashboard/${platform.slug}?guild=${g.id}`}
                  >
                    <div
                      id={"guild_" + g.id}
                      className={[
                        styles.navGuild,
                        !document.getElementById("guild_" + g.id) && "loading",
                        guild?.id === g.id ? styles.selected : null,
                        (batchGuildDatas[g.id]?.ownedGroups?.length ?? 0) > 0
                          ? styles.hasGroups
                          : null,
                      ].join(" ")}
                    >
                      <GuildIcon
                        className={styles.guildIcon}
                        iconUrl={platform.getGuildIconUrl(g)}
                        name={g.name}
                        onLoad={() => endImgLoading(g.id)}
                      />
                    </div>
                  </Link>
                ) : null,
              )
          : [...Array(3)].map((o, index) => (
              <div key={"nav_guild_" + index} className={styles.navGuild}>
                <div
                  className={[styles.guildIcon, styles.placeHolder].join(" ")}
                />
              </div>
            ))}
      </nav>
      <div className={styles.page}>
        <h1 className={styles.title}>{guild.name}</h1>
        <div className={styles.actionsContainer}>
          <a href={platform.supportUrl} target="_blank" rel="noreferrer">
            <button className={styles.button}>
              {tt("nav.support")}{" "}
              <strong>
<svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796a3.765 3.765 0 00-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 01-1.388.88m2.268-2.268l4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l-3.448-4.138m3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-1.388-.88 3.737 3.737 0 01-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 01-1.652-1.306 9.027 9.027 0 01-1.306-1.652m0 0l4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976a3.765 3.765 0 010-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 011.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 00-1.652 1.306A9.025 9.025 0 004.33 7.288"
                  />
                </svg>
              </strong>
            </button>
          </a>
          {guildDatas.bot ? (
            <>
              <a
                href="https://ko-fi.com/nicolasmarchand"
                target="_blank"
                rel="noreferrer"
              >
                <button className={styles.button}>
                  {tt("nav.tip")} ❤️{" "}
                  <strong>
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                      />
                    </svg>
                  </strong>
                </button>
              </a>
              <button
                onClick={() => {
                  if (isAtGroupLimit) {
                    setShowGroupLimitModal(true);
                    return;
                  }
                  renderWithRoot(
                    <CreateGroupMenu
                      guildId={guildId}
                      ownedGroupsCount={ownedGroupsCount}
                      oraxPlus={oraxPlus}
                      platform={platform}
                      pricing={pricing}
                      onStartOraxPlusVote={startOraxPlusVote}
                      onStartOraxPlusCheckout={startOraxPlusCheckout}
                      setRefreshGuildDatas={setRefreshGuildDatas}
                    />,
                    document.getElementById("menu"),
                  );
                }}
                className={styles.button}
              >
                {tt("nav.createGroup")}
                <strong>
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25"
                    />
                  </svg>
                </strong>
              </button>
              <Link href="/explore" target="_blank" rel="noreferrer">
                <button className={styles.button}>
                  {tt("nav.exploreGroups")}
                  <strong>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                      />
                    </svg>
                  </strong>
                </button>
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                const inviteUrl = platform.getInviteUrl(guild.id);
                if (!inviteUrl) return;
                popup(tt("nav.inviteBotWarningTitle"), tt("nav.inviteBotWarningBody"), "warning", {
                  icon: meteor,
                  action: function () {
                    window.open(inviteUrl);
                  },
                });
              }}
              className={styles.button}
            >
              {platform.addBotLabel}
              <strong>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </strong>
            </button>
          )}
        </div>
        {guildDatas.bot ? (
          <>
            <br></br>
            <section className={styles.oraxPlusPanel}>
              <div>
                <span className={styles.planBadge}>
                  {oraxPlus?.active ? tt("oraxPlus.badgeActive") : tt("oraxPlus.badgeFree")}
                </span>
                <h2>{tt("oraxPlus.title")}</h2>
                <p>
                  {oraxPlus?.active
                    ? tt("oraxPlus.activeDesc")
                    : voteProvider
                      ? tt("oraxPlus.freeDescVote", {
                          provider:
                            voteProvider.provider === "fluxerlist"
                              ? "Fluxerlist"
                              : "Top.gg",
                        })
                      : tt("oraxPlus.freeDescNoVote")}
                </p>
                {votePlanExpiresIn && (
                  <p className={styles.planRenewalNote}>
                    {tt("oraxPlus.voteExpiresIn", { time: votePlanExpiresIn })}
                  </p>
                )}
              </div>
              <div className={styles.planStats}>
                <div>
                  <strong>
                    {ownedGroupsCount}/{groupLimit}
                  </strong>
                  <span>{tt("oraxPlus.ownedGroups")}</span>
                </div>
                <div>
                  <strong>{channelLimit}</strong>
                  <span>{tt("oraxPlus.channelsPerGroup")}</span>
                </div>
              </div>
              {(showVoteButton || showMonthlyButton || showLifetimeButton) && (
                <div className={styles.planActions}>
                  {showVoteButton && (
                    <button
                      className={styles.secondaryButton}
                      onClick={startOraxPlusVote}
                    >
                      {voteLabelText}
                    </button>
                  )}
                  {showMonthlyButton && (
                    <button
                      className={styles.primaryButton}
                      onClick={() => startOraxPlusCheckout("monthly")}
                    >
                      {tt("oraxPlus.subscribe", { price: pricing.monthly })}
                    </button>
                  )}
                  {showLifetimeButton && (
                    <button
                      className={styles.primaryButton}
                      onClick={() => startOraxPlusCheckout("lifetime")}
                    >
                      {tt("oraxPlus.lifetime", { price: pricing.lifetime })}
                    </button>
                  )}
                </div>
              )}
              <p className={styles.planFootnote}>
                {tt("oraxPlus.footnotePrefix")}
                <a href="mailto:support@oraxbot.com">{tt("oraxPlus.footnoteLink")}</a>{" "}
                {tt("oraxPlus.footnoteSuffix")}
              </p>
            </section>
            <ErrorBoundary>
              {guildDatas.ownedGroups && guildDatas.ownedGroups.length ? (
                <section className={styles.groupContainer}>
                  <h2>📺 {tt("groups.ownedTitle")}</h2>
                  <div className="line wrap gap-1">
                    {guildDatas.ownedGroups?.map((group) => (
                      <Link
                        key={"ownedGroup_" + group.id}
                        href={`/dashboard/${platform.slug}/ownedgroup/${group.id}?guild=${guild.id}&icon=${guild.icon}&groupName=${group.name}`}
                      >
                        <div className={styles.group}>{group.name}</div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : (
                <section className={styles.emptyGroupContainer}>
                  <h2>
                    {tt("groups.emptyTitle")}{" "}
                    {tt("groups.emptyDescPrefix")}
                    <Link className="underline" href="/explore">
                      {tt("groups.emptyDescLink")}
                    </Link>
                    {tt("groups.emptyDescSuffix")}
                  </h2>
                </section>
              )}
            </ErrorBoundary>
            <ErrorBoundary>
              <Settings
                key={"settingsGuild_" + guildId}
                guild={guild}
                guildId={guildId}
                settings={settings}
                setSettings={setSettings}
              />
            </ErrorBoundary>
            <HiddenMenu title={`🚫 ${tt("serviceLimits.title")}`}>
              <section className={styles.section}>
                <p className="hint">{tt("serviceLimits.desc")}</p>
                <div className="line wrap">
                  <p>
                    {tt("serviceLimits.ownedGroupsProgress", {
                      owned: ownedGroupsCount,
                      limit: groupLimit,
                    })}
                  </p>
                  <div className={[styles.progress, "progress"].join(" ")}>
                    <div
                      className="shrinker"
                      style={{
                        width:
                          Math.min((ownedGroupsCount / groupLimit) * 100, 100) +
                          "%",
                      }}
                    />
                  </div>
                </div>
                {guildDatas.ownedGroups?.map((group) => (
                  <div key={"group_" + group.id} className="line wrap">
                    <p>
                      {tt("serviceLimits.channelsProgress", {
                        name: group.name,
                        count: group.linkedChannels.length || 0,
                        limit: channelLimit,
                      })}
                    </p>
                    <div className={[styles.progress, "progress"].join(" ")}>
                      <div
                        className="shrinker"
                        style={{
                          width:
                            (Math.min(
                              (group.linkedChannels.length / channelLimit) *
                                100,
                              100,
                            ) || 0) + "%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </section>
            </HiddenMenu>
          </>
        ) : null}
        <div id="container" key={guild.id + "_" + paymentProgress}></div>
        <br></br>
      </div>
      {showGroupLimitModal && (
        <ActionModal
          title={tt("oraxPlus.groupLimitTitle")}
          description={
            <p>
              {voteProvider
                ? tt("oraxPlus.groupLimitDesc", { vote: voteLabelText })
                : tt("oraxPlus.groupLimitDescNoVote").trim()}
            </p>
          }
          actions={[
            ...(voteProvider
              ? [
                  {
                    label: voteLabelText,
                    variant: "secondary" as const,
                    onClick: () => {
                      setShowGroupLimitModal(false);
                      startOraxPlusVote();
                    },
                  },
                ]
              : []),
            {
              label: tt("oraxPlus.subscribe", { price: pricing.monthly }),
              variant: "primary" as const,
              onClick: () => {
                setShowGroupLimitModal(false);
                startOraxPlusCheckout("monthly");
              },
            },
            {
              label: tt("oraxPlus.lifetime", { price: pricing.lifetime }),
              variant: "primary" as const,
              onClick: () => {
                setShowGroupLimitModal(false);
                startOraxPlusCheckout("lifetime");
              },
            },
          ]}
          onClose={() => setShowGroupLimitModal(false)}
        />
      )}
      {showOraxPlusApply && purchaseGuild && (
        <OraxPlusApplyModal
          purchaseGuild={purchaseGuild}
          adminGuilds={activeGuilds}
          platform={platform}
          submitting={applySubmitting}
          onConfirm={handleApplyConfirm}
          onClose={handleApplyClose}
        />
      )}
      {loading && <Loading />}
    </LanguageProvider>
  );
}
