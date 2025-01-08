import { useEffect, useState } from "react";
import TextInput from "../../../ui/textInput";
import config from "../../../../utils/config";
import { getCookie } from "../../../../utils/cookies";

const CustomUsernames = ({ groupId, guildId }) => {
  const [pattern, setPattern] = useState("");

  useEffect(() => {
    if (!groupId || !guildId) return;
    // Load the custom usernames pattern
    fetch(`${config.apiV2}get_custom_usernames_pattern`, {
      method: "POST",
      body: `{ "token": "${getCookie(
        "token"
      )}", "groupId": ${groupId}, "guildId":"${guildId}" }`,
    }).then((res) =>
      res.json().then((data) => {
        setPattern(data.customUsernamesPattern || "");
      })
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
        onChange={(e) => {
          const newPattern = e.target.value;
          setPattern(newPattern);
          fetch(`${config.apiV2}set_custom_usernames_pattern`, {
            method: "POST",
            body: `{ "token": "${getCookie(
              "token"
            )}", "groupId": ${groupId}, "guildId":"${guildId}", "customUsernamesPattern": ${JSON.stringify(
              newPattern
            )} }`,
          });
        }}
        value={pattern}
        id="custom-usernames-pattern"
      />
    </>
  );
};

export default CustomUsernames;
