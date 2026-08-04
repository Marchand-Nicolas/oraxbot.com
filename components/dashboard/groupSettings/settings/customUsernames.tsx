import { useEffect, useState, type ChangeEvent } from "react";
import TextInput from "../../../ui/textInput";
import { platformApi } from "../../../../utils/platformApi";
import { t } from "../../../../utils/i18n";

interface CustomUsernamesProps {
  groupId?: string | string[];
  guildId?: string | string[];
}

const CustomUsernames = ({ groupId, guildId }: CustomUsernamesProps) => {
  const [pattern, setPattern] = useState("");
  const [userPpUrl, setUserPpUrl] = useState("");

  useEffect(() => {
    if (!groupId || !guildId) return;
    // Load the custom usernames pattern
    platformApi<{ customUsernamesPattern?: string }>(
      "get_custom_usernames_pattern",
      { groupId, guildId },
    ).then((data) => {
      setPattern(data.customUsernamesPattern || "");
    });

    // Load the custom user picture URL
    platformApi<{ customUserPPUrl?: string }>(
      "get_group_settings_field",
      {
        groupId,
        guildId,
        fieldName: "customUserPPUrl",
      },
    ).then((data) => {
      setUserPpUrl(data.customUserPPUrl || "");
    });
  }, [groupId, guildId]);

  return (
    <>
      <label htmlFor="custom-usernames-pattern">
        <strong>{t("groupSettings.customUsernamesPattern")}</strong>
      </label>
      <label>
        {t("groupSettings.customUsernamesDesc", {
          username: "{username}",
          nickname: "{nickname}",
          serverName: "{serverName}",
          role: "{role}",
        })}
      </label>
      <TextInput
        placeholder={t("groupSettings.customUsernamesPlaceholder")}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newPattern = e.target.value;
          setPattern(newPattern);
          platformApi("set_custom_usernames_pattern", {
            groupId,
            guildId,
            customUsernamesPattern: newPattern,
          });
        }}
        value={pattern}
        id="custom-usernames-pattern"
      />
      <label htmlFor="custom-user-pp-url" style={{ marginTop: "1.5rem" }}>
        <strong>{t("groupSettings.customPictureLabel")}</strong>
      </label>
      <label>
        {t("groupSettings.customPictureDesc", {
          userAvatarUrl: "{userAvatarUrl}",
        })}
      </label>
      <TextInput
        placeholder={t("groupSettings.customPicturePlaceholder")}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newUrl = e.target.value;
          setUserPpUrl(newUrl);
          platformApi("set_group_settings_field", {
            groupId,
            guildId,
            fieldName: "customUserPPUrl",
            fieldValue: newUrl,
          });
        }}
        value={userPpUrl}
        id="custom-user-pp-url"
      />
    </>
  );
};

export default CustomUsernames;
