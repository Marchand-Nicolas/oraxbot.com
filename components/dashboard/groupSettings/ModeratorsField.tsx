import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../../styles/components/dashboard/groupSettings/moderators.module.css";
import { platformApi } from "../../../utils/platformApi";
import { notify } from "../../ui/NotificationSystem";
import type { Moderator } from "../../../types";
import { t } from "../../../utils/i18n";
import AddModeratorPicker from "./AddModeratorPicker";
import popup from "../../../utils/popup";

const defaultAvatar = (userId: string): string => {
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) % 5n)}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
};

interface ModeratorsFieldProps {
  groupId?: string | string[];
  guildId?: string | string[];
}

const resolveAvatarUrl = (moderator: Moderator): string => {
  const avatar = moderator.avatar;
  if (avatar && avatar.startsWith("http")) return avatar;
  if (avatar && avatar.length > 0) {
    return `https://cdn.discordapp.com/avatars/${moderator.id}/${avatar}.webp?size=64`;
  }
  return defaultAvatar(moderator.id);
};

const ModeratorsField = ({ groupId, guildId }: ModeratorsFieldProps) => {
  const [loading, setLoading] = useState(true);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [removingUserId, setRemovingUserId] = useState("");

  const loadModerators = useCallback(async () => {
    if (!groupId || !guildId) return;
    setLoading(true);
    try {
      const data = await platformApi<{
        result?: boolean;
        moderators?: Moderator[];
        error?: string;
      }>("get_moderators", { guildId, groupId });
      if (!data.result) {
        throw new Error(data.error || "Unable to load moderators");
      }
      setModerators(Array.isArray(data.moderators) ? data.moderators : []);
    } catch (error) {
      console.error("Failed to load moderators:", error);
      notify.error(
        t("groupSettings.moderatorsLoadFailedTitle"),
        t("groupSettings.moderatorsLoadFailedDesc"),
      );
      setModerators([]);
    } finally {
      setLoading(false);
    }
  }, [groupId, guildId]);

  useEffect(() => {
    loadModerators();
  }, [loadModerators]);

  const removeModerator = async (userId: string) => {
    if (!groupId || !guildId) return;
    setRemovingUserId(userId);
    try {
      const data = await platformApi<{
        result?: boolean;
        removed?: boolean;
        error?: string;
      }>("remove_moderator", { guildId, groupId, userId });
      if (!data.result || !data.removed) {
        throw new Error(data.error || "Unable to remove moderator");
      }
      setModerators((current) =>
        current.filter((moderator) => moderator.id !== userId),
      );
      notify.success(
        t("groupSettings.moderatorRemovedTitle"),
        t("groupSettings.moderatorRemovedDesc"),
      );
    } catch (error) {
      console.error("Failed to remove moderator:", error);
      notify.error(
        t("groupSettings.moderatorRemoveFailedTitle"),
        t("groupSettings.moderatorRemoveFailedDesc"),
      );
    } finally {
      setRemovingUserId("");
    }
  };

  const openAddModerator = () => {
    if (!groupId || !guildId) return;
    const onAdded = (newModerator: Moderator) => {
      setModerators((current) => {
        if (current.some((m) => m.id === newModerator.id)) return current;
        return [...current, newModerator];
      });
    };
    popup(
      t("groupSettings.addModerator"),
      <AddModeratorPicker
        groupId={groupId}
        guildId={guildId}
        existingModeratorIds={moderators.map((m) => m.id)}
        onAdded={onAdded}
      />,
      "default",
      {
        close: true,
        customButtonName: t("common.close"),
      },
    );
  };

  return (
    <div className={styles.field}>
      <div className={styles.header}>
        <div>
          <strong>{t("groupSettings.moderators")}</strong>
          <p className={styles.description}>
            {t("groupSettings.moderatorsDesc")}
          </p>
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={openAddModerator}
        >
          {t("groupSettings.addModerator")}
        </button>
      </div>

      {loading ? (
        <div className={styles.state}>
          {t("groupSettings.moderatorsLoading")}
        </div>
      ) : moderators.length === 0 ? (
        <div className={styles.state}>{t("groupSettings.moderatorsEmpty")}</div>
      ) : (
        <div className={styles.list}>
          {moderators.map((moderator) => (
            <div key={moderator.id} className={styles.userRow}>
              <Image
                className={styles.avatar}
                src={resolveAvatarUrl(moderator)}
                alt={`${moderator.username} avatar`}
                width={40}
                height={40}
                unoptimized
              />
              <div className={styles.userInfo}>
                <strong>{moderator.username}</strong>
                <span>{moderator.id}</span>
              </div>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeModerator(moderator.id)}
                disabled={removingUserId === moderator.id}
                aria-label={`Remove ${moderator.username}`}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeratorsField;
