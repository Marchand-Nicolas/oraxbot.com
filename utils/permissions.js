export function checkAdminPerms(guild) {
  // Check if user has admin permission on this guild (https://discord.com/developers/docs/topics/permissions)
  const permissions = guild.permissions_new.toString(16);
  return permissions & 0x0000000000000032;
}
