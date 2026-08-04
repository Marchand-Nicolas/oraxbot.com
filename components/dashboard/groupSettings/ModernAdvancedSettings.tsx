import styles from "../../../styles/dashboard/OwnedGroup.module.css";
import advancedStyles from "../../../styles/components/dashboard/groupSettings/advancedSettings.module.css";
import fire from "../../../public/icons/fire.svg";
import drop from "../../../public/icons/drop.svg";
import Image from "next/image";
import popup from "../../../utils/popup";
import { platformApi } from "../../../utils/platformApi";
import { useRouter } from "next/router";
import React, { useEffect, useState, type ChangeEvent } from "react";
import Filters from "./settings/filters";
import TextField from "./settings/textField";
import MutedUsersWindow from "./MutedUsersWindow";
import { t } from "../../../utils/i18n";

const updateDisableUserWarningMessage = (
  e: ChangeEvent<HTMLInputElement>,
  groupId: string | string[] | undefined,
  guildId: string | string[] | undefined,
  disableUserWarningMessage: boolean,
) => {
  platformApi("set_group_settings_field", {
    groupId,
    guildId,
    fieldValue: disableUserWarningMessage,
    fieldName: "disableUserWarningMessage",
  }).then(() => {
    e.target.checked = disableUserWarningMessage;
  });
};

