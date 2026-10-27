import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import GuildIcon from "../GuildIcon";
import BetaTag from "../ui/BetaTag";
import LocalizedHead from "../LocalizedHead";
import styles from "../../styles/Explore.module.css";
import config from "../../utils/config.json";
import { useRouter } from "next/router";
import { useScroll } from "../../utils/ScrollContext";
import {
  getPlatform,
  platformList,
  type PlatformConfig,
} from "../../utils/platforms";
import {
  createTranslator,
  type LanguageCode,
} from "../../utils/i18n";
import {
  AUTH_CHANGE_EVENT,
  clearPlatformToken,
  detectActivePlatform,
  exchangeOauthCode,
  fetchPlatformGuilds,
  fetchPlatformUser,
  getPlatformToken,
  persistPlatformToken,
  setActivePlatformSession,
} from "../../utils/platforms/oauth";

import type {
  DiscordGuild,
  ExploreGroup,
  LinkedChannel,
  OwnedGroup,
  PublicServer,
} from "../../types";

interface ExploreGroupResponse {
  result?: boolean;
  group?: ExploreGroup;
}

interface ExplorePageResponse {
  groups?: ExploreGroup[];
  next_page?: number | null;
}

interface DiscordAuthResponse {
  access_token?: string;
  expires_in: number;
}

interface PublicServersResponse {
  result?: boolean;
  servers?: PublicServer[];
}

interface OwnedGroupsResponse {
  ownedGroups?: OwnedGroup[];
}

interface GuildChannelsResponse {
  result?: LinkedChannel[];
}

interface ApiErrorResponse {
  result?: boolean;
  error?: number | string;
  message?: string;
}

function getGroupInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .map((word) => word[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function coverUnit(seed: number): number {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function coverColor(hue: number, saturation: number, lightness: number): string {
  return `hsl(${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness)}%)`;
}

function getCoverGradient(id: string): string {
  const seed = hashString(id);
  const angle = Math.round(120 + coverUnit(seed) * 120);
  const hue = 225 + coverUnit(seed + 1) * 70;
  const spread = 12 + coverUnit(seed + 2) * 28;
  const saturation = 55 + coverUnit(seed + 3) * 20;
  const base = 26 + coverUnit(seed + 4) * 8;
  const stops = [0, 1, 2, 3].map((index) => {
    const stopHue = (hue + spread * (index / 3)) % 360;
    const lightness = base + index * 3 + coverUnit(seed + 5 + index) * 4;
    return `${coverColor(stopHue, saturation, lightness)} ${index * 33}%`;
  });
  const glowX = Math.round(coverUnit(seed + 9) * 100);
  const glowY = Math.round(coverUnit(seed + 10) * 100);
  const glow = coverColor(250 + coverUnit(seed + 11) * 25, 70, 58);
  return `radial-gradient(circle at ${glowX}% ${glowY}%, color-mix(in srgb, ${glow} 35%, transparent) 0%, transparent 75%), linear-gradient(${angle}deg, ${stops.join(", ")})`;
}

interface CoverIcon {
  key: string;
  url: string;
  name: string;
  left: number;
  top: number;
  rotate: number;
  size: number;
}

function buildCoverIcons(groupId: string, urls: string[]): CoverIcon[] {
  const icons: CoverIcon[] = [];
  urls.forEach((url, index) => {
    if (!url) return;
    const seed = hashString(`${groupId}-${url}`);
    icons.push({
      key: `${groupId}-${index}`,
      url,
      name: "Server",
      left: 6 + (seed % 72),
      top: 10 + ((seed >>> 8) % 48),
      rotate: (seed % 28) - 14,
      size: 52 + (seed % 22),
    });
  });
  return icons;
}

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

interface ExploreProps {
  lang: LanguageCode;
}

export default function Explore({ lang }: ExploreProps) {
  const t = useMemo(() => createTranslator(lang), [lang]);
  const exploreRedirectUri = "https://oraxbot.com/explore";
  const router = useRouter();
  const { lockScroll, unlockScroll } = useScroll();
  const [groups, setGroups] = useState<ExploreGroup[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activePlatform, setActivePlatform] = useState<
    PlatformConfig | undefined
  >(undefined);
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState("");
  const [ownedGroups, setOwnedGroups] = useState<OwnedGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isPublishMenuOpen, setIsPublishMenuOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [publishStep, setPublishStep] = useState(1); // 1 = select guild, 2 = select group
  const [viewGroup, setViewGroup] = useState<ExploreGroup | null>(null);
  const [viewGroupServers, setViewGroupServers] = useState<PublicServer[]>([]);
  const [isViewGroupServersLoading, setIsViewGroupServersLoading] =
    useState(false);
  const [viewGroupServersError, setViewGroupServersError] = useState("");

  const [isJoinMenuOpen, setIsJoinMenuOpen] = useState(false);
  const [joinStep, setJoinStep] = useState(1); // 1 = guild, 2 = channel, 3 = proposal
  const [joinGroupId, setJoinGroupId] = useState("");
  const [joinSelectedGuildId, setJoinSelectedGuildId] = useState("");
  const [joinChannels, setJoinChannels] = useState<LinkedChannel[]>([]);
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
  const [voteCooldownRefresh, setVoteCooldownRefresh] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  const [editableGroups, setEditableGroups] = useState<
    Record<string, { guildId: string; platform: string }>
  >({});

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const voteAuthHandledRef = useRef(false);
  const menuAuthHandledRef = useRef(false);
  const actionHandledRef = useRef(false);
  const hasLoadedInitialPageRef = useRef(false);

  const resolveCurrentSession = useCallback(
    (platformOverride?: PlatformConfig | null) => {
      const platform = platformOverride || detectActivePlatform();
      if (!platform) return null;
      const token = getPlatformToken(platform);
      if (!token) return null;
      return { platform, token };
    },
    [],
  );

  const redirectToLogin = useCallback(
    (
      action: "publish" | "join" | "vote" | "explore",
      groupId?: string,
    ) => {
      const targetParams = new URLSearchParams();
      targetParams.set("action", action);
      if (groupId) {
        targetParams.set("group", groupId);
      }
      const redirectPath = `/explore?${targetParams.toString()}`;
      window.location.href = `/login?redirect=${encodeURIComponent(
        redirectPath,
      )}&action=${encodeURIComponent(action)}`;
    },
    [],
  );

  const upsertGroup = useCallback((groupToUpsert: ExploreGroup) => {
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
    async (groupId: string) => {
      if (!groupId) return null;

      try {
        const res = await fetch(
          `${config.apiV2}explore_get_group?group_id=${encodeURIComponent(
            groupId,
          )}`,
        );

        if (!res.ok) return null;

        const data: ExploreGroupResponse = await res.json();
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
    async (groupId: string) => {
      if (!groupId) return false;

      let groupToOpen = groups.find(
        (group) => String(group.id) === String(groupId),
      );
      if (!groupToOpen) {
        groupToOpen = (await fetchExploreGroupById(groupId)) ?? undefined;
      }

      if (!groupToOpen) return false;

      setViewGroup(groupToOpen);
      lockScroll();
      setOpenedMenuFromLink(true);
      return true;
    },
    [groups, fetchExploreGroupById, lockScroll],
  );

  const formatVoteCountdown = useCallback((seconds: number) => {
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

  const translateError = useCallback(
    (message: string, fallback: string) => {
      const messages: Record<string, string> = {
        "Failed to submit vote": t("explore.failedToSubmitVote"),
        "Authentication failed. Please try voting again.": t(
          "explore.voteAuthenticationFailed",
        ),
        "Failed to submit your vote. Please try again.": t(
          "explore.failedToSubmitYourVote",
        ),
        "Failed to authenticate": t("explore.failedToAuthenticate"),
        "Authentication failed. Please try again.": t(
          "explore.authenticationFailed",
        ),
        "Failed to send proposal": t("explore.failedToSendProposal"),
      };
      return messages[message] || fallback;
    },
    [t],
  );

  const handleShareGroup = useCallback(async (groupId: string) => {
    if (!groupId) return;

    const groupUrl = `https://oraxbot.com/explore?group=${encodeURIComponent(
      groupId,
    )}`;

    try {
      await navigator.clipboard.writeText(groupUrl);
      setShareMessage(t("explore.groupLinkCopied"));
    } catch (e) {
      console.error("Failed to copy group link:", e);
      setShareMessage(t("explore.failedToCopyLink"));
    }
  }, [t]);

  const handleGroupImageError = useCallback((groupId: string) => {
    if (!groupId) return;

    const normalizedId = String(groupId);

    setGroups((prev) =>
      prev.map((group) =>
        String(group.id) === normalizedId
          ? {
              ...group,
              image_url: "",
            }
          : group,
      ),
    );

    setViewGroup((prev) =>
      prev && String(prev.id) === normalizedId
        ? {
            ...prev,
            image_url: "",
          }
        : prev,
    );
  }, []);

  const handleVoteGroup = useCallback(
    async (groupId: string, tokenOverride: string | null = null) => {
      if (!groupId) return;
      if (voteCooldownSeconds > 0) return;

      setIsVoting(true);
      setVoteError("");
      setVoteSuccess("");

      const session = tokenOverride
        ? resolveCurrentSession(activePlatform)
        : resolveCurrentSession();
      const token = tokenOverride || session?.token || null;
      const platform = session?.platform || activePlatform;

      if (!token || !platform) {
        setIsVoting(false);
        redirectToLogin("vote", groupId);
        return;
      }

      try {
        const res = await fetch(`${config.apiV2}explore_vote`, {
          method: "POST",
          body: JSON.stringify({
            token,
            group_id: groupId,
            platform: platform.slug,
          }),
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
          clearPlatformToken(platform);
          redirectToLogin("vote", groupId);
          return;
        }

        if (!res.ok || data?.result === false) {
          throw new Error(
            translateError(data?.message || "Failed to submit vote",               t("explore.failedToSubmitYourVote"),
            ),
          );
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

        const successMessage = t("explore.voteRecorded");
        setVoteSuccess(successMessage);
        setGlobalVoteSuccess(successMessage);
        setVoteCooldownSeconds(24 * 60 * 60);
      } catch (e) {
        console.error(e);
        setVoteError(
          e instanceof Error && e.message
              ? translateError(
                  e.message,
                  t("explore.failedToSubmitYourVote"),
                )
              : t("explore.failedToSubmitYourVote"),
        );
      } finally {
        setIsVoting(false);
      }
    },
    [
      activePlatform,
      redirectToLogin,
      resolveCurrentSession,
      t,
      translateError,
      voteCooldownSeconds,
    ],
  );

  useEffect(() => {
    if (voteCooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setVoteCooldownSeconds((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [voteCooldownSeconds]);

  const loadPage = useCallback(
    async (pageToLoad: number) => {
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

        const newGroups: ExploreGroup[] = Array.isArray(data.groups) ? data.groups : [];
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
        setError(t("explore.loadGroupsError"));
      } finally {
        setIsLoading(false);
      }
    },
    [hasMore, isLoading, t],
  );

  useEffect(() => {
    if (hasLoadedInitialPageRef.current) return;

    hasLoadedInitialPageRef.current = true;
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    if (!router.isReady) return;

    const params = new URLSearchParams(window.location.search);
    const platformSlug = params.get("platform");
    const platformFromQuery = platformSlug ? getPlatform(platformSlug) : undefined;
    if (platformFromQuery && getPlatformToken(platformFromQuery)) {
      setActivePlatformSession(platformFromQuery);
      setActivePlatform(platformFromQuery);
    } else {
      setActivePlatform(detectActivePlatform());
    }
  }, [router.isReady]);

  useEffect(() => {
    const handleAuthChange = () => {
      const nextSession = resolveCurrentSession();
      const nextPlatform = nextSession?.platform;
      setActivePlatform(nextPlatform);
      setVoteCooldownRefresh((previous) => previous + 1);
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, [resolveCurrentSession]);

  // Handle OAuth callback for vote flow: ?code=...&state=vote,<group_id>
  useEffect(() => {
    if (!router.isReady || voteAuthHandledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    const stateParam = params.get("state");
    if (!codeParam || !stateParam) {
      return;
    }

    let decodedState = stateParam;
    try {
      decodedState = decodeURIComponent(stateParam);
    } catch {}

    const stateUrl = (() => {
      try {
        return new URL(decodedState, window.location.origin);
      } catch {
        return null;
      }
    })();

    const isVoteState =
      decodedState.startsWith("vote,") ||
      stateUrl?.searchParams.get("action") === "vote";
    if (!isVoteState) return;

    const groupId = decodedState.startsWith("vote,")
      ? decodedState.split(",")[1]
      : stateUrl?.searchParams.get("group") || "";
    if (!groupId) return;

    const platformSlug = stateUrl?.searchParams.get("platform");
    const platformFromState = platformSlug ? getPlatform(platformSlug) : undefined;
    const targetPlatform = platformFromState || detectActivePlatform();
    if (!targetPlatform) return;

    voteAuthHandledRef.current = true;

    async function handleVoteAuthCallback(platform: PlatformConfig) {
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
        const data = await exchangeOauthCode(
          platform,
          codeParam!,
          exploreRedirectUri,
        );
        if (!data.access_token || data.access_token === "undefined") {
          console.error("Error during platform authentication for vote:", data);
          throw new Error("Failed to authenticate");
        }

        const expiresIn =
          typeof data.expires_in === "number" ? data.expires_in : 0;
        persistPlatformToken(
          platform,
          data.access_token,
          Math.max(expiresIn - 1000, 60),
        );
        setActivePlatform(platform);
        setVoteCooldownRefresh((previous) => previous + 1);
        await handleVoteGroup(groupId, data.access_token);
      } catch (e) {
        console.error(e);
        setVoteError(t("explore.voteAuthenticationFailed"));
        router.replace(`/explore?group=${encodeURIComponent(groupId)}`);
      } finally {
        setIsAuthLoading(false);
      }
    }

    handleVoteAuthCallback(targetPlatform);
  }, [
    router,
    router.isReady,
    handleVoteGroup,
    openGroupMenuById,
    exploreRedirectUri,
    t,
  ]);

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

    const groupId = Array.isArray(router.query.group)
      ? router.query.group[0]
      : router.query.group;
    if (!groupId) return;
    const selectedGroupId = groupId;

    let cancelled = false;

    async function openGroupFromQuery() {
      let group = groups.find((g) => String(g.id) === String(selectedGroupId));
      if (!group) {
        group = (await fetchExploreGroupById(selectedGroupId)) ?? undefined;
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
    router.query.group,
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

    const currentViewGroup = viewGroup;

    let cancelled = false;

    async function loadVoteCooldown() {
      const session = resolveCurrentSession();
      if (!session) {
        setVoteCooldownSeconds(0);
        return;
      }

      const { platform, token } = session;

      try {
        const userData = await fetchPlatformUser(platform, token);

        if ((userData as { retry_after?: number })?.retry_after) {
          const retryAfter =
            (userData as { retry_after?: number }).retry_after ?? 1;
          setTimeout(() => {
            if (!cancelled) {
              loadVoteCooldown();
            }
          }, retryAfter * 1000 + 50);
          return;
        }

        if (
          !userData ||
          (userData as { message?: string }).message === "401: Unauthorized" ||
          !userData.id
        ) {
          clearPlatformToken(platform);
          if (!cancelled) {
            setVoteCooldownSeconds(0);
          }
          return;
        }

        const voteRes = await fetch(
          `${config.apiV2}get_vote?group_id=${encodeURIComponent(
            currentViewGroup.id,
          )}&user_id=${encodeURIComponent(userData.id)}&platform=${encodeURIComponent(
            platform.slug,
          )}`,
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
  }, [viewGroup?.id, voteCooldownRefresh, resolveCurrentSession]);

  // --- Publish & Join flows: platform auth + guilds / groups selection ---

  const openPublishMenu = useCallback(
    async (
      tokenOverride: string | null = null,
      platformOverride: PlatformConfig | null = null,
    ) => {
      const session = resolveCurrentSession(platformOverride);
      const platform = platformOverride || session?.platform || activePlatform;
      const token =
        typeof tokenOverride === "string" && tokenOverride !== ""
          ? tokenOverride
          : session?.token || null;

      if (!platform || !token) {
        redirectToLogin("publish");
        return;
      }

      setActivePlatform(platform);
      lockScroll();
      setIsAuthLoading(true);
      try {
        const userGuilds = await fetchPlatformGuilds(platform, token);

        if (
          (userGuilds as unknown as { message?: string })?.message ===
          "401: Unauthorized"
        ) {
          clearPlatformToken(platform);
          redirectToLogin("publish");
          return;
        }

        if ((userGuilds as unknown as { retry_after?: number })?.retry_after) {
          const retryAfter =
            (userGuilds as unknown as { retry_after?: number }).retry_after ?? 1;
          setTimeout(() => {
            openPublishMenu(token, platform);
          }, retryAfter * 1000 + 50);
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
    },
    [activePlatform, lockScroll, redirectToLogin, resolveCurrentSession],
  );

  const openJoinMenu = useCallback(
    async (
      groupId: string,
      tokenOverride: string | null = null,
      platformOverride: PlatformConfig | null = null,
    ) => {
      if (!groupId) return;

      const session = resolveCurrentSession(platformOverride);
      const platform = platformOverride || session?.platform || activePlatform;
      const token =
        typeof tokenOverride === "string" && tokenOverride !== ""
          ? tokenOverride
          : session?.token || null;

      if (!platform || !token) {
        redirectToLogin("join", groupId);
        return;
      }

      setActivePlatform(platform);
      lockScroll();
      setIsAuthLoading(true);
      try {
        const userGuilds = await fetchPlatformGuilds(platform, token);

        if (
          (userGuilds as unknown as { message?: string })?.message ===
          "401: Unauthorized"
        ) {
          clearPlatformToken(platform);
          redirectToLogin("join", groupId);
          return;
        }

        if ((userGuilds as unknown as { retry_after?: number })?.retry_after) {
          const retryAfter =
            (userGuilds as unknown as { retry_after?: number }).retry_after ?? 1;
          setTimeout(() => {
            openJoinMenu(groupId, token, platform);
          }, retryAfter * 1000 + 50);
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
    [activePlatform, lockScroll, redirectToLogin, resolveCurrentSession],
  );

  useEffect(() => {
    if (!router.isReady || menuAuthHandledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    const stateParam = params.get("state");
    if (!codeParam || !stateParam) return;

    let decodedState = stateParam;
    try {
      decodedState = decodeURIComponent(stateParam);
    } catch {}

    const stateUrl = (() => {
      try {
        return new URL(decodedState, window.location.origin);
      } catch {
        return null;
      }
    })();

    const isPublishState =
      decodedState === "publish" ||
      stateUrl?.searchParams.get("action") === "publish";
    const isJoinState =
      decodedState.startsWith("join,") ||
      stateUrl?.searchParams.get("action") === "join";
    if (!isPublishState && !isJoinState) return;

    const joinGroupIdFromState = decodedState.startsWith("join,")
      ? decodedState.split(",")[1] || ""
      : stateUrl?.searchParams.get("group") || "";

    const platformSlug = stateUrl?.searchParams.get("platform");
    const platformFromState = platformSlug ? getPlatform(platformSlug) : undefined;
    const platform =
      platformFromState || detectActivePlatform() || getPlatform("discord");
    if (!platform) return;

    menuAuthHandledRef.current = true;

    async function handleMenuAuthCallback(targetPlatform: PlatformConfig) {
      setIsAuthLoading(true);
      setJoinError("");

      try {
        const data = await exchangeOauthCode(
          targetPlatform,
          codeParam!,
          exploreRedirectUri,
        );
        if (!data.access_token || data.access_token === "undefined") {
          throw new Error("Failed to authenticate");
        }

        const expiresIn =
          typeof data.expires_in === "number" ? data.expires_in : 0;
        persistPlatformToken(
          targetPlatform,
          data.access_token,
          Math.max(expiresIn - 1000, 60),
        );
        setActivePlatform(targetPlatform);
        setVoteCooldownRefresh((previous) => previous + 1);

        await router.replace("/explore", undefined, { shallow: true });

        if (isPublishState) {
          await openPublishMenu(data.access_token, targetPlatform);
        } else if (isJoinState && joinGroupIdFromState) {
          await openJoinMenu(
            joinGroupIdFromState,
            data.access_token,
            targetPlatform,
          );
        }
      } catch (e) {
        console.error(e);
        if (isJoinState) {
           setJoinError(t("explore.authenticationFailed"));
        }
        router.replace("/explore", undefined, { shallow: true });
      } finally {
        setIsAuthLoading(false);
      }
    }

    handleMenuAuthCallback(platform);
  }, [
    router,
    router.isReady,
    openPublishMenu,
    openJoinMenu,
    exploreRedirectUri,
    t,
  ]);

  useEffect(() => {
    if (!router.isReady || actionHandledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("code")) return;

    const action = params.get("action");
    if (action !== "publish" && action !== "join" && action !== "vote") return;

    const groupIdFromQuery = params.get("group") || "";
    const platformSlug = params.get("platform");
    const platformFromQuery = platformSlug ? getPlatform(platformSlug) : undefined;

    const session = resolveCurrentSession(platformFromQuery);
    if (!session) return;

    actionHandledRef.current = true;
    setActivePlatformSession(session.platform, session.token);
    setActivePlatform(session.platform);

    async function handlePostLoginAction(
      resolvedPlatform: PlatformConfig,
      resolvedToken: string,
    ) {
      if (action === "publish") {
        await router.replace("/explore", undefined, { shallow: true });
        await openPublishMenu(resolvedToken, resolvedPlatform);
        return;
      }

      if (action === "join" && groupIdFromQuery) {
        await router.replace("/explore", undefined, { shallow: true });
        await openJoinMenu(groupIdFromQuery, resolvedToken, resolvedPlatform);
        return;
      }

      if (action === "vote" && groupIdFromQuery) {
        const opened = await openGroupMenuById(groupIdFromQuery);
        if (!opened) {
          setPendingVoteGroupId(groupIdFromQuery);
        }
        await router.replace(
          `/explore?group=${encodeURIComponent(groupIdFromQuery)}`,
          undefined,
          { shallow: true },
        );
        await handleVoteGroup(groupIdFromQuery, resolvedToken);
      }
    }

    void handlePostLoginAction(session.platform, session.token);
  }, [
    router,
    router.isReady,
    openPublishMenu,
    openJoinMenu,
    openGroupMenuById,
    handleVoteGroup,
    resolveCurrentSession,
  ]);

  useEffect(() => {
    async function loadOwnedGroups() {
      if (!selectedGuildId) {
        setOwnedGroups([]);
        setSelectedGroupId("");
        return;
      }

      const session = resolveCurrentSession(activePlatform);

      try {
        const res = await fetch(`${config.apiV2}get_server_data`, {
          method: "POST",
          body: JSON.stringify({
            guildId: selectedGuildId,
            token: session?.token,
            platform: session?.platform.slug,
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
  }, [
    activePlatform,
    isPublishMenuOpen,
    publishStep,
    resolveCurrentSession,
    selectedGuildId,
  ]);

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

      const session = resolveCurrentSession(activePlatform);

      try {
        const res = await fetch(`${config.apiV2}get_guild_channels`, {
          method: "POST",
          body: JSON.stringify({
            guildId: joinSelectedGuildId,
            platform: session?.platform.slug,
          }),
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
  }, [
    activePlatform,
    isJoinMenuOpen,
    joinStep,
    joinSelectedGuildId,
    resolveCurrentSession,
  ]);

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
    setOpenedMenuFromLink(false);
    setVoteError("");
    setVoteSuccess("");
    setShareMessage("");
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

    const groupId = String(viewGroup.id);

    lockScroll();
    let cancelled = false;

    async function loadViewGroupServers() {
      setIsViewGroupServersLoading(true);
      setViewGroupServersError("");

      try {
        const res = await fetch(
          `${config.apiV2}get_group_public_servers?group_id=${encodeURIComponent(
            groupId,
          )}`,
        );
        const data = await res.json();

        if (!res.ok || !data?.result) {
          throw new Error("Failed to load public servers");
        }

        if (!cancelled) {
          const serversList = Array.isArray(data.servers) ? data.servers : [];
          setViewGroupServers(serversList);
          setViewGroup((prev) =>
            prev && String(prev.id) === groupId
              ? { ...prev, server_count: serversList.length }
              : prev,
          );
          setGroups((prev) =>
            prev.map((g) =>
              String(g.id) === groupId
                ? { ...g, server_count: serversList.length }
                : g,
            ),
          );
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setViewGroupServers([]);
          setViewGroupServersError(
            t("explore.failedToLoadServers"),
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
      unlockScroll();
    };
  }, [viewGroup?.id, lockScroll, unlockScroll]);

  useEffect(() => {
    let cancelled = false;

    async function loadEditableGroups() {
      const sessions = platformList
        .map((platform) => {
          const token = getPlatformToken(platform);
          return token ? { platform, token } : null;
        })
        .filter(
          (session): session is { platform: PlatformConfig; token: string } =>
            session !== null,
        );

      if (sessions.length === 0) {
        if (!cancelled) setEditableGroups({});
        return;
      }

      const matches: Record<string, { guildId: string; platform: string }> =
        {};

      await Promise.all(
        sessions.map(async ({ platform, token }) => {
          let userGuilds: DiscordGuild[] = [];
          try {
            const fetched = await fetchPlatformGuilds(platform, token);
            if (!Array.isArray(fetched)) return;
            userGuilds = fetched.filter((guild) => platform.isAdmin(guild));
          } catch (e) {
            console.error("Failed to load guilds for explore edit:", e);
            return;
          }

          await Promise.all(
            userGuilds.map(async (guild) => {
              try {
                const res = await fetch(`${config.apiV2}get_server_data`, {
                  method: "POST",
                  body: JSON.stringify({
                    guildId: guild.id,
                    token,
                    platform: platform.slug,
                  }),
                  headers: { "Content-Type": "application/json" },
                });
                const data: OwnedGroupsResponse = await res.json();
                if (!Array.isArray(data.ownedGroups)) return;
                for (const group of data.ownedGroups) {
                  if (!group?.id || matches[String(group.id)]) continue;
                  matches[String(group.id)] = {
                    guildId: guild.id,
                    platform: platform.slug,
                  };
                }
              } catch (e) {
                console.error("Failed to load owned groups for explore edit:", e);
              }
            }),
          );
        }),
      );

      if (!cancelled) setEditableGroups(matches);
    }

    loadEditableGroups();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEditGroup = (groupId: string) => {
    const editable = editableGroups[String(groupId)];
    if (!editable) return;
    unlockScroll();
    const params = new URLSearchParams();
    params.set("guild", editable.guildId);
    params.set("platform", editable.platform);
    router.push(`/explore/publish/${groupId}?${params.toString()}`);
  };

  const handleConfirmPublishGroup = (groupId?: string) => {
    const idToUse = groupId || selectedGroupId;
    if (!idToUse) return;
    const params = new URLSearchParams();
    if (selectedGuildId && selectedGuildId !== "") {
      params.set("guild", selectedGuildId);
    }
    const platformSlug =
      activePlatform?.slug || detectActivePlatform()?.slug || "";
    if (platformSlug) {
      params.set("platform", platformSlug);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.push(`/explore/publish/${idToUse}${query}`);
  };

  const handleSubmitJoinProposal = async () => {
    if (!joinGroupId || !joinSelectedGuildId || !joinSelectedChannelId) {
        setJoinError(t("explore.selectServerChannelFirst"));
      return;
    }

    setIsJoinSubmitting(true);
    setJoinError("");
    setJoinSuccess("");

    try {
      const session = resolveCurrentSession(activePlatform);
      const body = {
        group_id: joinGroupId,
        guild_id: joinSelectedGuildId,
        channel_id: joinSelectedChannelId,
        description: joinDescription,
        platform: session?.platform.slug,
        token: session?.token,
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
         throw new Error(
           translateError(data?.error || "Failed to send proposal", t("explore.failedToSendProposal")),
         );
      }

       setJoinSuccess(t("explore.proposalSent"));
      setJoinStep(3);
    } catch (e) {
      console.error(e);
       setJoinError(t("explore.failedToSendYourProposal"));
    } finally {
      setIsJoinSubmitting(false);
    }
  };

  const title = t("explore.metaTitle");
  const description = t("explore.metaDescription");

  return (
    <>
      <LocalizedHead
        lang={lang}
        path="/explore"
        title={title}
        description={description}
        keywords={t("explore.metaKeywords")}
        imageAlt={t("explore.ogImageAlt")}
      />
      <Header theme="dark" lang={lang} />
      <main className={styles.main}>
        <section className={styles.header}>
          <h1 className={styles.title}>
            {t("explore.pageTitle")}
            <BetaTag />
          </h1>
          <p className={styles.subtitle}>
            {t("explore.pageSubtitle")}
          </p>
          <button
            type="button"
            className={styles.publishButton}
            onClick={() => openPublishMenu()}
            disabled={isAuthLoading}
          >
            {isAuthLoading
              ? t("explore.connecting", {
                  platform: activePlatform ? ` ${activePlatform.label}` : "",
                })
              : t("explore.publishGroup")}
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
              {Number(group.vote) > 0 && (
                <div className={styles.cardVoteBadge}>
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={styles.cardVoteIcon}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                    />
                  </svg>
                  <span>{Number(group.vote) || 0}</span>
                </div>
              )}
              {group.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={group.image_url}
                  alt={group.name}
                  className={styles.cardImage}
                  loading="lazy"
                  decoding="async"
                  onError={() => handleGroupImageError(group.id)}
                />
              ) : (
                <div
                  className={styles.cardCover}
                  style={{ background: getCoverGradient(group.id) }}
                  aria-hidden="true"
                >
                  {buildCoverIcons(group.id, group.server_icons ?? []).map(
                    (icon) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={icon.key}
                        src={icon.url}
                        alt=""
                        className={styles.coverIcon}
                        style={{
                          left: `${icon.left}%`,
                          top: `${icon.top}%`,
                          width: icon.size,
                          height: icon.size,
                          transform: `rotate(${icon.rotate}deg)`,
                        }}
                      />
                    ),
                  )}
                  {(group.server_icons ?? []).length === 0 && (
                    <span>{getGroupInitials(group.name)}</span>
                  )}
                </div>
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
                    <span>{t("explore.servers", { count: group.server_count || 0 })}</span>
                  </p>
                  <p className={styles.cardMeta}>
                    <span>{t("explore.messagesThisMonth", { count: group.message_count || 0 })}</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
          {groups.length === 0 && !isLoading && !error && (
            <p className={styles.empty}>{t("explore.noPublicGroups")}</p>
          )}
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <div ref={sentinelRef} className={styles.sentinel} />

        {isLoading && <p className={styles.loading}>{t("explore.loadingMore")}</p>}

        {!hasMore && groups.length > 0 && (
          <p className={styles.end}>{t("explore.reachedEnd")}</p>
        )}

        {viewGroup && (
          <div className={styles.groupOverlay} onClick={closeViewGroup}>
            <div
              className={styles.groupPanel}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.groupDetails}>
                {viewGroup.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={viewGroup.image_url}
                    alt={viewGroup.name}
                    className={styles.groupImage}
                    onError={() => handleGroupImageError(viewGroup.id)}
                  />
                ) : (
                  <div
                    className={styles.groupCover}
                    style={{ background: getCoverGradient(viewGroup.id) }}
                    aria-hidden="true"
                  >
                    {getGroupInitials(viewGroup.name)}
                  </div>
                )}
                <div className={styles.groupContent}>
                  <h2 className={styles.groupTitle}>{viewGroup.name}</h2>
                  {(viewGroup.server_count || viewGroup.member_count) && (
                    <p className={styles.groupMeta}>
                      {viewGroup.server_count ? (
                        <span>{t("explore.servers", { count: viewGroup.server_count })}</span>
                      ) : null}
                      {viewGroup.server_count && viewGroup.member_count ? (
                        <span className={styles.dot}>•</span>
                      ) : null}
                      {viewGroup.member_count ? (
                        <span>{t("explore.members", { count: viewGroup.member_count })}</span>
                      ) : null}
                    </p>
                  )}
                  {viewGroup.description && (
                    <p className={styles.groupDescriptionFull}>
                      {viewGroup.description}
                    </p>
                  )}

                  <div className={styles.publicServersSection}>
                    <h3 className={styles.publicServersTitle}>{t("explore.serversTitle")}</h3>

                    {isViewGroupServersLoading && (
                      <p className={styles.publicServersLoading}>
                        {t("explore.loadingServers")}
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
                          {t("explore.noServersListed")}
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
                                : server.platform === "fluxer"
                                  ? `https://fluxer.gg/${server.invite}`
                                  : server.platform === "telegram"
                                    ? server.invite
                                    : `https://discord.gg/${server.invite}`
                              : null;
                            const displayName =
                              server.displayName ||
                              server.guildName ||
                              t("explore.unknownServer");
                            const iconUrl = server.icon
                              ? server.icon.startsWith("http")
                                ? server.icon
                                : server.platform === "fluxer"
                                  ? `https://fluxerusercontent.com/icons/${server.guildId}/${server.icon}.webp?size=160`
                                  : `https://cdn.discordapp.com/icons/${server.guildId}/${server.icon}.webp?size=160&quality=lossless`
                              : null;

                            return (
                              <div
                                key={
                                  `${server.platform || "discord"}-${server.guildId}` ||
                                  `${displayName}-${inviteUrl}`
                                }
                                className={styles.publicServerCard}
                              >
                                <GuildIcon
                                  iconUrl={iconUrl}
                                  name={displayName}
                                  className={styles.publicServerIcon}
                                />

                                <div className={styles.publicServerInfo}>
                                  <p className={styles.publicServerName}>
                                    {displayName}
                                  </p>
                                  {server.guildName &&
                                    server.guildName !== displayName && (
                                      <p
                                        className={styles.publicServerGuildName}
                                      >
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
                                     {t("explore.join")}

                                  </a>
                                ) : (
                                  <span className={styles.publicServerNoInvite}>
                                     {t("explore.noInvite")}

                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </div>
              </div>
              {(voteError || voteSuccess) && (
                <p
                  className={voteError ? styles.voteError : styles.voteSuccess}
                >
                  {voteError || voteSuccess}
                </p>
              )}
              {shareMessage && (
                <p
                  className={
                    shareMessage.startsWith("Failed")
                      ? styles.voteError
                      : styles.voteSuccess
                  }
                >
                  {shareMessage}
                </p>
              )}
              <div className={styles.groupActions}>
                <button
                  type="button"
                  className={styles.groupCloseMobile}
                  onClick={closeViewGroup}
                >
                   {t("explore.close")}

                </button>
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
                     ? t("explore.voting")
                     : voteCooldownSeconds > 0
                       ? t("explore.voteIn", {
                           time: formatVoteCountdown(voteCooldownSeconds),
                           count: Number(viewGroup?.vote) || 0,
                         })
                       : t("explore.vote", {
                           count: Number(viewGroup?.vote) || 0,
                         })}
                </button>
                <button
                  type="button"
                  className={styles.groupShareButton}
                  onClick={() => handleShareGroup(viewGroup.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={styles.groupShareIcon}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                    />
                  </svg>
                   {t("explore.share")}

                </button>
                <button
                  type="button"
                  className={styles.groupCloseDesktop}
                  onClick={closeViewGroup}
                  id="desktop"
                >
                   {t("explore.close")}

                </button>
                {editableGroups[String(viewGroup.id)] && (
                  <button
                    type="button"
                    className={styles.groupEditButton}
                    onClick={() => handleEditGroup(viewGroup.id)}
                  >
                     {t("explore.edit")}

                  </button>
                )}
                <button
                  type="button"
                  className={styles.groupJoinButton}
                  onClick={() => {
                    openJoinMenu(viewGroup.id);
                    closeViewGroup();
                  }}
                  disabled={isAuthLoading}
                >
                   {isAuthLoading
                     ? t("explore.connecting", {
                         platform: activePlatform ? ` ${activePlatform.label}` : "",
                       })
                     : t("explore.joinGroup")}
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
                aria-label={t("explore.closePublishMenu")}
              >
                ×
              </button>

              {publishStep === 1 && (
                <>
                  <div className={styles.publishHeader}>
                    <h2>{t("explore.selectServer")}</h2>
                    <p>
                      {t("explore.publishServerDescription", {
                        platform: activePlatform?.label || "",
                      })}
                    </p>
                  </div>
                  <div className={styles.guildGrid}>
                    {guilds.map((g) =>
                      (activePlatform ? activePlatform.isAdmin(g) : false) ? (
                        <button
                          key={g.id}
                          type="button"
                          className={styles.guildCard}
                          onClick={() => {
                            setSelectedGuildId(g.id);
                            setPublishStep(2);
                          }}
                        >
                          <GuildIcon
                            iconUrl={
                              activePlatform
                                ? activePlatform.getGuildIconUrl(g)
                                : null
                            }
                            name={g.name}
                            className={styles.guildIcon}
                          />
                          <span className={styles.guildName}>{g.name}</span>
                        </button>
                      ) : null,
                     )}
                    {guilds.length === 0 && (
                      <p className={styles.empty}>
                        {t("explore.noServersFound", {
                          platform: activePlatform?.label || "",
                        })}
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
                       ← {t("explore.back")}
                    </button>
                    <h2>{t("explore.selectGroup")}</h2>
                    <p>
                      {t("explore.selectGroupDescription")}
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
                         {t("explore.noOwnedGroups")}
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
                aria-label={t("explore.closeJoinMenu")}
              >
                ×
              </button>

              {joinStep === 1 && (
                <>
                  <div className={styles.publishHeader}>
                    <h2>{t("explore.selectServer")}</h2>
                    <p>
                      {t("explore.joinServerDescription", {
                        platform: activePlatform?.label || "",
                      })}
                    </p>
                  </div>
                  <div className={styles.guildGrid}>
                    {guilds.map((g) =>
                      (activePlatform ? activePlatform.isAdmin(g) : false) ? (
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
                          <GuildIcon
                            iconUrl={
                              activePlatform
                                ? activePlatform.getGuildIconUrl(g)
                                : null
                            }
                            name={g.name}
                            className={styles.guildIcon}
                          />
                          <span className={styles.guildName}>{g.name}</span>
                        </button>
                      ) : null,
                     )}
                    {guilds.length === 0 && (
                      <p className={styles.empty}>
                        {t("explore.noServersFound", {
                          platform: activePlatform?.label || "",
                        })}
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
                       ← {t("explore.back")}
                    </button>
                    <h2>{t("explore.selectChannel")}</h2>
                    <p>
                       {t("explore.selectChannelDescription")}
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
                         {t("explore.noChannelsFound")}
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
                       ← {t("explore.back")}
                    </button>
                    <h2>{t("explore.writeProposal")}</h2>
                    <p>
                       {t("explore.proposalDescription")}
                    </p>
                  </div>

                  <textarea
                    className={styles.joinTextarea}
                    value={joinDescription}
                    onChange={(event) =>
                      setJoinDescription(event.target.value.slice(0, 1500))
                    }
                    placeholder={t("explore.proposalPlaceholder")}
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
                           ? t("explore.sendingProposal")
                           : t("explore.sendProposal")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer theme="dark" lang={lang} />
    </>
  );
}
