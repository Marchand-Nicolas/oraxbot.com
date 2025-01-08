import styles from "../../../styles/components/dashboard/groupSettings/advancedSettings.module.css";
import fire from "../../../public/icons/fire.svg";
import drop from "../../../public/icons/drop.svg";
import popup from "../../../utils/popup";
import config from "../../../utils/config";
import { getCookie } from "../../../utils/cookies";
import { useRouter } from "next/router";
import HiddenMenu from "../../ui/hiddenMenu";
import React, { useEffect, useState } from "react";

const updateDisableUserWarningMessage = (
  e,
  groupId,
  guildId,
  disableUserWarningMessage
) => {
  fetch(`${config.apiV2}set_group_settings_field`, {
    method: "POST",
    body: `{ "token": "${getCookie(
      "token"
    )}", "groupId": ${groupId}, "guildId":"${guildId}", "fieldValue": ${disableUserWarningMessage}, "fieldName": "disableUserWarningMessage" }`,
  })
    .then((res) => res.json())
    .then((datas) => {
      if (datas.success) e.target.checked = disableUserWarningMessage;
    });
};

const AdvancedSettings = () => {
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
      body: `{ "token": "${getCookie(
        "token"
      )}", "groupId": ${groupId}, "guildId":"${guildId}", "fieldValue": ${disableDeleteSync}, "fieldName": "disableDeleteSync" }`,
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
      body: `{ "token": "${getCookie(
        "token"
      )}", "groupId": ${groupId}, "guildId":"${guildId}", "fieldName": "disableUserWarningMessage" }`,
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
      body: `{ "token": "${getCookie(
        "token"
      )}", "groupId": ${groupId}, "guildId":"${guildId}", "fieldName": "disableDeleteSync" }`,
    })
      .then((res) => res.json())
      .then(
        (data) => data.success && setDisableDeleteSync(!!data.disableDeleteSync)
      );
  }, [groupId, guildId]);

  return (
    <HiddenMenu title={"Advanced Settings"}>
      <>
        <div className={styles.line}>
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
        <div className={styles.illustrationContainer}>
          <img src="/illustrations/userWarningMessage.png" />
        </div>
        <div className={styles.line}>
          <input
            checked={disableDeleteSync}
            onChange={(e) =>
              updateDisableDeleteSync(e, groupId, guildId, e.target.checked)
            }
            type="checkbox"
          />
          <label htmlFor="disable-delete-sync">
            Disable message deletion sync
          </label>
        </div>
        <br></br>
        <div className="line">
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
                        body: `{ "token": "${getCookie(
                          "token"
                        )}", "groupId": ${groupId}, "guildId":"${guildId}", "newName": "${
                          document.getElementById("renameGroupInput").value
                        }" }`,
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
                action: function () {
                  fetch(`${config.serverIp}delete_interserv_group`, {
                    method: "POST",
                    body: `{ "token": "${getCookie(
                      "token"
                    )}", "groupId": ${groupId}, "guildId":"${guildId}" }`,
                  })
                    .then((res) => res.json())
                    .then((datas) => {
                      if (datas.result) {
                        router.push("../?guild=" + guildId);
                      }
                    });
                },
                content: (
                  <input
                    id="renameGroupInput"
                    className="textInput normal"
                    placeholder="New group name"
                  ></input>
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
                      body: `{ "token": "${getCookie(
                        "token"
                      )}", "groupId": ${groupId}, "guildId":"${guildId}" }`,
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
        <br></br>
      </>
    </HiddenMenu>
  );
};

export default AdvancedSettings;
