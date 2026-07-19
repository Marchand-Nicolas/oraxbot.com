import type { DiscordGuild } from "../../types";

/**
 * Shared shape describing how the dashboard talks to a chat platform.
 *
 * Adding a new platform only requires creating a new entry that implements
 * this interface and registering it in `platforms.ts`.
 */
export interface PlatformConfig {
  /** URL slug, e.g. "discord", "fluxer". Used in routes and cookies. */
  slug: string;
  /** Display name shown in buttons and labels. */
  label: string;
  /** Brand color used for the login button background. */
  brandColor: string;
  /** Optional accent gradient for buttons (CSS). */
  brandGradient?: string;
  /** Path under /public for the platform logo. */
  logoPath: string;

  /**
   * Full OAuth2 authorize URL the user is redirected to in order to log in.
   * The redirect_uri should point back at "/dashboard".
   */
  authorizeUrl: string;

  /**
   * Provider-side endpoints used to load the logged-in user's profile and
   * guild list after the OAuth code has been exchanged for a token.
   *
   * When `proxyThroughBackend` is false, the dashboard calls these URLs
   * directly from the browser. When true (because the provider's API
   * does not send CORS headers), the request is routed through the bot's
   * `proxy_platform_api` endpoint instead.
   */
  userEndpoint: string;
  guildsEndpoint: string;
  proxyThroughBackend: boolean;

  /** Whether this platform's guild payloads expose `permissions_new`. */
  hasPermissionFlags: boolean;

  /**
   * Returns true when the user is an administrator of the given guild on
   * this platform.
   */
  isAdmin: (guild: DiscordGuild) => boolean;

  /**
   * Build the URL used as the `src` of a guild icon `<img>`.
   * Returns null when the guild has no icon (caller falls back to a default).
   */
  getGuildIconUrl: (guild: { id: string; icon: string | null }) => string | null;

  /** URL of the fallback icon shown for guilds without one. */
  defaultGuildIconUrl: string;

  /**
   * CDN-style URL template used for full-bleed backgrounds in the dashboard.
   * Returns null when no background image is available.
   */
  getGuildBackgroundUrl: (guild: {
    id: string;
    icon: string | null;
  }) => string | null;

  /** Cookie name where the OAuth access token is stored for this platform. */
  cookieName: string;

  /** localStorage keys used to cache profile data between page loads. */
  cachedUserStorageKey: string;
  cachedGuildsStorageKey: string;
}
