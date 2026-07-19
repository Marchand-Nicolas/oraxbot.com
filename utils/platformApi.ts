import { useRouter } from "next/router";
import { useCallback } from "react";
import config from "./config.json";
import { getCookie } from "./cookies";
import { getPlatform } from "./platforms";

/**
 * Dashboard API helper.
 *
 * Every bot-API request needs two fields: the user's OAuth `token` (read
 * from the per-platform cookie) and the active `platform` slug (so the
 * backend can talk to the right provider). This hook centralises that so
 * call sites don't have to repeat `token: getCookie("token")` everywhere.
 *
 * Usage:
 *   const api = usePlatformApi();
 *   api.post("get_admin_group_data", { groupId, guildId });
 *
 * The token+platform are merged in automatically. The caller only passes
 * the request-specific fields.
 */
export function usePlatformApi() {
  const router = useRouter();
  const platformSlug =
    typeof router.query.platform === "string" ? router.query.platform : undefined;

  return useCallback(
    <T = unknown>(
      endpoint: string,
      body: Record<string, unknown> = {},
      options: { method?: "POST" | "GET" | "PUT" | "DELETE" } = {},
    ): Promise<T> => {
      const platform = platformSlug ? getPlatform(platformSlug) : undefined;
      const token = getCookie(platform?.cookieName ?? "token");
      const method = options.method ?? "POST";

      const payload = {
        token,
        platform: platform?.slug,
        ...body,
      };

      return fetch(`${config.apiV2}${endpoint}`, {
        method,
        body: method === "GET" ? undefined : JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json() as Promise<T>);
    },
    [platformSlug],
  );
}

/**
 * Non-hook variant for code that can't use hooks (e.g. top-level handlers).
 * Looks up the platform slug from the current URL.
 *
 * `endpoint` may be either a bare route name (e.g. "get_admin_group_data")
 * or a full URL — so existing call sites that store full URLs in variables
 * keep working unchanged.
 */
export function platformApi<T = unknown>(
  endpoint: string,
  body: Record<string, unknown> = {},
  options: { method?: "POST" | "GET" | "PUT" | "DELETE" } = {},
): Promise<T> {
  const platform = getCurrentPlatform();
  const token = getCookie(platform?.cookieName ?? "token");
  const method = options.method ?? "POST";

  const payload = {
    token,
    platform: platform?.slug,
    ...body,
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${config.apiV2}${endpoint}`;

  return fetch(url, {
    method,
    body: method === "GET" ? undefined : JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json() as Promise<T>);
}

/** Read the active platform config from the current URL. */
export function getCurrentPlatform() {
  if (typeof window === "undefined") return undefined;
  const match = window.location.pathname.match(/^\/dashboard\/([^/]+)/);
  if (!match) return undefined;
  return getPlatform(match[1]);
}
