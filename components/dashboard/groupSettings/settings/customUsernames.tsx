import { useEffect, useState, type ChangeEvent } from "react";
import TextInput from "../../../ui/textInput";
import config from "../../../../utils/config.json";
import { getCookie } from "../../../../utils/cookies";

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
    fetch(`${config.apiV2}get_custom_usernames_pattern`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) =>
      res.json().then((data: { customUsernamesPattern?: string }) => {
        setPattern(data.customUsernamesPattern || "");
      }),
    );

    // Load the custom user picture URL
    fetch(`${config.apiV2}get_group_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName: "customUserPPUrl",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) =>
      res.json().then((data: { customUserPPUrl?: string }) => {
        setUserPpUrl(data.customUserPPUrl || "");
      }),
    );
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
          fetch(`${config.apiV2}set_custom_usernames_pattern`, {
            method: "POST",
            body: JSON.stringify({
              token: getCookie("token"),
              groupId,
              guildId,
              customUsernamesPattern: newPattern,
            }),
            headers: {
              "Content-Type": "application/json",
            },
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
          fetch(`${config.apiV2}set_group_settings_field`, {
            method: "POST",
            body: JSON.stringify({
              token: getCookie("token"),
              groupId,
              guildId,
              fieldName: "customUserPPUrl",
              fieldValue: newUrl,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        }}
        value={userPpUrl}
        id="custom-user-pp-url"
      />
    </>
  );
};

export default CustomUsernames;
