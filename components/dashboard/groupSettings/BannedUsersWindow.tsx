import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../../styles/components/dashboard/groupSettings/bannedUsers.module.css";
import { platformApi } from "../../../utils/platformApi";
import { notify } from "../../ui/NotificationSystem";
import type { BannedUser } from "../../../types";

const defaultAvatar = (userId: string): string => {
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) % 5n)}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
};

interface BannedUsersWindowProps {
  groupId?: string | string[];
  guildId?: string | string[];
}

const BannedUsersWindow = ({ groupId, guildId }: BannedUsersWindowProps) => {
  const [loading, setLoading] = useState(true);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [removingUserId, setRemovingUserId] = useState("");

  useEffect(() => {
    if (!groupId || !guildId) return;

    let isMounted = true;

    const loadBannedUsers = async () => {
      setLoading(true);

      try {
        const data = await platformApi<{ result?: boolean; bannedUsers?: BannedUser[]; error?: string }>(
          "get_banned_users",
          { guildId, groupId },
        );

        if (!data.result) {
          throw new Error(data.error || "Unable to load banned users");
        }

        if (isMounted) {
          setBannedUsers(
            Array.isArray(data.bannedUsers) ? data.bannedUsers : [],
          );
        }
      } catch (error) {
        console.error("Failed to load banned users:", error);
        notify.error(
          "Failed to load banned users",
          "Unable to fetch the banned user list. Please try again.",
        );
        if (isMounted) {
          setBannedUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBannedUsers();

    return () => {
      isMounted = false;
    };
  }, [groupId, guildId]);

  const unbanUser = async (userId: string) => {
    setRemovingUserId(userId);

    try {
      const data = await platformApi<{ result?: boolean; removed?: boolean; error?: string }>(
        "remove_banned_user",
        { guildId, groupId, userId },
      );

      if (!data.result || !data.removed) {
        throw new Error(data.error || "Unable to unban user");
      }

      setBannedUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      );
      notify.success(
        "User unbanned",
        "The user has been removed from the ban list.",
      );
    } catch (error) {
      console.error("Failed to unban user:", error);
      notify.error(
        "Failed to unban user",
        "Unable to remove that user from the ban list. Please try again.",
      );
    } finally {
      setRemovingUserId("");
    }
  };

  return (
    <div className={styles.window}>
      <p className={styles.description}>
        Manage the users banned from this group. Use the trash icon to unban
        them.
      </p>

      {loading ? (
        <div className={styles.state}>Loading banned users...</div>
      ) : bannedUsers.length === 0 ? (
        <div className={styles.state}>No users are currently banned.</div>
      ) : (
        <div className={styles.list}>
          {bannedUsers.map((user) => {
            const avatar = user.avatar
              ? user.avatar.startsWith("http")
                ? user.avatar
                : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`
              : defaultAvatar(user.id);

            return (
              <div key={user.id} className={styles.userRow}>
                <Image
                  className={styles.avatar}
                  src={avatar}
                  alt={`${user.username} avatar`}
                  width={40}
                  height={40}
                  unoptimized
                />
                <div className={styles.userInfo}>
                  <strong>{user.username}</strong>
                  <span>{user.id}</span>
                </div>
                <button
                  type="button"
                  className={styles.unbanButton}
                  onClick={() => unbanUser(user.id)}
                  disabled={removingUserId === user.id}
                  aria-label={`Unban ${user.username}`}
                >
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 7h12m-1 0-.867 12.142A2.25 2.25 0 0 1 13.893 21H10.11a2.25 2.25 0 0 1-2.24-1.858L7 7m3-3h4m-4 0a1 1 0 0 0-1 1v1h6V5a1 1 0 0 0-1-1m-4 0h4m-6 4h8"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BannedUsersWindow;
