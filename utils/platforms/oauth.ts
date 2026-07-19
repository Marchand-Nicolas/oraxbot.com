import config from "../config.json";
import type { PlatformConfig } from "./types";
import type { DiscordUser, Guild } from "../../types";
import { setCookie } from "../cookies";
import { setStorage } from "../storage";

/** Shape returned by the orax bot's `exchange_oauth_code` endpoint. */
export interface TokenExchangeResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  message?: string;
  result?: boolean;
  error?: number;
}

/**
 * Exchange an OAuth authorization code for an access token via the orax
 * bot API. Works for every platform registered in the dashboard.
 */
export async function exchangeOauthCode(
  platform: PlatformConfig,
  code: string,
  redirectUri?: string,
): Promise<TokenExchangeResponse> {
  const res = await fetch(`${config.apiV2}exchange_oauth_code`, {
    method: "POST",
    body: JSON.stringify({
      platform: platform.slug,
      token: code,
      redirect_uri: redirectUri,
    }),
    headers: { "Content-Type": "application/json" },
  });
  return (await res.json()) as TokenExchangeResponse;
}

/**
 * Persist an access token for the active platform.
 *
 * Writes both the per-platform cookie (so the login page can detect the
 * active session) and the shared `token` cookie (so existing components
 * that call `getCookie("token")` keep working without modification).
 */
export function persistPlatformToken(
  platform: PlatformConfig,
  token: string,
  expiresInSeconds: number,
): void {
  setCookie(platform.cookieName, token, expiresInSeconds);
  setCookie("token", token, expiresInSeconds);
}

/** Clear every cookie tied to a platform session. Useful at logout time. */
export function clearPlatformToken(platform: PlatformConfig): void {
  setCookie(platform.cookieName, "", 0);
  setCookie("token", "", 0);
}

/** Fetch the logged-in user profile from the platform's REST API. */
export async function fetchPlatformUser(
  platform: PlatformConfig,
  token: string,
): Promise<DiscordUser> {
  return fetchPlatformResource(platform, token, "user") as Promise<DiscordUser>;
}

/** Fetch the logged-in user's guild list from the platform's REST API. */
export async function fetchPlatformGuilds(
  platform: PlatformConfig,
  token: string,
): Promise<Guild[]> {
  return fetchPlatformResource(platform, token, "guilds") as Promise<Guild[]>;
}

/**
 * Internal helper that routes the request either directly to the
 * provider (Discord-style APIs with CORS) or through the bot's
 * `proxy_platform_api` endpoint (Fluxer-style APIs without CORS).
 */
async function fetchPlatformResource(
  platform: PlatformConfig,
  token: string,
  resource: "user" | "guilds",
): Promise<unknown> {
  if (platform.proxyThroughBackend) {
    const res = await fetch(`${config.apiV2}proxy_platform_api`, {
      method: "POST",
      body: JSON.stringify({
        platform: platform.slug,
        token,
        resource,
      }),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  }

  const url = resource === "user" ? platform.userEndpoint : platform.guildsEndpoint;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: "Bearer " + token,
    },
  });
  return res.json();
}

/**
 * Filter the raw guild list from a platform to only the guilds the user
 * can administer. Cached locally so we don't refetch on every page load.
 */
export function filterAdminGuilds(
  platform: PlatformConfig,
  guilds: Guild[],
): Guild[] {
  return guilds
    .filter((guild) => platform.isAdmin(guild))
    .map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      owner: guild.owner,
      permissions: guild.permissions,
      permissions_new: guild.permissions_new,
    }));
}

/** Cache the user profile + admin guild list in localStorage. */
export function cachePlatformSession(
  platform: PlatformConfig,
  user: DiscordUser,
  adminGuilds: Guild[],
): void {
  setStorage(platform.cachedUserStorageKey, JSON.stringify(user));
  setStorage(platform.cachedGuildsStorageKey, JSON.stringify(adminGuilds));
}
