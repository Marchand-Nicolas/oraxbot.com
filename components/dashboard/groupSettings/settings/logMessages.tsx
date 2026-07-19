import { useEffect, useState, type ChangeEvent } from "react";
import config from "../../../../utils/config.json";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { platformApi } from "../../../../utils/platformApi";
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
      platformApi<{ result?: Channel[] }>("get_guild_channels", { guildId })
        .then((res) => {
          setChannels(res.result || []);
        });
  }, [guildId]);

  useEffect(() => {
    if (!groupId || !guildId) return;
    // Load the custom usernames pattern
    platformApi<{ logMessagesInChannel?: string }>(
      "get_group_settings_field",
      {
        groupId,
        guildId,
        fieldName: "logMessagesInChannel",
      },
    ).then((data) => {
      setLogChannel(data.logMessagesInChannel || "");
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
          platformApi("set_group_settings_field", {
            groupId,
            guildId,
            fieldName: "logMessagesInChannel",
            fieldValue: value,
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
