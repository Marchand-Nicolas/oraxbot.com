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
import BannedUsersWindow from "./BannedUsersWindow";

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
      <h2 className={styles.sectionTitle}>Advanced Settings</h2>
      <div className={styles.settingsGrid}>
        {/* Privacy & Sync Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>Privacy & Synchronization</h3>

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
                      "This could be dangerous",
                      `For privacy reasons, it is necessary to warn users that their messages might be synchronised. You can add this to the server rules, for example.`,
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
                            name: "Cancel",
                            className: "normal",
                            action: () => {
                              e.target.checked = false;
                            },
                          },
                          {
                            name: "Continue",
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
                Disable user warning message
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
              label="Custom warning message"
              description="Override the default user warning text shown in synced channels."
              fieldName="customWarningMessage"
              groupId={groupId}
              guildId={guildId}
              placeholder="e.g., Messages here may be shared across servers."
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
                Disable message deletion sync
              </label>
            </div>
          </div>
        </div>

        {/* Filters Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>Message Filtering</h3>

          <div className={styles.settingItem}>
            <Filters groupId={groupId} guildId={guildId} />
          </div>
        </div>

        {/* Group Management Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>Group Management</h3>

          <div className={styles.settingItem}>
            <div
              className="line"
              style={{ gap: "12px", display: "flex", flexWrap: "wrap" }}
            >
              <button
                onClick={() =>
                  popup("Rename the group", <div></div>, "error", {
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
                        name: "Cancel",
                        className: "border normal",
                      },
                      {
                        name: "Rename",
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
                        placeholder="New group name"
                      />
                    ),
                  })
                }
                className="button round normal"
              >
                Rename the group
              </button>

              <button
                onClick={() =>
                  popup(
                    "Delete the group",
                    "This action is irreversible. All channels linked to your group will be unlinked.",
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
                      customButtonName: "Delete",
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
                Delete the group
              </button>

              <button
                onClick={() =>
                  popup(
                    "Banned users",
                    <BannedUsersWindow groupId={groupId} guildId={guildId} />,
                    "default",
                    {
                      close: true,
                      customButtonName: "Close",
                    },
                  )
                }
                className="button round normal"
              >
                View banned users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdvancedSettings;
