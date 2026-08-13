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
import ActionModal from "../../components/ui/ActionModal";
import GuildIcon from "../../components/GuildIcon";
import {
  openTopggVote,
  startOraxPlusCheckout,
  startOraxPlusVote,
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
  const [group, setGroup] = useState<Record<string, unknown>>({});
  const [channels, setChannels] = useState<{ result?: Channel[] }>({});
  const [showChannelLimitModal, setShowChannelLimitModal] = useState(false);
  const [channelLimitData, setChannelLimitData] =
    useState<ChannelLimitData | null>(null);

  const { linkId } = router.query;
  const guildId =
    typeof router.query.guild === "string" ? router.query.guild : "";

  const platform = platformSlug ? getPlatform(platformSlug) : undefined;
  const voteProvider = platform?.vote?.provider || "topgg";

  let guild = guilds.find((guild) => guild.id === guildId);

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
    // Default to the platform the user is already logged into, else Discord.
    const activePlatform = platformList.find((p) => getPlatformToken(p));
    setPlatformSlug((current) => current ?? (activePlatform?.slug || "discord"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, linkId]);

  useEffect(() => {
    if (!platform) return;
    const token = getPlatformToken(platform);
    if (!token) {
      setLoggedIn(false);
      setGuilds([]);
      setUser(null);
      return;
    }
    setLoggedIn(true);
    loadPage(platform, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformSlug]);

  useEffect(() => {
    setChannels({});
    if (!platform || !loggedIn || !guildId) return;
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
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformSlug, guildId, loggedIn]);

  async function loadPage(platform: PlatformConfig, token: string) {
    const userDatas = await fetchPlatformUser(platform, token);
    if (!userDatas || !userDatas.id) {
      // Token is no longer valid — fall back to the login view.
      setLoggedIn(false);
      setGuilds([]);
      setUser(null);
      return;
    }
    setUser(userDatas);
    const guildsRes = (await fetchPlatformGuilds(platform, token)) as
      | DiscordGuild[]
      | { retry_after?: number };
    if (!Array.isArray(guildsRes) && guildsRes.retry_after) {
      setTimeout(() => {
        loadPage(platform, token);
      }, guildsRes.retry_after);
      return;
    }
    if (Array.isArray(guildsRes) && guildsRes.length > 0)
      setGuilds(guildsRes);
  }

  function handlePlatformChange(slug: string) {
    if (slug === platformSlug) return;
    setPlatformSlug(slug);
    setChannels({});
    setGuilds([]);
    setUser(null);
    if (guildId) router.replace(`/join/${linkId}`);
  }

  function handleLogin() {
    if (!platform || !linkId) return;
    const target = `/join/${linkId}?platform=${platform.slug}`;
    const sep = platform.authorizeUrl.includes("?") ? "&" : "?";
    window.location.href = `${platform.authorizeUrl}${sep}state=${encodeURIComponent(
      target,
    )}`;
  }

  function joinChannel(channel: Channel) {
    if (!platform) return;
    const token = getPlatformToken(platform);
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
      );
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

  return (
    <>
      <div className={dashboardStyles.background} />
      <div className={styles.page}>
        <a href="/" target="_blank" rel="noreferrer">
          <button className={styles.helpButton}>
            What is an interserver group ?
          </button>
        </a>
        {platform && (
          <div className={styles.platformSelectWrapper}>
            <img
              src={platform.logoPath}
              alt=""
              className={styles.platformSelectLogo}
              width={20}
              height={20}
            />
            <select
              className={styles.platformSelect}
              value={platform.slug}
              onChange={(event) => handlePlatformChange(event.target.value)}
              aria-label="Platform"
            >
              {platformList.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {!platform ? null : !loggedIn ? (
          <div className={styles.loginContainer}>
            <h1 className={styles.title}>
              You have been invited to join the{" "}
              {group.name ? (group.name as string) : "..."} interserver group.
            </h1>
            <button
              type="button"
              className={styles.loginButton}
              style={{
                background: platform.brandGradient ?? platform.brandColor,
              }}
              onClick={handleLogin}
            >
              <img
                src={platform.logoPath}
                alt=""
                className={styles.loginButtonIcon}
                width={24}
                height={24}
              />
              <span>Log in with {platform.label}</span>
            </button>
          </div>
        ) : guildId ? (
          channels.result ? (
            <div className={styles.buttonContainer}>
              <h2 className={styles.subtitle}>And finally, select a channel</h2>
              {channels.result.map((channel, index) => (
                <button
                  onClick={() => joinChannel(channel)}
                  key={"channel_" + index}
                  className={styles.channelButton}
                >
                  {channel.name}
                </button>
              ))}
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
              {adminGuildNumber > 0
                ? guilds.map((g) =>
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
                : [...Array(3)].map((o, index) => (
                    <div key={"nav_guild_" + index} className={styles.navGuild}>
                      <div
                        className={[styles.guildIcon, styles.placeHolder].join(
                          " ",
                        )}
                      />
                    </div>
                  ))}
            </div>
          </div>
        )}
      </div>
      {showChannelLimitModal && channelLimitData && platform && (
        <ActionModal
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
                  Orax Plus subscription
                </p>
                {isGroupOwner ? (
                  <p style={{ fontSize: "14px", opacity: 0.8 }}>
                    {`Subscribe to Orax Plus (${pricing.monthly}/mo) to raise the limit to `}{channelLimitData.maxLimit} channels per group.
                  </p>
                ) : (
                  <p style={{ fontSize: "14px", opacity: 0.8 }}>
                    Only the group owner can subscribe to increase this limit.
                  </p>
                )}
              </div>
            </div>
          }
          actions={[
            {
              label: voteLabel(voteProvider),
              variant: "primary",
              onClick: () => {
                setShowChannelLimitModal(false);
                if (voteProvider === "fluxerlist") {
                  startOraxPlusVote(guildId, platform);
                } else {
                  openTopggVote();
                }
              },
            },
            {
              label: isGroupOwner
                ? `Subscribe ${pricing.monthly}/mo`
                : "Subscribe (owner only)",
              variant: "secondary",
              disabled: !isGroupOwner,
              onClick: () => {
                setShowChannelLimitModal(false);
                startOraxPlusCheckout(
                  channelLimitData.groupOwnerId,
                  undefined,
                  "monthly",
                  platform,
                );
              },
            },
            {
              label: isGroupOwner
                ? `Lifetime ${pricing.lifetime}`
                : "Lifetime (owner only)",
              variant: "secondary",
              disabled: !isGroupOwner,
              onClick: () => {
                setShowChannelLimitModal(false);
                startOraxPlusCheckout(
                  channelLimitData.groupOwnerId,
                  undefined,
                  "lifetime",
                  platform,
                );
              },
            },
          ]}
          onClose={() => setShowChannelLimitModal(false)}
        />
      )}
    </>
  );
}
