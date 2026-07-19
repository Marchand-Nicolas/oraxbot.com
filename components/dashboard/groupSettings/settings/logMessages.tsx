import { useEffect, useState, type ChangeEvent } from "react";
import config from "../../../../utils/config.json";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { getCookie } from "../../../../utils/cookies";
import type { Channel } from "../../../../types";

interface LogMessagesProps {
  groupId?: string | string[];
  guildId?: string | string[];
}

const LogMessages = ({ groupId, guildId }: LogMessagesProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [logChannel, setLogChannel] = useState("");

  useEffect(() => {
    if (guildId)
      fetch(`${config.apiV2}get_guild_channels`, {
        method: "POST",
        body: JSON.stringify({ guildId }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res: { result?: Channel[] }) => {
          setChannels(res.result || []);
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
        fieldName: "logMessagesInChannel",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      res.json().then((data: { logMessagesInChannel?: string }) => {
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
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const value = e.target.value;
          setLogChannel(value);
          fetch(`${config.apiV2}set_group_settings_field`, {
            method: "POST",
            body: JSON.stringify({
              token: getCookie("token"),
              groupId,
              guildId,
              fieldName: "logMessagesInChannel",
              fieldValue: value,
            }),
            headers: {
              "Content-Type": "application/json",
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
