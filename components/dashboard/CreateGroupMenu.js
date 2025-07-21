import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "../../styles/components/dashboard/CreateGroupMenu.module.css";
import config from "../../utils/config";
import { unmountComponentAtNode } from "react-dom";
import { notify } from "../ui/NotificationSystem";

export default function CreateGroupMenu(props) {
  const serverIp = config.serverIp;
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (props.guildId) {
      fetch(`${serverIp}get_guild_channels`, {
        method: "POST",
        body: JSON.stringify({ guildId: props.guildId }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setChannels(res.result);
        })
        .catch((error) => {
          notify.error(
            "Channel Loading Failed",
            "Unable to load server channels. Please try again."
          );
          setChannels([]);
        });
    } else {
      console.warn("No guildId provided to CreateGroupMenu");
    }
  }, [props.guildId, serverIp]);

  return (
    <div className={"popup"}>
      <div className="container">
        <div>
          <Image
            alt="decoration"
            src="/icons/drop.svg"
            height={50}
            width={50}
          />
          <h2 style={{ marginLeft: "15px" }}>Create a new group</h2>
        </div>
        <br></br>
        <input
          id="groupName"
          className="textInput"
          placeholder="Group name"
        ></input>
        <p className="description">First linked channel</p>
        <select
          id="selectChannel"
          className={["textInput", styles.textInput].join(" ")}
        >
          {channels.map((channel, index) => (
            <option key={"option_" + index} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </select>
        <br></br>
        <br></br>
        <div className="line">
          <button
            className={[styles.cancelButton, "default"].join(" ")}
            onClick={() => {
              unmountComponentAtNode(document.getElementById("menu"));
            }}
          >
            Cancel
          </button>
          <button
            className="default"
            onClick={() => {
              const groupName = document.getElementById("groupName").value;
              const selectedChannelId =
                document.getElementById("selectChannel").value;
              if (!groupName) {
                notify.error("Validation Error", "Please enter a group name");
                return;
              }
              if (!selectedChannelId) {
                notify.error("Validation Error", "Please select a channel");
                return;
              }
              fetch(`${serverIp}create_group`, {
                method: "POST",
                body: JSON.stringify({
                  guildId: props.guildId,
                  channelId: selectedChannelId,
                  groupName: groupName
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.error) {
                    let errorMessage;
                    switch (data.error) {
                      case 1:
                        errorMessage =
                          'You must give the "Manage Webhooks" permission to the bot';
                        break;
                      case 2:
                        errorMessage =
                          "A single server cannot have more than 10 groups";
                        break;
                      default:
                        errorMessage = `Unknown error; Error code: ${
                          data.error
                        }${
                          data.customError
                            ? "; Custom error: " + data.customError
                            : ""
                        }`;
                        break;
                    }
                    notify.error("Group Creation Failed", errorMessage);
                  } else {
                    notify.success("Success", "Group created successfully!");
                    unmountComponentAtNode(document.getElementById("menu"));
                    props.setRefreshGuildDatas(true);
                  }
                })
                .catch((error) => {
                  console.error("Failed to create group:", error);
                  notify.error(
                    "Group Creation Failed",
                    "Unable to create group. Please try again."
                  );
                });
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
