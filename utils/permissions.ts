import type { DiscordGuild } from "../types";

export function checkAdminPerms(guild: DiscordGuild | null | undefined): boolean {
  // Discord permissions are 64-bit; BigInt prevents truncation from JS 32-bit bitwise ops.
  const ADMIN_PERM_MASK = 0x0000000000000032n;
  const rawPermissions = guild?.permissions_new ?? guild?.permissions;
  if (rawPermissions === undefined || rawPermissions === null) return false;

  try {
    const permissions =
      typeof rawPermissions === "bigint"
        ? rawPermissions
        : BigInt(rawPermissions as string | number);
    return (permissions & ADMIN_PERM_MASK) !== 0n;
  } catch {
    return false;
  }
}
