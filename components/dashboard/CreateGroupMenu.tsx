import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "../../styles/components/dashboard/CreateGroupMenu.module.css";
import { unmountRoot } from "../../utils/reactRoot";
import { notify } from "../ui/NotificationSystem";
import { platformApi } from "../../utils/platformApi";
import type { Channel, OraxPlusStatus } from "../../types";
import type { PlatformConfig } from "../../utils/platforms";
import { t } from "../../utils/i18n";

interface CreateGroupMenuProps {
  guildId: string | string[] | undefined;
  setRefreshGuildDatas: (value: boolean) => void;
  ownedGroupsCount?: number;
  oraxPlus?: OraxPlusStatus;
  /** Closes this menu so the dashboard can show its Orax Plus paywall. */
  onGroupLimitReached?: () => void;
  platform?: PlatformConfig;
}

export default function CreateGroupMenu(props: CreateGroupMenuProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const groupLimit = props.oraxPlus?.limits?.groupsPerGuild || 2;
  const ownedGroupsCount = props.ownedGroupsCount || 0;
  const isAtGroupLimit = ownedGroupsCount >= groupLimit;

  function showGroupLimitPaywall() {
    unmountRoot(document.getElementById("menu"));
    props.onGroupLimitReached?.();
  }

  useEffect(() => {
    if (props.guildId) {
      platformApi<{ result?: Channel[] }>(
        "get_guild_channels",
        { guildId: props.guildId },
        { platform: props.platform },
      )
        .then((res) => {
          setChannels(res.result || []);
        })
        .catch(() => {
          notify.error(
            t("createGroup.channelLoadFailedTitle"),
            t("createGroup.channelLoadFailedDesc"),
          );
          setChannels([]);
        });
    } else {
      console.warn("No guildId provided to CreateGroupMenu");
    }
  }, [props.guildId, props.platform]);

  return (
    <>
      <div className={"popup"}>
        <div className="container">
          <div>
            <Image
              alt="decoration"
              src="/icons/drop.svg"
              height={50}
              width={50}
            />
            <h2 style={{ marginLeft: "15px" }}>{t("createGroup.title")}</h2>
          </div>
          <br></br>
          <p className={styles.quotaHint}>
            {props.oraxPlus?.active
              ? t("createGroup.quotaWithPlus", {
                  owned: ownedGroupsCount,
                  limit: groupLimit,
                })
              : t("createGroup.quotaFree", {
                  owned: ownedGroupsCount,
                  limit: groupLimit,
                })}
          </p>
          {isAtGroupLimit && (
            <p className={styles.limitWarning}>
              {t("createGroup.limitWarning")}
            </p>
          )}
          <input
            id="groupName"
            className="textInput"
            placeholder={t("createGroup.groupNamePlaceholder")}
            disabled={isAtGroupLimit}
          ></input>
          <p className="description">{t("createGroup.firstChannel")}</p>
          <select
            id="selectChannel"
            className={["textInput", styles.textInput].join(" ")}
            disabled={isAtGroupLimit}
          >
            {channels.map((channel, index) => (
              <option key={"option_" + index} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          <br></br>
          <br></br>
          <div className="line">
            <button
              className={[styles.cancelButton, "button default"].join(" ")}
              onClick={() => {
                unmountRoot(document.getElementById("menu"));
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              className="button default"
              onClick={() => {
                if (isAtGroupLimit) {
                  showGroupLimitPaywall();
                  return;
                }
                const groupNameEl = document.getElementById(
                  "groupName",
                ) as HTMLInputElement | null;
                const selectedChannelEl = document.getElementById(
                  "selectChannel",
                ) as HTMLSelectElement | null;
                const groupName = groupNameEl?.value ?? "";
                const selectedChannelId = selectedChannelEl?.value ?? "";
                if (!groupName) {
                  notify.error(
                    t("createGroup.validationTitle"),
                    t("createGroup.enterGroupName"),
                  );
                  return;
                }
                if (!selectedChannelId) {
                  notify.error(
                    t("createGroup.validationTitle"),
                    t("createGroup.selectChannel"),
                  );
                  return;
                }
                platformApi<{ error?: number; customError?: string }>(
                  "create_group",
                  {
                    guildId: props.guildId,
                    channelId: selectedChannelId,
                    groupName: groupName,
                  },
                )
                  .then((data) => {
                    // The server enforces the group limit too (e.g. a stale
                    // count here): offer Orax Plus rather than an error.
                    if (data.error === 2 && !props.oraxPlus?.active) {
                      showGroupLimitPaywall();
                      return;
                    }
                    if (data.error) {
                      let errorMessage: string;
                      switch (data.error) {
                        case 1:
                          errorMessage = t("createGroup.manageWebhooksError");
                          break;
                        case 2:
                          errorMessage = t("createGroup.groupLimitError", {
                            owned: ownedGroupsCount,
                            limit: groupLimit,
                          });
                          break;
                        default:
                          errorMessage =
                            t("createGroup.unknownError", {
                              code: data.error,
                            }) +
                            (data.customError
                              ? t("createGroup.customErrorSuffix", {
                                  error: data.customError,
                                })
                              : "");
                          break;
                      }
                      notify.error(
                        t("createGroup.creationFailedTitle"),
                        errorMessage,
                      );
                    } else {
                      notify.success(
                        t("createGroup.successTitle"),
                        t("createGroup.successDesc"),
                      );
                      unmountRoot(document.getElementById("menu"));
                      props.setRefreshGuildDatas(true);
                    }
                  })
                  .catch(() => {
                    notify.error(
                      t("createGroup.creationFailedTitle"),
                      t("createGroup.creationFailedDesc"),
                    );
                  });
              }}
            >
              {t("common.create")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
