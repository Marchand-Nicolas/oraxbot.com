import type { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import styles from "../../styles/Join.module.css";
import dashboardStyles from "../../styles/Dashboard.module.css";
import { getCookie } from "../../utils/cookies";
import Link from "next/link";
import { useRouter } from "next/router";
import config from "../../utils/config.json";
import popup from "../../utils/popup";
import meteor from "../../public/icons/meteor.svg";
import OraxPlusPaywallModal from "../../components/ui/OraxPlusPaywallModal";
import SearchableList from "../../components/ui/SearchableList";
import BackLink from "../../components/ui/BackLink";
import UserMenu from "../../components/dashboard/UserMenu";
import ChannelIcon from "../../components/ui/icons/ChannelIcon";
import GuildIcon from "../../components/GuildIcon";
import {
  openTopggVote,
  startOraxPlusCheckout,
  startOraxPlusVote,
  trackOraxPlusEvent,
} from "../../utils/oraxPlus";
import type { Channel, DiscordGuild, DiscordUser } from "../../types";
import { voteLabel } from "../../utils/i18n";
import {
  getOraxPlusPricing,
  getPricingRegion,
  type PricingRegion,
} from "../../utils/pricing";
import {
  getPlatform,
  platformList,
  type PlatformConfig,
} from "../../utils/platforms";
import {
  fetchPlatformGuilds,
  fetchPlatformUser,
} from "../../utils/platforms/oauth";

interface ChannelLimitData {
  current: number;
  limit: number;
  maxLimit: number;
  groupOwnerId: string;
}

interface JoinGroupProps {
  pricingRegion: PricingRegion;
}

export const getServerSideProps: GetServerSideProps<JoinGroupProps> = async ({
  req,
}) => ({
  props: {
    pricingRegion: getPricingRegion(req.headers["x-vercel-ip-country"]),
  },
});

function getPlatformToken(platform: PlatformConfig): string | null {
  const token = getCookie(platform.cookieName);
  return token && token !== "undefined" ? token : null;
}

export default function JoinGroup({ pricingRegion }: JoinGroupProps) {
  const router = useRouter();
  const pricing = getOraxPlusPricing(pricingRegion, "en");
  const [platformSlug, setPlatformSlug] = useState<string | null>(null);
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loadingGuilds, setLoadingGuilds] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [group, setGroup] = useState<Record<string, unknown>>({});
  const [channels, setChannels] = useState<{ result?: Channel[] }>({});
  const [joiningChannelId, setJoiningChannelId] = useState<string | null>(
    null,
  );
  const [showChannelLimitModal, setShowChannelLimitModal] = useState(false);
  const [channelLimitData, setChannelLimitData] =
    useState<ChannelLimitData | null>(null);

  const { linkId } = router.query;
  const groupLinkId = typeof linkId === "string" ? linkId : undefined;
  const guildId =
    typeof router.query.guild === "string" ? router.query.guild : "";

  const platform = platformSlug ? getPlatform(platformSlug) : undefined;
  const voteProvider = platform?.vote?.provider || "topgg";

  const selectedGuild = guilds.find((guild) => guild.id === guildId);
  let guild = selectedGuild;

  if (!guild) {
    if (platform && guilds.length > 0) {
      guild = guilds.find((guild) => platform.isAdmin(guild));
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

  function endImgLoading(guildId: string) {
    const guildElement = document.getElementById("guild_" + guildId);
    guildElement?.classList.remove("loading");
  }

  useEffect(() => {
    if (!router.isReady || !linkId) return;
    fetch(`${config.apiV2}preview_group`, {
      method: "POST",
      body: JSON.stringify({ linkId }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setGroup(res);
      });
    // Default to the platform the user just logged in with (?platform=), else
    // the first one they are already logged into, else Discord.
    const requestedPlatform = getPlatform(router.query.platform);
    const activePlatform =
      requestedPlatform && getPlatformToken(requestedPlatform)
        ? requestedPlatform
        : platformList.find((p) => getPlatformToken(p));
    setPlatformSlug((current) => current ?? (activePlatform?.slug || "discord"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, linkId]);

  // Back from Stripe after unlocking Orax Plus for the group owner.
  const checkoutResult = router.query.orax_plus;
  useEffect(() => {
    if (!router.isReady) return;
    const result = checkoutResult;
    if (result !== "success" && result !== "cancelled") return;
    if (result === "success") {
      popup(
        "Thank you!",
        "Orax Plus is being activated on the server that owns this group. Select your channel again in a few seconds to join.",
        "success",
      );
    } else {
      popup(
        "Checkout cancelled",
        "No payment was made. You can try again whenever you like.",
        "warning",
      );
    }
    const query = { ...router.query };
    delete query.orax_plus;
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, checkoutResult]);

  useEffect(() => {
    if (!platform) return;
    const token = getPlatformToken(platform);
    if (!token) {
      setLoggedIn(false);
      setLoadingGuilds(false);
      setGuilds([]);
      setUser(null);
      return;
    }
    setLoggedIn(true);
    setLoadingGuilds(true);
    loadPage(platform, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformSlug]);

  useEffect(() => {
    setChannels({});
    if (!platform || !loggedIn || !guildId) {
      setLoadingChannels(false);
      return;
    }
    setLoadingChannels(true);
    fetch(`${config.apiV2}get_guild_channels`, {
      method: "POST",
      body: JSON.stringify({ guildId, platform: platform.slug }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res: { result?: Channel[] }) => {
        setChannels(res);
        setLoadingChannels(false);
      })
      .catch(() => setLoadingChannels(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformSlug, guildId, loggedIn]);

  // Platforms send retry_after in seconds; setTimeout takes milliseconds.
  function retryLoadPageAfter(
    platform: PlatformConfig,
    token: string,
    retryAfterSeconds: number,
  ) {
    setTimeout(() => {
      loadPage(platform, token);
    }, retryAfterSeconds * 1000 + 50);
  }

  async function loadPage(platform: PlatformConfig, token: string) {
    const userDatas = await fetchPlatformUser(platform, token);
    const userRetryAfter = (userDatas as { retry_after?: number } | null)
      ?.retry_after;
    if (userRetryAfter) {
      retryLoadPageAfter(platform, token, userRetryAfter);
      return;
    }
    if (!userDatas || !userDatas.id) {
      // Token is no longer valid — fall back to the login view.
      setLoggedIn(false);
      setLoadingGuilds(false);
      setGuilds([]);
      setUser(null);
      return;
    }
    setUser(userDatas);
    const guildsRes = (await fetchPlatformGuilds(platform, token)) as
      | DiscordGuild[]
      | { retry_after?: number };
    if (!Array.isArray(guildsRes) && guildsRes.retry_after) {
      retryLoadPageAfter(platform, token, guildsRes.retry_after);
      return;
    }
    if (Array.isArray(guildsRes) && guildsRes.length > 0)
      setGuilds(guildsRes);
    setLoadingGuilds(false);
  }

  function handlePlatformChange(slug: string) {
    if (slug === platformSlug) return;
    setPlatformSlug(slug);
    setChannels({});
    setGuilds([]);
    setUser(null);
    if (guildId) router.replace(`/join/${linkId}`);
  }

  function handleLogin(loginPlatform: PlatformConfig) {
    if (!linkId) return;
    const target = `/join/${linkId}?platform=${loginPlatform.slug}`;
    const sep = loginPlatform.authorizeUrl.includes("?") ? "&" : "?";
    window.location.href = `${loginPlatform.authorizeUrl}${sep}state=${encodeURIComponent(
      target,
    )}`;
  }

  // Same as the site header: switch right away when already logged into the
  // other platform, otherwise go through its login.
  function handleSwitchPlatform(other: PlatformConfig) {
    if (getPlatformToken(other)) handlePlatformChange(other.slug);
    else handleLogin(other);
  }

  // UserMenu has already cleared the token, so fall back to the login view.
  function handleLogout() {
    setLoggedIn(false);
    setUser(null);
    setGuilds([]);
    setChannels({});
    if (guildId) router.replace(`/join/${linkId}`);
  }

  function joinChannel(channel: Channel) {
    if (!platform || joiningChannelId) return;
    const token = getPlatformToken(platform);
    setJoiningChannelId(channel.id);
    fetch(`${config.apiV2}join_group_with_link`, {
      method: "POST",
      body: JSON.stringify({
        linkId,
        guildId,
        channelId: channel.id,
        token,
        platform: platform.slug,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(
        (res: {
          success?: boolean;
          error?: string;
          errorCode?: string;
          message?: string;
          current?: number;
          limit?: number;
          maxLimit?: number;
          groupOwnerId?: string;
        }) => {
          if (res.errorCode === "channel_limit_reached") {
            setChannelLimitData({
              current: res.current || 0,
              limit: res.limit || 5,
              maxLimit: res.maxLimit || 50,
              groupOwnerId: res.groupOwnerId || "",
            });
            setShowChannelLimitModal(true);
            return;
          }
          if (res.success === false || res.error) {
            popup(
              "Error",
              res.message || res.error || "An error occurred",
              "error",
            );
          } else {
            popup(
              "Success",
              "You have successfully joined the group !",
              "success",
              {
                action: () =>
                  router.push(
                    `/dashboard/${platform.slug}?guild=${guildId}`,
                  ),
              },
            );
          }
        },
      )
      .catch(() => popup("Error", "An error occurred", "error"))
      .finally(() => setJoiningChannelId(null));
  }

  let adminGuildNumber = 0;
  if (platform) {
    for (let index = 0; index < guilds.length; index++) {
      const guild = guilds[index];
      if (platform.isAdmin(guild)) adminGuildNumber++;
    }
  }

  const isGroupOwner =
    channelLimitData != null && guildId === channelLimitData.groupOwnerId;

  // Plus always goes to the server that owns the group: its admins pay as
  // usual, anyone else sponsors it through the invite link.
  function startChannelLimitCheckout(plan: "monthly" | "lifetime") {
    if (!channelLimitData || !platform || !groupLinkId) return;
    startOraxPlusCheckout(
      channelLimitData.groupOwnerId,
      `/join/${groupLinkId}`,
      plan,
      platform,
      {
        origin: "channel_limit",
        returnGuildId: guildId,
        sponsorLinkId: isGroupOwner ? undefined : groupLinkId,
      },
    );
  }

  // The vote lets the voter link past the limit for 12 hours (Discord), or
  // unlocks Plus on their server (Fluxerlist).
  function startChannelLimitVote() {
    if (!platform) return;
    if (voteProvider === "fluxerlist") {
      startOraxPlusVote(guildId, platform, "channel_limit");
      return;
    }
    trackOraxPlusEvent(
      "vote_started",
      { origin: "channel_limit", guildId, linkId: groupLinkId },
      platform,
    );
    openTopggVote();
  }

  return (
    <>
      <div className={dashboardStyles.background} />
      <div className={styles.page}>
        <a href="/" target="_blank" rel="noreferrer">
          <button className={styles.helpButton}>
            What is an interserver group ?
          </button>
        </a>
        {platform && loggedIn && user && (
          <UserMenu
            user={user}
            platform={platform}
            onSwitchPlatform={handleSwitchPlatform}
            onLogout={handleLogout}
          />
        )}
        {!platform ? null : !loggedIn ? (
          <div className={styles.loginContainer}>
            <h1 className={styles.title}>
              You have been invited to join the{" "}
              {group.name ? (group.name as string) : "..."} interserver group.
            </h1>
            <div className={styles.loginButtons}>
              {platformList.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  className={styles.loginButton}
                  style={{ background: p.brandGradient ?? p.brandColor }}
                  onClick={() => handleLogin(p)}
                >
                  <img
                    src={p.logoPath}
                    alt=""
                    className={styles.loginButtonIcon}
                    width={24}
                    height={24}
                  />
                  <span>Log in with {p.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : guildId ? (
          loadingChannels || channels.result ? (
            <div className={styles.channelStep}>
              <div className={styles.channelContent}>
                <BackLink
                  label="Change server"
                  onClick={() => router.push(`/join/${linkId}`)}
                />
                <div className={styles.channelHeader}>
                  {selectedGuild && (
                    <GuildIcon
                      className={styles.channelHeaderIcon}
                      iconUrl={platform.getGuildIconUrl(selectedGuild)}
                      name={selectedGuild.name}
                    />
                  )}
                  <div>
                    <h2>Select a channel</h2>
                    <p>
                      Pick the channel
                      {selectedGuild && (
                        <>
                          {" "}
                          on <strong>{selectedGuild.name}</strong>
                        </>
                      )}{" "}
                      that will join{" "}
                      {group.name ? (
                        <>
                          the <strong>{group.name as string}</strong> group
                        </>
                      ) : (
                        "this group"
                      )}
                      .
                    </p>
                  </div>
                </div>
                <SearchableList
                  items={channels.result ?? []}
                  getKey={(channel) => channel.id}
                  getLabel={(channel) => channel.name}
                  renderIcon={(channel) => <ChannelIcon type={channel.type} />}
                  onSelect={joinChannel}
                  loading={loadingChannels}
                  loadingText="Loading channels…"
                  pendingKey={joiningChannelId}
                  searchPlaceholder="Search channels…"
                  emptyText="No channel available on this server."
                  noResultsText="No channel matches your search."
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() =>
                popup("Invite the bot", `Warning`, "warning", {
                  content: (
                    <p className="content">
                      It is necessary for Orax to access the content of the
                      messages in order to synchronize them between channels. By
                      inviting Orax, it will be able to read all the messages of
                      your server.<br></br>
                      For security and privacy reasons, we suggest you to give
                      it the permission to read the messages only in the
                      channels it is used in.
                    </p>
                  ),
                  icon: meteor.src
                    ? {
                        src: meteor.src,
                        height: meteor.height,
                        width: meteor.width,
                      }
                    : undefined,
                  action: function () {
                    const inviteUrl = platform.getInviteUrl(guildId);
                    if (inviteUrl) window.open(inviteUrl);
                  },
                })
              }
              className={styles.addOraxButton}
            >
              You must add orax to your server to continue
            </button>
          )
        ) : guilds.length && group.hasOwnProperty("error") ? (
          <h1 className={styles.title}>The invitation link has expired</h1>
        ) : (
          <div className={styles.selectGuildContainer}>
            <h1 className={styles.title}>
              You have been invited to join the{" "}
              {group.name ? (group.name as string) : "..."} interserver group.
            </h1>
            <h2 className={styles.subtitle}>
              Select a server to join the group.
            </h2>
            <div
              style={{ maxWidth: adminGuildNumber > 9 ? "1000px" : "500px" }}
              className={styles.guilds}
            >
              {loadingGuilds ? (
                <div className={styles.loadingContainer}>
                  <div className="spinner" aria-hidden="true" />
                  <p className={styles.loadingText}>Loading your servers…</p>
                </div>
              ) : adminGuildNumber > 0 ? (
                guilds.map((g) =>
                  platform.isAdmin(g) ? (
                    <Link
                      key={"nav_guild_" + g.id}
                      href={`./${linkId}?guild=${g.id}`}
                    >
                      <div
                        id={"guild_" + g.id}
                        className={[
                          styles.navGuild,
                          !document.getElementById("guild_" + g.id) &&
                            "loading",
                          guild!.id === g.id ? styles.selected : null,
                        ].join(" ")}
                      >
                        <GuildIcon
                          className={styles.guildIcon}
                          iconUrl={platform.getGuildIconUrl(g)}
                          name={g.name}
                          onLoad={() => endImgLoading(g.id)}
                        />
                        <p>
                          {g.name.length > 10
                            ? g.name.substring(0, 10) + "..."
                            : g.name}
                        </p>
                      </div>
                    </Link>
                  ) : null,
                )
              ) : (
                [...Array(3)].map((o, index) => (
                  <div key={"nav_guild_" + index} className={styles.navGuild}>
                    <div
                      className={[styles.guildIcon, styles.placeHolder].join(
                        " ",
                      )}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {showChannelLimitModal && channelLimitData && platform && (
        <OraxPlusPaywallModal
          title="Channel limit reached"
          description={
            <div>
              <p>
                This group already has{" "}
                <strong>
                  {channelLimitData.current}/{channelLimitData.limit}
                </strong>{" "}
                linked channels. Choose an option below to continue.
              </p>

              <div style={{ marginTop: "16px" }}>
                <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                  {voteLabel(voteProvider)}
                </p>
                <p style={{ fontSize: "14px", opacity: 0.8 }}>
                  Vote for Orax to join this group right away, even past the
                  limit.
                </p>
              </div>

              <div style={{ marginTop: "16px" }}>
                <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                  {isGroupOwner ? "Orax Plus subscription" : "Sponsor this group"}
                </p>
                {isGroupOwner ? (
                  <p style={{ fontSize: "14px", opacity: 0.8 }}>
                    {`Subscribe to Orax Plus (${pricing.monthly}/mo) to raise the limit to `}{channelLimitData.maxLimit} channels per group.
                  </p>
                ) : (
                  <p style={{ fontSize: "14px", opacity: 0.8 }}>
                    {`Get Orax Plus for the server that owns this group (${pricing.monthly}/mo, or ${pricing.lifetime} once). The limit goes up to `}{channelLimitData.maxLimit} channels and you can join right after.
                  </p>
                )}
              </div>
            </div>
          }
          origin="channel_limit"
          guildId={guildId}
          linkId={groupLinkId}
          platform={platform}
          pricing={pricing}
          voteLabel={voteLabel(voteProvider)}
          onVote={startChannelLimitVote}
          onCheckout={startChannelLimitCheckout}
          checkoutLabels={
            isGroupOwner
              ? {
                  monthly: `Subscribe ${pricing.monthly}/mo`,
                  lifetime: `Lifetime ${pricing.lifetime}`,
                }
              : {
                  monthly: `Sponsor ${pricing.monthly}/mo`,
                  lifetime: `Sponsor lifetime ${pricing.lifetime}`,
                }
          }
          onClose={() => setShowChannelLimitModal(false)}
        />
      )}
    </>
  );
}
