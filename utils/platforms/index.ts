import type { PlatformConfig } from "./types";
import discord from "./discord";
import fluxer from "./fluxer";

export type { PlatformConfig } from "./types";

/** Registry keyed by platform slug for O(1) lookups in routes. */
export const platforms: Record<string, PlatformConfig> = {
  discord,
  fluxer,
};

/** Ordered list used to render login buttons and iterate over platforms. */
export const platformList: PlatformConfig[] = [discord, fluxer];

/**
 * Numeric platform type → config. Mirrors the backend's PlatformType enum:
 *   0 = Discord, 1 = Telegram, 2 = Fluxer.
 */
export const platformsByType: Record<number, PlatformConfig> = {
  0: discord,
  2: fluxer,
};

export function getPlatform(slug: string | string[] | undefined | null):
  | PlatformConfig
  | undefined {
  if (Array.isArray(slug)) slug = slug[0];
  if (typeof slug !== "string") return undefined;
  return platforms[slug];
}

export function getPlatformByType(type: number | undefined | null):
  | PlatformConfig
  | undefined {
  if (typeof type !== "number") return undefined;
  return platformsByType[type];
}

export function isPlatformSupported(
  slug: string | string[] | undefined | null,
): boolean {
  return Boolean(getPlatform(slug));
}
