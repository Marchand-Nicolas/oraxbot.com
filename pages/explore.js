import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BetaTag from "../components/ui/BetaTag";
import styles from "../styles/Explore.module.css";
import config from "../utils/config.json";
import { getCookie, setCookie } from "../utils/cookies";
import { useRouter } from "next/router";
import { checkAdminPerms } from "../utils/permissions";

// Expected API response shape from `${config.apiV2}explore/published_groups?page=`:
// {
//   groups: Array<{
//     id: string;
//     name: string;
//     description?: string;
//     image_url?: string;
//     server_count?: number;
//     member_count?: number;
//   }>;
//   next_page: number | null;
//   remaining_pages: number;
// }

export default function Explore() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [guilds, setGuilds] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState("");
  const [ownedGroups, setOwnedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isPublishMenuOpen, setIsPublishMenuOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [publishStep, setPublishStep] = useState(1); // 1 = select guild, 2 = select group
  const [viewGroup, setViewGroup] = useState(null);
  const [viewGroupServers, setViewGroupServers] = useState([]);
  const [isViewGroupServersLoading, setIsViewGroupServersLoading] =
    useState(false);
  const [viewGroupServersError, setViewGroupServersError] = useState("");

  const [isJoinMenuOpen, setIsJoinMenuOpen] = useState(false);
  const [joinStep, setJoinStep] = useState(1); // 1 = guild, 2 = channel, 3 = proposal
  const [joinGroupId, setJoinGroupId] = useState("");
  const [joinSelectedGuildId, setJoinSelectedGuildId] = useState("");
  const [joinChannels, setJoinChannels] = useState([]);
  const [joinSelectedChannelId, setJoinSelectedChannelId] = useState("");
  const [joinDescription, setJoinDescription] = useState("");
  const [isJoinSubmitting, setIsJoinSubmitting] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const loadPage = useCallback(
    async (pageToLoad) => {
      if (isLoading || !hasMore) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${config.apiV2}explore_published_groups?page=${pageToLoad}`,
        );

        if (!res.ok) {
          throw new Error(`Failed to load groups (status ${res.status})`);
        }

        const data = await res.json();

        const newGroups = Array.isArray(data.groups) ? data.groups : [];
        // Avoid duplicates when the same page is loaded twice (e.g. initial load + observer)
        setGroups((prev) => {
          const existingIds = new Set(prev.map((g) => g.id));
          const filtered = newGroups.filter((g) => !existingIds.has(g.id));
          return [...prev, ...filtered];
        });

        if (data.next_page) {
          setPage(data.next_page);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } catch (e) {
        console.error(e);
        setError("An error occurred while loading groups. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [hasMore, isLoading],
  );

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadPage(page);
        }
      },
      {
        rootMargin: "200px",
      },
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [page, hasMore, isLoading, loadPage]);

  // --- Publish flow: Discord auth + guilds / groups selection ---

  const ensureDiscordAuth = useCallback(async () => {
    let token = getCookie("token");
    if (token && token !== "undefined") return token;

    setIsAuthLoading(true);

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code) {
      try {
        const res = await fetch(`${config.serverIp}login`, {
          method: "POST",
          body: JSON.stringify({ token: code }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!data.access_token || data.access_token === "undefined") {
          window.location.href = "/dashboard";
          return null;
        }
        setCookie("token", data.access_token, data.expires_in - 1000);
        token = data.access_token;
        // Clean URL from code/state if needed
        if (state) {
          window.location.href = state;
          return null;
        }
        return token;
      } finally {
        setIsAuthLoading(false);
      }
    } else {
      const redirectUri = encodeURI(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/explore`,
      );
      const fullState = encodeURIComponent(window.location.href);
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=812298057470967858&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${fullState}`;
      return null;
    }
  }, []);

  const openPublishMenu = useCallback(async () => {
    const token = await ensureDiscordAuth();
    if (!token) return;

    setIsAuthLoading(true);
    try {
      const res = await fetch(
        "https://discordapp.com/api/v6/users/@me/guilds",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        },
      );
      const userGuilds = await res.json();

      if (userGuilds?.message === "401: Unauthorized") {
        // Reuse dashboard flow: clear token and trigger Discord OAuth
        setCookie("token", "", 0);
        const redirectUri =
          encodeURI(process.env.NEXT_PUBLIC_WEBSITE_URL) + "%2Fexplore";
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=812298057470967858&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${encodeURIComponent(
          window.location.href,
        )}`;
        return;
      }

      if (userGuilds?.retry_after) {
        setTimeout(() => {
          openPublishMenu();
        }, userGuilds.retry_after + 50);
        return;
      }

      if (Array.isArray(userGuilds)) {
        setGuilds(userGuilds);
      } else {
        setGuilds([]);
      }

      setSelectedGuildId("");
      setSelectedGroupId("");
      setOwnedGroups([]);
      setPublishStep(1);
      setIsPublishMenuOpen(true);
    } finally {
      setIsAuthLoading(false);
    }
  }, [ensureDiscordAuth]);

  const openJoinMenu = useCallback(
    async (groupId) => {
      if (!groupId) return;

      const token = await ensureDiscordAuth();
      if (!token) return;

      setIsAuthLoading(true);
      try {
        const res = await fetch(
          "https://discordapp.com/api/v6/users/@me/guilds",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
              Authorization: "Bearer " + token,
            },
          },
        );
        const userGuilds = await res.json();

        if (userGuilds?.message === "401: Unauthorized") {
          setCookie("token", "", 0);
          const redirectUri =
            encodeURI(process.env.NEXT_PUBLIC_WEBSITE_URL) + "%2Fexplore";
          window.location.href = `https://discord.com/api/oauth2/authorize?client_id=812298057470967858&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${encodeURIComponent(
            window.location.href,
          )}`;
          return;
        }

        if (userGuilds?.retry_after) {
          setTimeout(() => {
            openJoinMenu(groupId);
          }, userGuilds.retry_after + 50);
          return;
        }

        if (Array.isArray(userGuilds)) {
          setGuilds(userGuilds);
        } else {
          setGuilds([]);
        }

        setJoinGroupId(groupId);
        setJoinSelectedGuildId("");
        setJoinChannels([]);
        setJoinSelectedChannelId("");
        setJoinDescription("");
        setJoinError("");
        setJoinSuccess("");
        setJoinStep(1);
        setIsJoinMenuOpen(true);
      } finally {
        setIsAuthLoading(false);
      }
    },
    [ensureDiscordAuth],
  );

  useEffect(() => {
    async function loadOwnedGroups() {
      if (!selectedGuildId) {
        setOwnedGroups([]);
        setSelectedGroupId("");
        return;
      }

      try {
        const res = await fetch(`${config.apiV2}get_server_data`, {
          method: "POST",
          body: JSON.stringify({
            guildId: selectedGuildId,
            token: getCookie("token"),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data && Array.isArray(data.ownedGroups)) {
          setOwnedGroups(data.ownedGroups);
          setSelectedGroupId(data.ownedGroups[0]?.id || "");
        } else {
          setOwnedGroups([]);
          setSelectedGroupId("");
        }
      } catch (e) {
        console.error("Failed to load owned groups for publish:", e);
        setOwnedGroups([]);
        setSelectedGroupId("");
      }
    }

    if (isPublishMenuOpen && publishStep === 2) {
      loadOwnedGroups();
    }
  }, [isPublishMenuOpen, publishStep, selectedGuildId]);

  useEffect(() => {
    async function loadGuildChannels() {
      if (!joinSelectedGuildId) {
        setJoinChannels([]);
        setJoinSelectedChannelId("");
        return;
      }

      try {
        const res = await fetch(`${config.apiV2}get_guild_channels`, {
          method: "POST",
          body: JSON.stringify({ guildId: joinSelectedGuildId }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (data && Array.isArray(data.result)) {
          setJoinChannels(data.result);
          setJoinSelectedChannelId(data.result[0]?.id || "");
        } else {
          setJoinChannels([]);
          setJoinSelectedChannelId("");
        }
      } catch (e) {
        console.error("Failed to load guild channels for join:", e);
        setJoinChannels([]);
        setJoinSelectedChannelId("");
      }
    }

    if (isJoinMenuOpen && joinStep === 2) {
      loadGuildChannels();
    }
  }, [isJoinMenuOpen, joinStep, joinSelectedGuildId]);

  useEffect(() => {
    if (!viewGroup?.id) {
      setViewGroupServers([]);
      setViewGroupServersError("");
      setIsViewGroupServersLoading(false);
      return;
    }

    let cancelled = false;

    async function loadViewGroupServers() {
      setIsViewGroupServersLoading(true);
      setViewGroupServersError("");

      try {
        const res = await fetch(
          `${config.apiV2}get_group_public_servers?group_id=${encodeURIComponent(
            viewGroup.id,
          )}`,
        );
        const data = await res.json();

        if (!res.ok || !data?.result) {
          throw new Error("Failed to load public servers");
        }

        if (!cancelled) {
          setViewGroupServers(Array.isArray(data.servers) ? data.servers : []);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setViewGroupServers([]);
          setViewGroupServersError(
            "Failed to load public servers for this group.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsViewGroupServersLoading(false);
        }
      }
    }

    loadViewGroupServers();

    return () => {
      cancelled = true;
    };
  }, [viewGroup]);

  const handleConfirmPublishGroup = (groupId) => {
    const idToUse = groupId || selectedGroupId;
    if (!idToUse) return;
    const query =
      selectedGuildId && selectedGuildId !== ""
        ? `?guild=${encodeURIComponent(selectedGuildId)}`
        : "";
    router.push(`/explore/publish/${idToUse}${query}`);
  };

  const handleSubmitJoinProposal = async () => {
    if (!joinGroupId || !joinSelectedGuildId || !joinSelectedChannelId) {
      setJoinError("Please select a server and a channel first.");
      return;
    }

    setIsJoinSubmitting(true);
    setJoinError("");
    setJoinSuccess("");

    try {
      const body = {
        group_id: joinGroupId,
        guild_id: joinSelectedGuildId,
        channel_id: joinSelectedChannelId,
        description: joinDescription,
      };

      const res = await fetch(`${config.apiV2}explore_join_group`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || "Failed to send proposal");
      }

      setJoinSuccess("Your proposal has been sent successfully.");
      setJoinStep(3);
    } catch (e) {
      console.error(e);
      setJoinError(
        "Failed to send your proposal. Please check your choices and try again.",
      );
    } finally {
      setIsJoinSubmitting(false);
    }
  };

  const closePublishMenu = () => {
    setIsPublishMenuOpen(false);
  };

  const closeJoinMenu = () => {
    setIsJoinMenuOpen(false);
    setJoinStep(1);
    setJoinGroupId("");
    setJoinSelectedGuildId("");
    setJoinChannels([]);
    setJoinSelectedChannelId("");
    setJoinDescription("");
    setJoinError("");
    setJoinSuccess("");
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.header}>
          <h1 className={styles.title}>
            Explore public groups
            <BetaTag />
          </h1>
          <p className={styles.subtitle}>
            Discover interserver groups created by the community and join the
            ones that match your interests.
          </p>
          <button
            type="button"
            className={styles.publishButton}
            onClick={openPublishMenu}
            disabled={isAuthLoading}
          >
            {isAuthLoading ? "Connecting to Discord..." : "Publish your group"}
          </button>
        </section>

        <section className={styles.grid}>
          {groups.map((group) => (
            <article
              key={group.id}
              className={styles.card}
              onClick={() => setViewGroup(group)}
            >
              {group.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={group.image_url}
                  alt={group.name}
                  className={styles.cardImage}
                />
              )}
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{group.name}</h2>
                {group.description && (
                  <p className={styles.cardDescription}>
                    {group.description.length > 100
                      ? group.description.slice(0, 100) + "..."
                      : group.description}
                  </p>
                )}
                <div className="line">
                  <p className={styles.cardMeta}>
                    <span>{group.server_count} servers</span>
                  </p>
                  <p className={styles.cardMeta}>
                    <span>{group.message_count} messages this month</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
          {groups.length === 0 && !isLoading && !error && (
            <p className={styles.empty}>No public groups found yet.</p>
          )}
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <div ref={sentinelRef} className={styles.sentinel} />

        {isLoading && <p className={styles.loading}>Loading more groups...</p>}

        {!hasMore && groups.length > 0 && (
          <p className={styles.end}>You’ve reached the end.</p>
        )}

        {viewGroup && (
          <div
            className={styles.groupOverlay}
            onClick={() => setViewGroup(null)}
          >
            <div
              className={styles.groupPanel}
              onClick={(e) => e.stopPropagation()}
            >
              {viewGroup.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewGroup.image_url}
                  alt={viewGroup.name}
                  className={styles.groupImage}
                />
              )}
              <div className={styles.groupContent}>
                <h2 className={styles.groupTitle}>{viewGroup.name}</h2>
                {(viewGroup.server_count || viewGroup.member_count) && (
                  <p className={styles.groupMeta}>
                    {viewGroup.server_count ? (
                      <span>{viewGroup.server_count} servers</span>
                    ) : null}
                    {viewGroup.server_count && viewGroup.member_count ? (
                      <span className={styles.dot}>•</span>
                    ) : null}
                    {viewGroup.member_count ? (
                      <span>{viewGroup.member_count} members</span>
                    ) : null}
                  </p>
                )}
                {viewGroup.description && (
                  <p className={styles.groupDescriptionFull}>
                    {viewGroup.description}
                  </p>
                )}

                <div className={styles.publicServersSection}>
                  <h3 className={styles.publicServersTitle}>Servers</h3>

                  {isViewGroupServersLoading && (
                    <p className={styles.publicServersLoading}>
                      Loading servers...
                    </p>
                  )}

                  {!isViewGroupServersLoading && viewGroupServersError && (
                    <p className={styles.publicServersError}>
                      {viewGroupServersError}
                    </p>
                  )}

                  {!isViewGroupServersLoading &&
                    !viewGroupServersError &&
                    viewGroupServers.length === 0 && (
                      <p className={styles.publicServersEmpty}>
                        No public servers are listed in this group yet.
                      </p>
                    )}

                  {!isViewGroupServersLoading &&
                    !viewGroupServersError &&
                    viewGroupServers.length > 0 && (
                      <div className={styles.publicServersList}>
                        {viewGroupServers.map((server) => {
                          const inviteUrl = server.invite
                            ? server.invite.startsWith("http")
                              ? server.invite
                              : `https://discord.gg/${server.invite}`
                            : null;
                          const displayName =
                            server.displayName ||
                            server.guildName ||
                            "Unknown server";

                          return (
                            <div
                              key={
                                server.guildId || `${displayName}-${inviteUrl}`
                              }
                              className={styles.publicServerCard}
                            >
                              {server.icon ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={`https://cdn.discordapp.com/icons/${server.guildId}/${server.icon}.webp?size=160&quality=lossless`}
                                  alt={displayName}
                                  className={styles.publicServerIcon}
                                />
                              ) : (
                                <div
                                  className={styles.publicServerFallbackIcon}
                                >
                                  {(displayName || "?").charAt(0).toUpperCase()}
                                </div>
                              )}

                              <div className={styles.publicServerInfo}>
                                <p className={styles.publicServerName}>
                                  {displayName}
                                </p>
                                {server.guildName &&
                                  server.guildName !== displayName && (
                                    <p className={styles.publicServerGuildName}>
                                      {server.guildName}
                                    </p>
                                  )}
                              </div>

                              {inviteUrl ? (
                                <a
                                  href={inviteUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={styles.publicServerInvite}
                                >
                                  Join
                                </a>
                              ) : (
                                <span className={styles.publicServerNoInvite}>
                                  No invite
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
              <div className={styles.groupActions}>
                <button
                  type="button"
                  className={styles.groupClose}
                  onClick={() => setViewGroup(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className={styles.groupJoinButton}
                  onClick={() => {
                    openJoinMenu(viewGroup.id);
                    setViewGroup(null);
                  }}
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? "Connecting..." : "Join group"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isPublishMenuOpen && (
          <div className={styles.publishOverlay}>
            <div className={styles.publishPanel}>
              <button
                type="button"
                className={styles.panelCloseButton}
                onClick={closePublishMenu}
                aria-label="Close publish menu"
              >
                ×
              </button>

              {publishStep === 1 && (
                <>
                  <div className={styles.publishHeader}>
                    <h2>Select a server</h2>
                    <p>
                      Choose the Discord server that owns the group you want to
                      publish.
                    </p>
                  </div>
                  <div className={styles.guildGrid}>
                    {guilds.map((g) =>
                      checkAdminPerms(g) ? (
                        <button
                          key={g.id}
                          type="button"
                          className={styles.guildCard}
                          onClick={() => {
                            setSelectedGuildId(g.id);
                            setPublishStep(2);
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              g.icon
                                ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
                                : "/assets/default_guild_icon.jpg"
                            }
                            alt={g.name}
                            className={styles.guildIcon}
                          />
                          <span className={styles.guildName}>{g.name}</span>
                        </button>
                      ) : null,
                    )}
                    {guilds.length === 0 && (
                      <p className={styles.empty}>
                        No servers found. Make sure you are logged in with the
                        correct Discord account.
                      </p>
                    )}
                  </div>
                </>
              )}

              {publishStep === 2 && (
                <>
                  <div className={styles.publishHeader}>
                    <button
                      type="button"
                      className={styles.backButton}
                      onClick={() => {
                        setPublishStep(1);
                        setSelectedGroupId("");
                        setOwnedGroups([]);
                      }}
                    >
                      ← Back
                    </button>
                    <h2>Select a group to publish</h2>
                    <p>
                      Choose one of your groups on this server to configure on
                      the explore page.
                    </p>
                  </div>
                  <div className={styles.groupList}>
                    {ownedGroups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className={styles.groupItem}
                        onClick={() => handleConfirmPublishGroup(g.id)}
                      >
                        <span className={styles.groupName}>{g.name}</span>
                      </button>
                    ))}
                    {ownedGroups.length === 0 && (
                      <p className={styles.empty}>
                        This server does not own any group yet.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isJoinMenuOpen && (
          <div className={styles.publishOverlay}>
            <div className={styles.publishPanel}>
              <button
                type="button"
                className={styles.panelCloseButton}
                onClick={closeJoinMenu}
                aria-label="Close join menu"
              >
                ×
              </button>

              {joinStep === 1 && (
                <>
                  <div className={styles.publishHeader}>
                    <h2>Select a server</h2>
                    <p>Choose the Discord server that will join this group.</p>
                  </div>
                  <div className={styles.guildGrid}>
                    {guilds.map((g) =>
                      checkAdminPerms(g) ? (
                        <button
                          key={g.id}
                          type="button"
                          className={styles.guildCard}
                          onClick={() => {
                            setJoinSelectedGuildId(g.id);
                            setJoinStep(2);
                            setJoinError("");
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              g.icon
                                ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
                                : "/assets/default_guild_icon.jpg"
                            }
                            alt={g.name}
                            className={styles.guildIcon}
                          />
                          <span className={styles.guildName}>{g.name}</span>
                        </button>
                      ) : null,
                    )}
                    {guilds.length === 0 && (
                      <p className={styles.empty}>
                        No servers found. Make sure you are logged in with the
                        correct Discord account.
                      </p>
                    )}
                  </div>
                </>
              )}

              {joinStep === 2 && (
                <>
                  <div className={styles.publishHeader}>
                    <button
                      type="button"
                      className={styles.backButton}
                      onClick={() => {
                        setJoinStep(1);
                        setJoinSelectedGuildId("");
                        setJoinChannels([]);
                        setJoinSelectedChannelId("");
                        setJoinError("");
                      }}
                    >
                      ← Back
                    </button>
                    <h2>Select a channel</h2>
                    <p>
                      Choose the channel where your proposal should be sent.
                    </p>
                  </div>

                  <div className={styles.groupList}>
                    {joinChannels.map((channel) => (
                      <button
                        key={channel.id}
                        type="button"
                        className={styles.groupItem}
                        onClick={() => {
                          setJoinSelectedChannelId(channel.id);
                          setJoinStep(3);
                          setJoinError("");
                        }}
                      >
                        <span className={styles.groupName}>
                          #{channel.name}
                        </span>
                      </button>
                    ))}
                    {joinChannels.length === 0 && (
                      <p className={styles.empty}>
                        No available channels found for this server.
                      </p>
                    )}
                  </div>
                </>
              )}

              {joinStep === 3 && (
                <>
                  <div className={styles.publishHeader}>
                    <button
                      type="button"
                      className={styles.backButton}
                      onClick={() => {
                        setJoinStep(2);
                        setJoinError("");
                      }}
                    >
                      ← Back
                    </button>
                    <h2>Write your proposal</h2>
                    <p>
                      Explain why this server wants to join this interserver
                      group.
                    </p>
                  </div>

                  <textarea
                    className={styles.joinTextarea}
                    value={joinDescription}
                    onChange={(event) =>
                      setJoinDescription(event.target.value.slice(0, 1500))
                    }
                    placeholder="Introduce your server and describe your goals."
                    rows={6}
                  />

                  {joinError && <p className={styles.error}>{joinError}</p>}
                  {joinSuccess && (
                    <p className={styles.success}>{joinSuccess}</p>
                  )}

                  {!joinSuccess && (
                    <div className={styles.joinActions}>
                      <button
                        type="button"
                        className={styles.joinSubmitButton}
                        onClick={handleSubmitJoinProposal}
                        disabled={isJoinSubmitting || !joinSelectedChannelId}
                      >
                        {isJoinSubmitting
                          ? "Sending proposal..."
                          : "Send proposal"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
