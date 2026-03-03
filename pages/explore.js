import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
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
      const res = await fetch("https://discordapp.com/api/v6/users/@me/guilds", {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });
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

  const handleConfirmPublishGroup = (groupId) => {
    const idToUse = groupId || selectedGroupId;
    if (!idToUse) return;
    router.push(`/explore/publish/${idToUse}`);
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.header}>
          <h1 className={styles.title}>Explore public groups</h1>
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
                {group.server_count && (
                  <p className={styles.cardMeta}>
                    {group.server_count ? (
                      <span>{group.server_count} servers</span>
                    ) : null}
                  </p>
                )}
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
              </div>
              <button
                type="button"
                className={styles.groupClose}
                onClick={() => setViewGroup(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {isPublishMenuOpen && (
          <div className={styles.publishOverlay}>
            <div className={styles.publishPanel}>
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
                  <button
                    type="button"
                    className={styles.publishClose}
                    onClick={() => setIsPublishMenuOpen(false)}
                  >
                    Close
                  </button>
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
                  <button
                    type="button"
                    className={styles.publishClose}
                    onClick={() => setIsPublishMenuOpen(false)}
                  >
                    Close
                  </button>
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
