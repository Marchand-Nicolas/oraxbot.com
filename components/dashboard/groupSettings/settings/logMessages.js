import { useEffect, useState } from "react";
import config from "../../../../utils/config";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { getCookie } from "../../../../utils/cookies";

const LogMessages = ({ groupId, guildId }) => {
  const [channels, setChannels] = useState([]);
  const [logChannel, setLogChannel] = useState("");

  useEffect(() => {
    if (guildId)
      fetch(`${config.serverIp}get_guild_channels`, {
        method: "POST",
        body: JSON.stringify({ guildId }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setChannels(res.result);
        });
  }, [guildId]);

  useEffect(() => {
    if (!groupId || !guildId) return;
    // Load the custom usernames pattern
    fetch(`${config.apiV2}get_group_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName: "logMessagesInChannel"
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      res.json().then((data) => {
        setLogChannel(data.logMessagesInChannel || "");
      });
    });
  }, [groupId, guildId]);

  return (
    <>
      <label>
        <strong>Log interserv messages in the following channel:</strong>
      </label>
      <select
        id="selectChannel"
        className={styles.selectInput}
        value={logChannel || ""}
        onChange={(e) => {
          const value = e.target.value;
          setLogChannel(value);
          fetch(`${config.apiV2}set_group_settings_field`, {
            method: "POST",
            body: JSON.stringify({
              token: getCookie("token"),
              groupId,
              guildId,
              fieldName: "logMessagesInChannel",
              fieldValue: value
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }}
      >
        <option value="">No log (disabled)</option>
        {channels.map((channel, index) => (
          <option key={"option_" + index} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </select>
    </>
  );
};

export default LogMessages;
