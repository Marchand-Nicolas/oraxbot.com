import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../../styles/components/dashboard/groupSettings/mutedUsers.module.css";
import { platformApi } from "../../../utils/platformApi";
import { notify } from "../../ui/NotificationSystem";
import type { MutedUser } from "../../../types";

const defaultAvatar = (userId: string): string => {
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) % 5n)}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
};

interface MutedUsersWindowProps {
  groupId?: string | string[];
  guildId?: string | string[];
}

const MutedUsersWindow = ({ groupId, guildId }: MutedUsersWindowProps) => {
  const [loading, setLoading] = useState(true);
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [removingUserId, setRemovingUserId] = useState("");

  useEffect(() => {
    if (!groupId || !guildId) return;

    let isMounted = true;

    const loadMutedUsers = async () => {
      setLoading(true);

      try {
        const data = await platformApi<{ result?: boolean; mutedUsers?: MutedUser[]; error?: string }>(
          "get_muted_users",
          { guildId, groupId },
        );

        if (!data.result) {
          throw new Error(data.error || "Unable to load muted users");
        }

        if (isMounted) {
          setMutedUsers(
            Array.isArray(data.mutedUsers) ? data.mutedUsers : [],
          );
        }
      } catch (error) {
        console.error("Failed to load muted users:", error);
        notify.error(
          "Failed to load muted users",
          "Unable to fetch the muted user list. Please try again.",
        );
        if (isMounted) {
          setMutedUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMutedUsers();

    return () => {
      isMounted = false;
    };
  }, [groupId, guildId]);

  const unmuteUser = async (userId: string) => {
    setRemovingUserId(userId);

    try {
      const data = await platformApi<{ result?: boolean; removed?: boolean; error?: string }>(
        "remove_muted_user",
        { guildId, groupId, userId },
      );

      if (!data.result || !data.removed) {
        throw new Error(data.error || "Unable to unmute user");
      }

      setMutedUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      );
      notify.success(
        "User unmuted",
        "The user has been removed from the mute list.",
      );
    } catch (error) {
      console.error("Failed to unmute user:", error);
      notify.error(
        "Failed to unmute user",
        "Unable to remove that user from the mute list. Please try again.",
      );
    } finally {
      setRemovingUserId("");
    }
  };

  return (
    <div className={styles.window}>
      <p className={styles.description}>
        Manage the users muted in this group. Use the trash icon to unmute
        them.
      </p>

      {loading ? (
        <div className={styles.state}>Loading muted users...</div>
      ) : mutedUsers.length === 0 ? (
        <div className={styles.state}>No users are currently muted.</div>
      ) : (
        <div className={styles.list}>
          {mutedUsers.map((user) => {
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
                  className={styles.unmuteButton}
                  onClick={() => unmuteUser(user.id)}
                  disabled={removingUserId === user.id}
                  aria-label={`Unmute ${user.username}`}
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
                      d="M6 7h12m-1 0-.867 12.142A2 2 0 0 1 13.893 21H10.11a2 2 0 0 1-2.24-1.858L7 7m3-3h4m-4 0a1 1 0 0 0-1 1v1h6V5a1 1 0 0 0-1-1m-4 0h4m-6 4h8"
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

export default MutedUsersWindow;
