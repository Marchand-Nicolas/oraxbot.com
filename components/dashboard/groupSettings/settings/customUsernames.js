import { useEffect, useState } from "react";
import TextInput from "../../../ui/textInput";
import config from "../../../../utils/config";

const CustomUsernames = ({ groupId, guildId }) => {
  const [pattern, setPattern] = useState("");

  useEffect(() => {
    // Load the custom usernames pattern
    fetch(`${config.apiV2}get_custom_usernames_pattern`).then((res) =>
      res.json().then((datas) => {
        setPattern(datas.customUsernamesPattern || "");
      })
    );
  }, []);

  return (
    <>
      <label htmlFor="custom-usernames-pattern">
        <strong>Custom usernames pattern:</strong>
      </label>
      <label>
        You can use <code>{`{username}`}</code> and{" "}
        <code>{`{serverName}`}</code> to customize the usernames dynamically.
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
            )}", "groupId": ${groupId}, "guildId":"${guildId}", "customUsernamesPattern": ${newPattern} }`,
          });
        }}
        value={pattern}
        id="custom-usernames-pattern"
      />
    </>
  );
};

export default CustomUsernames;
