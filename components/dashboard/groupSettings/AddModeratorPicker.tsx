import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "../../../styles/components/dashboard/groupSettings/moderators.module.css";
import { platformApi } from "../../../utils/platformApi";
import { notify } from "../../ui/NotificationSystem";
import type { GroupUser, Moderator } from "../../../types";
import { t } from "../../../utils/i18n";

const defaultAvatar = (userId: string): string => {
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) % 5n)}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
};

const resolveAvatarUrl = (user: GroupUser): string => {
  if (user.avatar && user.avatar.startsWith("http")) return user.avatar;
  if (user.avatar && user.avatar.length > 0) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`;
  }
  return defaultAvatar(user.id);
};

interface AddModeratorPickerProps {
  groupId?: string | string[];
  guildId?: string | string[];
  existingModeratorIds: string[];
  onAdded: (moderator: Moderator) => void;
}

const AddModeratorPicker = ({
  groupId,
  guildId,
  existingModeratorIds,
  onAdded,
}: AddModeratorPickerProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [users, setUsers] = useState<GroupUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState("");
  const existingSet = useMemo(
    () => new Set(existingModeratorIds),
    [existingModeratorIds],
  );

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    if (!groupId || !guildId) return;
    let isMounted = true;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await platformApi<{
          result?: boolean;
          users?: GroupUser[];
          error?: string;
        }>("get_group_users", {
          guildId,
          groupId,
          query: debouncedSearch,
          limit: 100,
        });
        if (!isMounted) return;
        if (!data.result) {
          throw new Error(data.error || "Unable to load users");
        }
        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (error) {
        console.error("Failed to load users:", error);
        if (isMounted) {
          notify.error(
            t("groupSettings.usersLoadFailedTitle"),
            t("groupSettings.usersLoadFailedDesc"),
          );
          setUsers([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [groupId, guildId, debouncedSearch]);

  const addModerator = async (user: GroupUser) => {
    if (!groupId || !guildId) return;
    if (existingSet.has(user.id)) {
      notify.info(
        t("groupSettings.moderatorAddAlreadyTitle"),
        t("groupSettings.moderatorAddAlreadyDesc"),
      );
      return;
    }
    setAddingId(user.id);
    try {
      const data = await platformApi<{
        result?: boolean;
        added?: boolean;
        alreadyModerator?: boolean;
        error?: string;
      }>("add_moderator", {
        guildId,
        groupId,
        userId: user.id,
      });
      if (!data.result || !data.added) {
        if (data.alreadyModerator) {
          notify.info(
            t("groupSettings.moderatorAddAlreadyTitle"),
            t("groupSettings.moderatorAddAlreadyDesc"),
          );
        } else {
          throw new Error(data.error || "Unable to add moderator");
        }
      } else {
        onAdded({
          id: user.id,
          username: user.username,
          avatar: user.avatar ?? null,
        });
        notify.success(
          t("groupSettings.moderatorAddedTitle"),
          t("groupSettings.moderatorAddedDesc"),
        );
      }
    } catch (error) {
      console.error("Failed to add moderator:", error);
      notify.error(
        t("groupSettings.moderatorAddFailedTitle"),
        t("groupSettings.moderatorAddFailedDesc"),
      );
    } finally {
      setAddingId("");
    }
  };

  return (
    <div className={styles.picker}>
      <input
        type="text"
        className={styles.search}
        placeholder={t("groupSettings.moderatorSearchPlaceholder")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        autoFocus
      />

      {loading ? (
        <div className={styles.state}>{t("groupSettings.usersLoading")}</div>
      ) : users.length === 0 ? (
        <div className={styles.state}>{t("groupSettings.usersEmpty")}</div>
      ) : (
        <div className={styles.list}>
          {users.map((user) => {
            const isModerator = existingSet.has(user.id);
            const isAdding = addingId === user.id;
            return (
              <div key={user.id} className={styles.userRow}>
                <Image
                  className={styles.avatar}
                  src={resolveAvatarUrl(user)}
                  alt={`${user.username} avatar`}
                  width={40}
                  height={40}
                  unoptimized
                />
                <div className={styles.userInfo}>
                  <strong>{user.username}</strong>
                  <span>
                    {user.globalName
                      ? `${user.globalName} · ${user.id}`
                      : user.id}
                  </span>
                </div>
                <button
                  type="button"
                  className={
                    isModerator ? styles.alreadyButton : styles.addRowButton
                  }
                  onClick={() => addModerator(user)}
                  disabled={isModerator || isAdding}
                >
                  {isModerator
                    ? t("groupSettings.moderatorAddAlreadyTitle")
                    : isAdding
                      ? t("common.loading")
                      : t("common.add")}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddModeratorPicker;
