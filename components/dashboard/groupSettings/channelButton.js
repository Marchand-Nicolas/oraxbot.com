import Link from "next/link";
import styles from "../../../styles/dashboard/OwnedGroup.module.css";
import config from "../../../utils/config";
import { getCookie } from "../../../utils/cookies";

const ChannelButton = ({ channel, groupId, guildId, setChannels, icon }) => {
  return (
    <div className={styles.buttonContainer}>
      <p>{channel.guildName}</p>
      <div>
        <svg
          className={styles.channelIcon}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"
          />
        </svg>
        <p className={styles.channelName}>{channel.name}</p>
      </div>
      <div className={styles.channelButtons}>
        <Link href={`./channelSettings/${guildId}/${channel.id}?icon=${icon}`}>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
        </Link>
        <svg
          onClick={() =>
            unlinkChannel(groupId, channel.id, guildId, setChannels)
          }
          className={styles.removeChannelIcon}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </div>
    </div>
  );
};

export default ChannelButton;

const unlinkChannel = (groupId, channelId, guildId, setChannels) => {
  fetch(`${config.serverIp}unlink_channel`, {
    method: "POST",
    body: JSON.stringify({
      token: getCookie("token"),
      groupId,
      channelId,
      guildId
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((datas) => {
      if (datas.result) {
        setChannels((channels) => channels.filter((c) => c.id != channelId));
      }
    });
};
