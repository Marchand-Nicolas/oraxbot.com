import styles from "../../../../styles/components/dashboard/groupSettings/advancedSettings.module.css";
import fire from "../../../../public/icons/fire.svg";
import popup from "../../../../utils/popup";
import { useEffect, useState, type ChangeEvent } from "react";
import { platformApi } from "../../../../utils/platformApi";
import { t } from "../../../../utils/i18n";

interface ChannelDisableWarningMessageProps {
  guildId?: string | string[];
  channelId?: string | string[];
}

const ChannelDisableWarningMessage = ({
  guildId,
  channelId,
}: ChannelDisableWarningMessageProps) => {
  const [disableUserWarningMessage, setDisableUserWarningMessage] =
    useState(false);

  const updateDisableUserWarningMessage = (
    e: ChangeEvent<HTMLInputElement>,
    disableUserWarningMessage: boolean,
  ) => {
    platformApi("set_channel_settings_field", {
      guildId,
      channelId,
      fieldName: "disableUserWarningMessage",
      fieldValue: disableUserWarningMessage,
    }).then(() => {
      e.target.checked = disableUserWarningMessage;
    });
  };

  useEffect(() => {
    if (!guildId || !channelId) return;
    platformApi<{ success?: boolean; disableUserWarningMessage?: unknown }>(
      "get_channel_settings_field",
      {
        guildId,
        channelId,
        fieldName: "disableUserWarningMessage",
      },
    ).then(
      (data) =>
        data.success &&
        setDisableUserWarningMessage(!!data.disableUserWarningMessage),
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
                      updateDisableUserWarningMessage(e, true);
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
  );
};

export default ChannelDisableWarningMessage;
