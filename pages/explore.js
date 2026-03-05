import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BetaTag from "../components/ui/BetaTag";
import styles from "../styles/Explore.module.css";
import config from "../utils/config.json";
import { getCookie, setCookie } from "../utils/cookies";
import { useRouter } from "next/router";
import { checkAdminPerms } from "../utils/permissions";
import { useScroll } from "../utils/ScrollContext";

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
  const { lockScroll, unlockScroll } = useScroll();
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
  const [openedMenuFromLink, setOpenedMenuFromLink] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [voteSuccess, setVoteSuccess] = useState("");
  const [globalVoteSuccess, setGlobalVoteSuccess] = useState("");
  const [voteCooldownSeconds, setVoteCooldownSeconds] = useState(0);
  const [pendingVoteGroupId, setPendingVoteGroupId] = useState("");

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const voteAuthHandledRef = useRef(false);

  const upsertGroup = useCallback((groupToUpsert) => {
    if (!groupToUpsert?.id) return;

    setGroups((prev) => {
      const normalizedId = String(groupToUpsert.id);
      const existingIndex = prev.findIndex(
        (group) => String(group.id) === normalizedId,
      );

      if (existingIndex === -1) {
        return [{ ...groupToUpsert, id: normalizedId }, ...prev];
      }

      const next = [...prev];
      next[existingIndex] = {
        ...next[existingIndex],
        ...groupToUpsert,
        id: normalizedId,
      };
      return next;
    });
  }, []);

  const fetchExploreGroupById = useCallback(
    async (groupId) => {
      if (!groupId) return null;

      try {
        const res = await fetch(
          `${config.apiV2}explore_get_group?group_id=${encodeURIComponent(
            groupId,
          )}`,
        );

        if (!res.ok) return null;

        const data = await res.json();
        if (!data?.result || !data?.group) return null;

        const normalizedGroup = {
          ...data.group,
          id: String(data.group.id ?? groupId),
        };

        upsertGroup(normalizedGroup);
        return normalizedGroup;
      } catch (e) {
        console.error("Failed to load explore group by id:", e);
        return null;
      }
    },
    [upsertGroup],
  );

  const openGroupMenuById = useCallback(
    async (groupId) => {
      if (!groupId) return false;

      let groupToOpen = groups.find(
        (group) => String(group.id) === String(groupId),
      );
      if (!groupToOpen) {
        groupToOpen = await fetchExploreGroupById(groupId);
      }

      if (!groupToOpen) return false;

      setViewGroup(groupToOpen);
      lockScroll();
      setOpenedMenuFromLink(true);
      return true;
    },
    [groups, fetchExploreGroupById, lockScroll],
  );

  const redirectToDiscordAuth = useCallback((stateValue) => {
    const redirectUri = encodeURI(
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/explore`,
    );
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=812298057470967858&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${encodeURIComponent(
      stateValue,
    )}`;
  }, []);

  const formatVoteCountdown = useCallback((seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const hours = Math.floor(safeSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((safeSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(safeSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  }, []);

  const handleVoteGroup = useCallback(
    async (groupId, tokenOverride = null) => {
      if (!groupId) return;
      if (voteCooldownSeconds > 0) return;

      setIsVoting(true);
      setVoteError("");
      setVoteSuccess("");

      const token = tokenOverride || getCookie("token");
      if (!token || token === "undefined") {
        setIsVoting(false);
        redirectToDiscordAuth(`vote,${groupId}`);
        return;
      }

      try {
        const res = await fetch(`${config.apiV2}explore_vote`, {
          method: "POST",
          body: JSON.stringify({ token, group_id: groupId }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        const hasInvalidToken =
          data?.result === false &&
          data?.error === 1 &&
          data?.message === "Invalid auth token";

        if (hasInvalidToken) {
          setCookie("token", "", 0);
          redirectToDiscordAuth(`vote,${groupId}`);
          return;
        }

        if (!res.ok || data?.result === false) {
          throw new Error(data?.message || "Failed to submit vote");
        }

        setGroups((prev) =>
          prev.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  vote: (Number(group.vote) || 0) + 1,
                }
              : group,
          ),
        );
        setViewGroup((prev) =>
          prev && prev.id === groupId
            ? {
                ...prev,
                vote: (Number(prev.vote) || 0) + 1,
              }
            : prev,
        );

        const successMessage = "Your vote has been recorded successfully.";
        setVoteSuccess(successMessage);
        setGlobalVoteSuccess(successMessage);
        setVoteCooldownSeconds(24 * 60 * 60);
      } catch (e) {
        console.error(e);
        setVoteError("Failed to submit your vote. Please try again.");
      } finally {
        setIsVoting(false);
      }
    },
    [redirectToDiscordAuth, voteCooldownSeconds],
  );

  useEffect(() => {
    if (voteCooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setVoteCooldownSeconds((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [voteCooldownSeconds]);

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

  // Handle OAuth callback for vote flow: ?code=...&state=vote,<group_id>
  useEffect(() => {
    if (!router.isReady || voteAuthHandledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    const stateParam = params.get("state");
    if (!codeParam || !stateParam) {
      return;
    }

    if (!stateParam.startsWith("vote,")) return;
    const stateParts = stateParam.split(",");
    const groupId = stateParts[1];
    if (!groupId) return;

    voteAuthHandledRef.current = true;

    async function handleVoteAuthCallback() {
      setIsAuthLoading(true);
      setVoteError("");

      const opened = await openGroupMenuById(groupId);
      if (!opened) {
        setPendingVoteGroupId(groupId);
      }

      await router.replace(
        `/explore?group=${encodeURIComponent(groupId)}`,
        undefined,
        {
          shallow: true,
        },
      );

      try {
        const res = await fetch(`${config.serverIp}login`, {
          method: "POST",
          body: JSON.stringify({ token: codeParam }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!data.access_token || data.access_token === "undefined") {
          throw new Error("Failed to authenticate with Discord");
        }

        setCookie("token", data.access_token, data.expires_in - 1000);
        await handleVoteGroup(groupId, data.access_token);
      } catch (e) {
        console.error(e);
        setVoteError("Discord authentication failed. Please try voting again.");
        router.replace(`/explore?group=${encodeURIComponent(groupId)}`);
      } finally {
        setIsAuthLoading(false);
      }
    }

    handleVoteAuthCallback();
  }, [router, router.isReady, handleVoteGroup, openGroupMenuById]);

  useEffect(() => {
    if (!pendingVoteGroupId) return;

    let cancelled = false;

    async function openPendingVoteGroup() {
      const opened = await openGroupMenuById(pendingVoteGroupId);
      if (cancelled || !opened) return;

      setPendingVoteGroupId("");
    }

    openPendingVoteGroup();

    return () => {
      cancelled = true;
    };
  }, [pendingVoteGroupId, openGroupMenuById]);

  // Handle ?group=<group_id> URL parameter
  useEffect(() => {
    if (!router.isReady || openedMenuFromLink) return;

    const groupId = router.query.group;
    if (!groupId) return;

    let cancelled = false;

    async function openGroupFromQuery() {
      let group = groups.find((g) => String(g.id) === String(groupId));
      if (!group) {
        group = await fetchExploreGroupById(groupId);
      }

      if (!group || cancelled) return;

      setViewGroup(group);
      lockScroll();
      setOpenedMenuFromLink(true);
    }

    openGroupFromQuery();

    return () => {
      cancelled = true;
    };
  }, [
    router.isReady,
    router.query,
    groups,
    lockScroll,
    openedMenuFromLink,
    fetchExploreGroupById,
  ]);

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

  useEffect(() => {
    if (!viewGroup?.id) {
      setVoteCooldownSeconds(0);
      return;
    }

    let cancelled = false;

    async function loadVoteCooldown() {
      const token = getCookie("token");
      if (!token || token === "undefined") {
        setVoteCooldownSeconds(0);
        return;
      }

      try {
        const userRes = await fetch("https://discordapp.com/api/users/@me", {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        });
        const userData = await userRes.json();

        if (userData?.retry_after) {
          setTimeout(() => {
            if (!cancelled) {
              loadVoteCooldown();
            }
          }, userData.retry_after + 50);
          return;
        }

        if (
          !userRes.ok ||
          userData?.message === "401: Unauthorized" ||
          !userData?.id
        ) {
          setCookie("token", "", 0);
          if (!cancelled) {
            setVoteCooldownSeconds(0);
          }
          return;
        }

        const voteRes = await fetch(
          `${config.apiV2}get_vote?group_id=${encodeURIComponent(
            viewGroup.id,
          )}&user_id=${encodeURIComponent(userData.id)}`,
        );
        const voteData = await voteRes.json();

        if (!voteRes.ok || !voteData?.result || !voteData?.vote?.date) {
          if (!cancelled) {
            setVoteCooldownSeconds(0);
          }
          return;
        }

        const latestVoteTimestamp = new Date(voteData.vote.date).getTime();
        if (!Number.isFinite(latestVoteTimestamp)) {
          if (!cancelled) {
            setVoteCooldownSeconds(0);
          }
          return;
        }

        const remainingSeconds = Math.ceil(
          (latestVoteTimestamp + 24 * 60 * 60 * 1000 - Date.now()) / 1000,
        );

        if (!cancelled) {
          setVoteCooldownSeconds(remainingSeconds > 0 ? remainingSeconds : 0);
        }
      } catch (e) {
        console.error("Failed to load vote cooldown:", e);
        if (!cancelled) {
          setVoteCooldownSeconds(0);
        }
      }
    }

    loadVoteCooldown();

    return () => {
      cancelled = true;
    };
  }, [viewGroup?.id]);

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
        if (state && typeof state === "string" && state.startsWith("vote,")) {
          return token;
        }
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
      redirectToDiscordAuth(window.location.href);
      return null;
    }
  }, [redirectToDiscordAuth]);

  const openPublishMenu = useCallback(async () => {
    const token = await ensureDiscordAuth();
    if (!token) return;

    lockScroll();
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
        redirectToDiscordAuth(window.location.href);
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
  }, [ensureDiscordAuth, lockScroll, redirectToDiscordAuth]);

  const openJoinMenu = useCallback(
    async (groupId) => {
      if (!groupId) return;

      const token = await ensureDiscordAuth();
      if (!token) return;

      lockScroll();
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
          redirectToDiscordAuth(window.location.href);
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
    [ensureDiscordAuth, lockScroll, redirectToDiscordAuth],
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

  const closePublishMenu = () => {
    setIsPublishMenuOpen(false);
    unlockScroll();
  };

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
    unlockScroll();
  };

  const closeViewGroup = () => {
    setViewGroup(null);
    setVoteError("");
    setVoteSuccess("");
    setVoteCooldownSeconds(0);
    unlockScroll();
    // Remove the ?group= param from URL if present
    if (router.query.group) {
      router.push("/explore", undefined, { shallow: true });
    }
  };

  useEffect(() => {
    if (!viewGroup?.id) {
      setViewGroupServers([]);
      setViewGroupServersError("");
      setIsViewGroupServersLoading(false);
      unlockScroll();
      return;
    }

    lockScroll();
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
  }, [viewGroup, lockScroll, unlockScroll]);

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

  return (
    <>
      <Header theme="dark" />
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
          {globalVoteSuccess && (
            <p className={styles.globalVoteSuccess}>{globalVoteSuccess}</p>
          )}
        </section>

        <section className={styles.grid}>
          {groups.map((group) => (
            <article
              key={group.id}
              className={styles.card}
              onClick={() => {
                setVoteError("");
                setVoteSuccess("");
                setViewGroup(group);
              }}
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
          <div className={styles.groupOverlay} onClick={closeViewGroup}>
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
                        No servers are listed in this group yet.
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
              {(voteError || voteSuccess) && (
                <p
                  className={voteError ? styles.voteError : styles.voteSuccess}
                >
                  {voteError || voteSuccess}
                </p>
              )}
              <div className={styles.groupActions}>
                <button
                  type="button"
                  className={`${styles.groupVoteButton} ${
                    voteCooldownSeconds > 0
                      ? styles.groupVoteButtonDisabled
                      : ""
                  }`}
                  onClick={() => handleVoteGroup(viewGroup.id)}
                  disabled={
                    isVoting || isAuthLoading || voteCooldownSeconds > 0
                  }
                >
                  {isVoting
                    ? "Voting..."
                    : voteCooldownSeconds > 0
                      ? `Vote in ${formatVoteCountdown(voteCooldownSeconds)} (${Number(viewGroup?.vote) || 0})`
                      : `Vote (${Number(viewGroup?.vote) || 0})`}
                </button>
                <button
                  type="button"
                  className={styles.groupClose}
                  onClick={closeViewGroup}
                >
                  Close
                </button>
                <button
                  type="button"
                  className={styles.groupJoinButton}
                  onClick={() => {
                    openJoinMenu(viewGroup.id);
                    closeViewGroup();
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
      <Footer theme="dark" />
    </>
  );
}
