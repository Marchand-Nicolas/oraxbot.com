import styles from "../../../styles/dashboard/OwnedGroup.module.css";
import advancedStyles from "../../../styles/components/dashboard/groupSettings/advancedSettings.module.css";
import fire from "../../../public/icons/fire.svg";
import drop from "../../../public/icons/drop.svg";
import popup from "../../../utils/popup";
import config from "../../../utils/config";
import { getCookie } from "../../../utils/cookies";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Filters from "./settings/filters";
import TextField from "./settings/textField";

const updateDisableUserWarningMessage = (
  e,
  groupId,
  guildId,
  disableUserWarningMessage
) => {
  fetch(`${config.apiV2}set_group_settings_field`, {
    method: "POST",
    body: JSON.stringify({
      token: getCookie("token"),
      groupId,
      guildId,
      fieldValue: disableUserWarningMessage,
      fieldName: "disableUserWarningMessage",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((datas) => {
      if (datas.success) e.target.checked = disableUserWarningMessage;
    });
};

const ModernAdvancedSettings = () => {
  const router = useRouter();
  const [disableUserWarningMessage, setDisableUserWarningMessage] =
    useState(false);
  const [disableDeleteSync, setDisableDeleteSync] = useState(false);
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild");
  const { groupId } = router.query;

  const updateDisableDeleteSync = (e, groupId, guildId, disableDeleteSync) => {
    fetch(`${config.apiV2}set_group_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldValue: disableDeleteSync,
        fieldName: "disableDeleteSync",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDisableDeleteSync(disableDeleteSync);
      });
  };

  useEffect(() => {
    if (!groupId || !guildId) return;
    fetch(`${config.apiV2}get_group_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName: "disableUserWarningMessage",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(
        (data) =>
          data.success &&
          setDisableUserWarningMessage(!!data.disableUserWarningMessage)
      );
  }, [groupId, guildId]);

  useEffect(() => {
    if (!groupId || !guildId) return;
    fetch(`${config.apiV2}get_group_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName: "disableDeleteSync",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(
        (data) => data.success && setDisableDeleteSync(!!data.disableDeleteSync)
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
                        icon: fire,
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
                                true
                              );
                            },
                          },
                        ],
                      }
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
              <img
                src="/illustrations/userWarningMessage.png"
                alt="User warning message example"
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
                  updateDisableDeleteSync(e, groupId, guildId, e.target.checked)
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
                    icon: drop,
                    close: true,
                    buttons: [
                      {
                        name: "Cancel",
                        className: "border normal",
                      },
                      {
                        name: "Rename",
                        action: function () {
                          fetch(`${config.apiV2}rename_interserv_group`, {
                            method: "POST",
                            body: JSON.stringify({
                              token: getCookie("token"),
                              groupId,
                              guildId,
                              newName:
                                document.getElementById("renameGroupInput")
                                  .value,
                            }),
                            headers: {
                              "Content-Type": "application/json",
                            },
                          })
                            .then((res) => res.json())
                            .then((datas) => {
                              if (datas.result) {
                                router.push("../?guild=" + guildId);
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
                      icon: fire,
                      close: true,
                      customButtonName: "Delete",
                      action: function () {
                        fetch(`${config.serverIp}delete_interserv_group`, {
                          method: "POST",
                          body: JSON.stringify({
                            token: getCookie("token"),
                            groupId,
                            guildId,
                          }),
                          headers: {
                            "Content-Type": "application/json",
                          },
                        })
                          .then((res) => res.json())
                          .then((datas) => {
                            if (datas.result) {
                              router.push("../?guild=" + guildId);
                            }
                          });
                      },
                    }
                  )
                }
                className="button round dangerous"
              >
                Delete the group
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdvancedSettings;
