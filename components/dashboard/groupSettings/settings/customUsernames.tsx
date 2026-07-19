import { useEffect, useState, type ChangeEvent } from "react";
import TextInput from "../../../ui/textInput";
import { platformApi } from "../../../../utils/platformApi";

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
        <strong>Custom usernames pattern:</strong>
      </label>
      <label>
        You can use <code>{`{username}`}</code>, <code>{`{nickname}`}</code>,{" "}
        <code>{`{serverName}`}</code> and <code>{`{role}`}</code> to customize
        the usernames dynamically.
      </label>
      <TextInput
        placeholder="{username} [{serverName}]"
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
        <strong>Custom user picture url:</strong>
      </label>
      <label>
        You can use <code>{`{userAvatarUrl}`}</code> to customize the profile
        pictures dynamically.
      </label>
      <TextInput
        placeholder="https://example.com/users/{userAvatarUrl}"
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
