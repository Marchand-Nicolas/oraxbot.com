import styles from "../../../styles/components/dashboard/groupSettings/advancedSettings.module.css";
import fire from "../../../public/icons/fire.svg";
import popup from "../../../utils/popup";
import config from "../../../utils/config";
import { getCookie } from "../../../utils/cookies";
import { useRouter } from "next/router";
import HiddenMenu from "../../ui/hiddenMenu";

const setDisableUserWarningMessage = (
  e,
  groupId,
  guildId,
  disableUserWarningMessage
) => {
  fetch(`${config.apiV2}set_disable_user_warning_message`, {
    method: "POST",
    body: `{ "token": "${getCookie(
      "token"
    )}", "groupId": ${groupId}, "guildId":"${guildId}", "disableUserWarningMessage": ${disableUserWarningMessage} }`,
  })
    .then((res) => res.json())
    .then((datas) => {
      if (datas.result) e.target.checked = disableUserWarningMessage;
    });
};

const AdvancedSettings = ({ defaultDisableUserWarningMessage }) => {
  const router = useRouter();
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild");
  const { groupId } = router.query;
  return (
    <HiddenMenu title={"Advanced Settings"}>
      <>
        <div className={styles.line}>
          <input
            defaultChecked={defaultDisableUserWarningMessage}
            onClick={(e) => {
              const checked = e.target.checked;
              if (!checked)
                setDisableUserWarningMessage(e, groupId, guildId, false);
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
                      },
                      {
                        name: "Continue",
                        className: "dangerous",
                        action: () => {
                          setDisableUserWarningMessage(
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
      </>
    </HiddenMenu>
  );
};

export default AdvancedSettings;
