import type { PlatformConfig } from "./types";
import type { DiscordGuild } from "../../types";
import { checkAdminPerms } from "../permissions";
import config from "../config.json";

const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "https://oraxbot.com";

const redirectUri = `${encodeURIComponent(WEBSITE_URL)}%2Fdashboard`;

const discord: PlatformConfig = {
  slug: "discord",
  label: "Discord",
  brandColor: "#5865F2",
  brandGradient: "linear-gradient(135deg, #5865F2 0%, #404EED 100%)",
  logoPath: "/assets/platforms/discord.svg",

  authorizeUrl: `https://discord.com/api/oauth2/authorize?client_id=812298057470967858&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`,

  getInviteUrl: (guildId) =>
    `${config.inviteLink}&guild_id=${guildId}`,
  addBotLabel: "Add bot",
  vote: {
    provider: "topgg",
    url: config.topggVoteUrl,
    label: "Vote on Top.gg",
  },

  userEndpoint: "https://discordapp.com/api/users/@me",
  guildsEndpoint: "https://discordapp.com/api/v6/users/@me/guilds",
  proxyThroughBackend: false,

  hasPermissionFlags: true,
  isAdmin: (guild: DiscordGuild) => checkAdminPerms(guild),

  getGuildIconUrl: ({ id, icon }) =>
    icon ? `https://cdn.discordapp.com/icons/${id}/${icon}.webp?size=96` : null,

  getGuildBackgroundUrl: ({ id, icon }) =>
    icon
      ? `https://cdn.discordapp.com/icons/${id}/${icon}.webp?size=96`
      : null,

  cookieName: "token_discord",
  cachedUserStorageKey: "cachedUserDatas_discord",
  cachedGuildsStorageKey: "cachedGuilds_discord",
};

export default discord;
