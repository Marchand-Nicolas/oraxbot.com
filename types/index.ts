export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  permissions?: number;
  permissions_new?: string;
}

export interface Guild extends DiscordGuild {
  owner?: boolean;
}

export interface GuildSettings {
  lang?: number;
  public?: boolean;
  public_link?: string;
  public_name?: string;
  default?: boolean;
  [key: string]: unknown;
}

export interface LinkedChannel {
  id: string;
  name: string;
  guildName?: string;
  available?: boolean;
  /** Numeric platform type (0 = Discord, 2 = Fluxer). */
  platform?: number;
  [key: string]: unknown;
}

export interface OwnedGroup {
  id: string;
  name: string;
  linkedChannels: LinkedChannel[];
  [key: string]: unknown;
}

export interface OraxPlusStatus {
  active?: boolean;
  plan?: "free" | "orax_plus" | string;
  entitlement?: {
    source?:
      | "topgg_vote"
      | "fluxerlist_vote"
      | "stripe"
      | "stripe_lifetime"
      | "manual"
      | string;
    sourceRef?: string | null;
    userId?: string | null;
    startsAt?: string | null;
    expiresAt?: string | null;
    [key: string]: unknown;
  } | null;
  limits?: {
    groupsPerGuild?: number;
    channelsPerGroup?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface GuildData {
  bot?: boolean;
  ownedGroups?: OwnedGroup[];
  settings?: GuildSettings;
  oraxPlus?: OraxPlusStatus;
  [key: string]: unknown;
}

export interface ExploreGroup {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  server_count?: number;
  member_count?: number;
  message_count?: number;
  vote?: number;
  [key: string]: unknown;
}

export interface PublicServer {
  guildId?: string;
  guildName?: string;
  displayName?: string;
  icon?: string;
  invite?: string;
  [key: string]: unknown;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string | null;
  global_name?: string;
  discriminator?: string;
  message?: string;
  retry_after?: number;
  [key: string]: unknown;
}

export interface FilterRule {
  id: string;
  type: "keyword" | "media" | "author";
  condition: "include" | "exclude";
  value: string;
}

export interface BannedUser {
  id: string;
  username: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface Channel {
  id: string;
  name: string;
  [key: string]: unknown;
}
