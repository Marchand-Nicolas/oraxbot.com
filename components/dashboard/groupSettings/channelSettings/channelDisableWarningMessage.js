import styles from "../../../../styles/components/dashboard/groupSettings/advancedSettings.module.css";
import fire from "../../../../public/icons/fire.svg";
import popup from "../../../../utils/popup";
import { useEffect, useState } from "react";
import config from "../../../../utils/config";
import { getCookie } from "../../../../utils/cookies";

const ChannelDisableWarningMessage = ({ guildId, channelId }) => {
  const [disableUserWarningMessage, setDisableUserWarningMessage] =
    useState(false);

  const updateDisableUserWarningMessage = (e, disableUserWarningMessage) => {
    fetch(`${config.apiV2}set_channel_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        guildId,
        channelId,
        fieldName: "disableUserWarningMessage",
        fieldValue: disableUserWarningMessage,
      }),
    })
      .then((res) => res.json())
      .then((datas) => {
        if (datas.result) e.target.checked = disableUserWarningMessage;
      });
  };

  useEffect(() => {
    if (!guildId || !channelId) return;
    fetch(`${config.apiV2}get_channel_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        guildId,
        channelId,
        fieldName: "disableUserWarningMessage",
      }),
    })
      .then((res) => res.json())
      .then(
        (data) =>
          data.success &&
          setDisableUserWarningMessage(!!data.disableUserWarningMessage)
      );
  }, [guildId, channelId]);

  return (
    <div className={styles.line}>
      <input
        checked={disableUserWarningMessage}
        onChange={(e) => {
          const checked = e.target.checked;
          setDisableUserWarningMessage(checked);
          if (!checked) updateDisableUserWarningMessage(e, false);
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
                      updateDisableUserWarningMessage(e, true);
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
  );
};

export default ChannelDisableWarningMessage;
