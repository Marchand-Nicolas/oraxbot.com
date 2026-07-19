import type { PlatformConfig } from "./types";
import type { DiscordGuild } from "../../types";

const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "https://oraxbot.com";

const redirectUri = `${encodeURIComponent(WEBSITE_URL)}%2Fdashboard`;

/**
 * Fluxer's API mirrors Discord's REST shape. Guilds expose a numeric
 * `permissions` bitfield where the administrator bit (0x8) lives at the
 * same position as Discord's. We treat users as admins when their
 * `permissions` value has bit 0x8 set.
 */
function isAdmin(guild: DiscordGuild): boolean {
  const raw =
    guild?.permissions_new ?? guild?.permissions ?? undefined;
  if (raw === undefined || raw === null) return false;
  try {
    const perms =
      typeof raw === "bigint"
        ? raw
        : BigInt(raw as string | number);
    return (perms & 0x8n) !== 0n;
  } catch {
    return false;
  }
}

const fluxer: PlatformConfig = {
  slug: "fluxer",
  label: "Fluxer",
  brandColor: "#ff7a59",
  brandGradient: "linear-gradient(135deg, #ff7a59 0%, #ff4d4d 100%)",
  logoPath: "/assets/platforms/fluxer.svg",

  authorizeUrl: `https://web.fluxer.app/oauth2/authorize?client_id=1527278943076352000&scope=identify+guilds&redirect_uri=${redirectUri}&response_type=code`,

  userEndpoint: "https://api.fluxer.app/v1/users/@me",
  guildsEndpoint: "https://api.fluxer.app/v1/users/@me/guilds",

  hasPermissionFlags: true,
  isAdmin,

  getGuildIconUrl: ({ id, icon }) =>
    icon
      ? `https://cdn.fluxer.app/icons/${id}/${icon}.webp?size=96`
      : null,
  defaultGuildIconUrl: "/assets/default_guild_icon.jpg",

  getGuildBackgroundUrl: ({ id, icon }) =>
    icon
      ? `https://cdn.fluxer.app/icons/${id}/${icon}.webp?size=96`
      : null,

  cookieName: "token_fluxer",
  cachedUserStorageKey: "cachedUserDatas_fluxer",
  cachedGuildsStorageKey: "cachedGuilds_fluxer",

  callProviderDirectly: true,
};

export default fluxer;
