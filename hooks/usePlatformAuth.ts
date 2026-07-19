import { useEffect, useState } from "react";
import type { PlatformConfig } from "../utils/platforms/types";
import type { DiscordUser, Guild } from "../types";
import { getCookie } from "../utils/cookies";
import { getStorage, removeStorage } from "../utils/storage";
import { notify } from "../components/ui/NotificationSystem";
import {
  cachePlatformSession,
  exchangeOauthCode,
  fetchPlatformGuilds,
  fetchPlatformUser,
  filterAdminGuilds,
  persistPlatformToken,
} from "../utils/platforms/oauth";

export interface PlatformAuthState {
  user: DiscordUser | undefined;
  guilds: Guild[];
  loading: boolean;
}

export interface UsePlatformAuthResult extends PlatformAuthState {
  /**
   * Refetch the user profile + guilds from the platform API using the
   * token currently stored in the cookie. No-op when no token is set.
   */
  reload: () => void;
}

/**
 * Drives the OAuth flow for a platform dashboard page:
 *  - On mount, restores cached profile data so the UI can paint instantly.
 *  - If a `?code=` param is present, exchanges it for a token via the bot
 *    API and persists it in the platform cookie.
 *  - Loads the user profile + admin guilds from the platform's REST API.
 *  - Handles the `?state=` redirect target after a successful login.
 *
 * Returning the raw platform user/guild payloads lets each caller decide
 * how to render them.
 */
export function usePlatformAuth(platform: PlatformConfig): UsePlatformAuthResult {
  const [state, setState] = useState<PlatformAuthState>({
    user: undefined,
    guilds: [],
    loading: true,
  });
  const [reloadCounter, setReloadCounter] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const cachedUserRaw = getStorage(platform.cachedUserStorageKey);
    const cachedGuildsRaw = getStorage(platform.cachedGuildsStorageKey);
    if (cachedUserRaw && cachedGuildsRaw) {
      try {
        const cachedUser = JSON.parse(cachedUserRaw) as DiscordUser;
        const cachedGuilds = JSON.parse(cachedGuildsRaw) as Guild[];
        if (!cancelled) {
          setState({
            user: cachedUser,
            guilds: cachedGuilds,
            loading: false,
          });
        }
      } catch (error) {
        console.error(`Error parsing cached data for ${platform.slug}:`, error);
        removeStorage(platform.cachedUserStorageKey);
        removeStorage(platform.cachedGuildsStorageKey);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const stateTarget = params.get("state");
    const existingToken = getCookie(platform.cookieName);

    if (code) {
      exchangeOauthCode(platform, code)
        .then((response) => {
          if (cancelled) return;
          if (!response.access_token || response.access_token === "undefined") {
            notify.error(
              "Login Failed",
              "Invalid authentication response. Redirecting...",
            );
            setTimeout(() => {
              window.location.href = `/dashboard/${platform.slug}`;
            }, 2000);
            return;
          }

          const expiresIn =
            typeof response.expires_in === "number" ? response.expires_in : 0;
          persistPlatformToken(
            platform,
            response.access_token,
            Math.max(expiresIn - 1000, 60),
          );

          if (stateTarget) {
            window.location.href = stateTarget;
            return;
          }

          loadUserData(response.access_token);
        })
        .catch(() => {
          if (cancelled) return;
          notify.error(
            "Login Failed",
            "Unable to complete authentication. Please try again.",
          );
          setTimeout(() => {
            window.location.href = `/dashboard/${platform.slug}`;
          }, 3000);
        });
      return;
    }

    if (!existingToken || existingToken === "undefined") {
      // No session: bounce to the platform's OAuth authorize URL. We embed
      // the destination in `state` so /dashboard (the redirect_uri) knows
      // which platform to exchange the code with and where to send the
      // user afterwards.
      const target = `/dashboard/${platform.slug}`;
      const stateParam = encodeURIComponent(target);
      const sep = platform.authorizeUrl.includes("?") ? "&" : "?";
      window.location.href = `${platform.authorizeUrl}${sep}state=${stateParam}`;
      return;
    }

    loadUserData(existingToken);

    async function loadUserData(token: string) {
      try {
        const user = await fetchPlatformUser(platform, token);

        if ((user as { retry_after?: number }).retry_after) {
          const retryAfter = (user as { retry_after?: number }).retry_after ?? 1;
          window.setTimeout(() => loadUserData(token), retryAfter * 1000 + 50);
          return;
        }

        if ((user as { message?: string }).message === "401: Unauthorized") {
          persistPlatformToken(platform, "", 0);
          window.location.href = `/dashboard/${platform.slug}`;
          return;
        }

        if (!cancelled) setState((prev) => ({ ...prev, user }));

        try {
          const allGuilds = await fetchPlatformGuilds(platform, token);
          if (cancelled) return;

          if (
            (allGuilds as unknown as { retry_after?: number }).retry_after
          ) {
            const retryAfter =
              (allGuilds as unknown as { retry_after?: number }).retry_after ??
              1;
            window.setTimeout(() => loadUserData(token), retryAfter * 1000 + 50);
            return;
          }

          if (Array.isArray(allGuilds)) {
            const adminGuilds = filterAdminGuilds(platform, allGuilds);
            cachePlatformSession(platform, user, adminGuilds);
            if (!cancelled) {
              setState({ user, guilds: adminGuilds, loading: false });
            }
          } else if (!cancelled) {
            setState({ user, guilds: [], loading: false });
          }
        } catch {
          if (!cancelled) {
            notify.error(
              "Data Loading Failed",
              `Unable to load your ${platform.label} guilds. Please try refreshing the page.`,
            );
            setState((prev) => ({ ...prev, loading: false }));
          }
        }
      } catch {
        if (!cancelled) {
          notify.error(
            "Data Loading Failed",
            `Unable to load your ${platform.label} profile. Please try refreshing the page.`,
          );
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    }
  }, [platform, reloadCounter]);

  const reload = () => setReloadCounter((c) => c + 1);

  return { ...state, reload };
}