const ModernAdvancedSettings = () => {
  const router = useRouter();
  const [disableUserWarningMessage, setDisableUserWarningMessage] =
    useState(false);
  const [disableDeleteSync, setDisableDeleteSync] = useState(false);
  const [announcements, setAnnouncements] = useState(true);
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild") || "";
  const { groupId } = router.query;

  const updateDisableDeleteSync = (
    e: ChangeEvent<HTMLInputElement>,
    groupId: string | string[] | undefined,
    guildId: string | string[] | undefined,
    disableDeleteSync: boolean,
  ) => {
    platformApi<{ success?: boolean }>("set_group_settings_field", {
      groupId,
      guildId,
      fieldValue: disableDeleteSync,
      fieldName: "disableDeleteSync",
    }).then((data) => {
      if (data.success) setDisableDeleteSync(disableDeleteSync);
    });
  };

  const updateAnnouncements = (
    e: ChangeEvent<HTMLInputElement>,
    groupId: string | string[] | undefined,
    guildId: string | string[] | undefined,
    announcements: boolean,
  ) => {
    platformApi<{ success?: boolean }>("set_group_settings_field", {
      groupId,
      guildId,
      fieldValue: announcements,
      fieldName: "announcements",
    }).then((data) => {
      if (data.success) setAnnouncements(announcements);
    });
  };

  useEffect(() => {
    if (!groupId || !guildId) return;
    platformApi<{ success?: boolean; disableUserWarningMessage?: unknown }>(
      "get_group_settings_field",
      {
        groupId,
        guildId,
        fieldName: "disableUserWarningMessage",
      },
    ).then(
      (data) =>
        data.success &&
        setDisableUserWarningMessage(!!data.disableUserWarningMessage),
    );
  }, [groupId, guildId]);

  useEffect(() => {
    if (!groupId || !guildId) return;
    platformApi<{ success?: boolean; disableDeleteSync?: unknown }>(
      "get_group_settings_field",
      {
        groupId,
        guildId,
        fieldName: "disableDeleteSync",
      },
    ).then(
      (data) =>
        data.success && setDisableDeleteSync(!!data.disableDeleteSync),
    );
  }, [groupId, guildId]);

  useEffect(() => {
    if (!groupId || !guildId) return;
    platformApi<{ success?: boolean; announcements?: unknown }>(
      "get_group_settings_field",
      {
        groupId,
        guildId,
        fieldName: "announcements",
      },
    ).then(
      (data) =>
        data.success && setAnnouncements(!!data.announcements),
    );
  }, [groupId, guildId]);

  return (
    <div className={styles.settingsContainer}>
      <h2 className={styles.sectionTitle}>{t("groupSettings.advancedTitle")}</h2>
      <div className={styles.settingsGrid}>
        {/* Privacy & Sync Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>{t("groupSettings.privacySync")}</h3>

          <div className={styles.settingItem}>
            <div className={advancedStyles.line}>
              <input
                checked={disableUserWarningMessage}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setDisableUserWarningMessage(checked);
                  if (!checked)
                    updateDisableUserWarningMessage(e, groupId, guildId, false);
                  else {
                    e.target.checked = false;
                    popup(
                      t("groupSettings.dangerousTitle"),
                      t("groupSettings.dangerousDesc"),
                      "default",
                      {
                        icon: fire.src
                          ? {
                              src: fire.src,
                              height: fire.height,
                              width: fire.width,
                            }
                          : undefined,
                        buttons: [
                          {
                            name: t("common.cancel"),
                            className: "normal",
                            action: () => {
                              e.target.checked = false;
                            },
                          },
                          {
                            name: t("common.continue"),
                            className: "dangerous",
                            action: () => {
                              updateDisableUserWarningMessage(
                                e,
                                groupId,
                                guildId,
                                true,
                              );
                            },
                          },
                        ],
                      },
                    );
                  }
                }}
                type="checkbox"
                id="remove-user-warning-message"
              />
              <label htmlFor="remove-user-warning-message">
                {t("groupSettings.disableUserWarning")}
              </label>
            </div>
            <div className={advancedStyles.illustrationContainer}>
              <Image
                src="/illustrations/userWarningMessage.png"
                alt="User warning message example"
                width={1200}
                height={800}
                unoptimized
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>

          <div className={styles.settingItem}>
            <TextField
              label={t("groupSettings.customWarningMsg")}
              description={t("groupSettings.customWarningMsgDesc")}
              fieldName="customWarningMessage"
              groupId={groupId}
              guildId={guildId}
              placeholder={t("groupSettings.customWarningMsgPlaceholder")}
            />
          </div>

          <div className={styles.settingItem}>
            <div className={advancedStyles.line}>
              <input
                checked={disableDeleteSync}
                onChange={(e) =>
                  updateDisableDeleteSync(
                    e,
                    groupId,
                    guildId,
                    e.target.checked,
                  )
                }
                type="checkbox"
                id="disable-delete-sync"
              />
              <label htmlFor="disable-delete-sync">
                {t("groupSettings.disableDeleteSync")}
              </label>
            </div>
          </div>
        </div>

        {/* Filters Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>{t("groupSettings.messageFiltering")}</h3>

          <div className={styles.settingItem}>
            <Filters groupId={groupId} guildId={guildId} />
          </div>
        </div>

        {/* Group Management Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>{t("groupSettings.groupManagement")}</h3>

          <div className={styles.settingItem}>
            <div
              className="line"
              style={{ gap: "12px", display: "flex", flexWrap: "wrap" }}
            >
              <button
                onClick={() =>
                  popup(t("groupSettings.renameGroup"), <div></div>, "error", {
                    icon: drop.src
                      ? {
                          src: drop.src,
                          height: drop.height,
                          width: drop.width,
                        }
                      : undefined,
                    close: true,
                    buttons: [
                      {
                        name: t("common.cancel"),
                        className: "border normal",
                      },
                      {
                        name: t("common.rename"),
                        action: function () {
                          platformApi<{ result?: boolean }>(
                            "rename_interserv_group",
                            {
                              groupId,
                              guildId,
                              newName: (
                                document.getElementById(
                                  "renameGroupInput",
                                ) as HTMLInputElement | null
                              )?.value,
                            },
                          )
                            .then((datas) => {
                              if (datas.result) {
                                router.push(
                                  `/dashboard/${router.query.platform}?guild=${guildId}`,
                                );
                              }
                            });
                        },
                      },
                    ],
                    content: (
                      <input
                        id="renameGroupInput"
                        className="textInput normal"
                        placeholder={t("groupSettings.newGroupNamePlaceholder")}
                      />
                    ),
                  })
                }
                className="button round normal"
              >
                {t("groupSettings.renameGroup")}
              </button>

              <button
                onClick={() =>
                  popup(
                    t("groupSettings.deleteGroup"),
                    t("groupSettings.deleteGroupDesc"),
                    "error",
                    {
                      icon: fire.src
                        ? {
                            src: fire.src,
                            height: fire.height,
                            width: fire.width,
                          }
                        : undefined,
                      close: true,
                      customButtonName: t("common.delete"),
                      action: function () {
                        platformApi<{ result?: boolean }>(
                          "delete_interserv_group",
                          {
                            groupId,
                            guildId,
                          },
                        )
                          .then((datas) => {
                            if (datas.result) {
                              router.push(
                                `/dashboard/${router.query.platform}?guild=${guildId}`,
                              );
                            }
                          });
                      },
                    },
                  )
                }
                className="button round dangerous"
              >
                {t("groupSettings.deleteGroup")}
              </button>

              <button
                onClick={() =>
                  popup(
                    t("groupSettings.mutedUsersTitle"),
                    <MutedUsersWindow groupId={groupId} guildId={guildId} />,
                    "default",
                    {
                      close: true,
                      customButtonName: t("common.close"),
                    },
                  )
                }
                className="button round normal"
              >
                {t("groupSettings.viewMutedUsers")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdvancedSettings;
