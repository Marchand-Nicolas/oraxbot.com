import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "../../styles/components/dashboard/CreateGroupMenu.module.css";
import ActionModal from "../ui/ActionModal";
import config from "../../utils/config.json";
import { unmountRoot } from "../../utils/reactRoot";
import { notify } from "../ui/NotificationSystem";
import type { Channel, OraxPlusStatus } from "../../types";

interface CreateGroupMenuProps {
  guildId: string | string[] | undefined;
  setRefreshGuildDatas: (value: boolean) => void;
  ownedGroupsCount?: number;
  oraxPlus?: OraxPlusStatus;
  onStartOraxPlusVote?: () => void;
  onStartOraxPlusCheckout?: (plan?: "monthly" | "lifetime") => void;
}

export default function CreateGroupMenu(props: CreateGroupMenuProps) {
  const serverIp = config.serverIp;
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showGroupLimitModal, setShowGroupLimitModal] = useState(false);
  const groupLimit = props.oraxPlus?.limits?.groupsPerGuild || 2;
  const ownedGroupsCount = props.ownedGroupsCount || 0;
  const isAtGroupLimit = ownedGroupsCount >= groupLimit;

  useEffect(() => {
    if (props.guildId) {
      fetch(`${serverIp}get_guild_channels`, {
        method: "POST",
        body: JSON.stringify({ guildId: props.guildId }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res: { result?: Channel[] }) => {
          setChannels(res.result || []);
        })
        .catch(() => {
          notify.error(
            "Channel Loading Failed",
            "Unable to load server channels. Please try again.",
          );
          setChannels([]);
        });
    } else {
      console.warn("No guildId provided to CreateGroupMenu");
    }
  }, [props.guildId, serverIp]);

  return (
    <>
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
        <p className={styles.quotaHint}>
          {ownedGroupsCount}/{groupLimit} owned groups
          {props.oraxPlus?.active ? " with Orax Plus" : " on the free plan"}
        </p>
        {isAtGroupLimit && (
          <p className={styles.limitWarning}>
            This server has reached its current group limit. Activate Orax Plus
            from the dashboard to create more groups.
          </p>
        )}
        <input
          id="groupName"
          className="textInput"
          placeholder="Group name"
          disabled={isAtGroupLimit}
        ></input>
        <p className="description">First linked channel</p>
        <select
          id="selectChannel"
          className={["textInput", styles.textInput].join(" ")}
          disabled={isAtGroupLimit}
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
              unmountRoot(document.getElementById("menu"));
            }}
          >
            Cancel
          </button>
          <button
            className="default"
            onClick={() => {
              if (isAtGroupLimit) {
                setShowGroupLimitModal(true);
                return;
              }
              const groupNameEl = document.getElementById(
                "groupName",
              ) as HTMLInputElement | null;
              const selectedChannelEl = document.getElementById(
                "selectChannel",
              ) as HTMLSelectElement | null;
              const groupName = groupNameEl?.value ?? "";
              const selectedChannelId = selectedChannelEl?.value ?? "";
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
                  groupName: groupName,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              })
                .then((res) => res.json())
                .then((data: { error?: number; customError?: string }) => {
                  if (data.error) {
                    let errorMessage: string;
                    switch (data.error) {
                      case 1:
                        errorMessage =
                          'You must give the "Manage Webhooks" permission to the bot';
                        break;
                      case 2:
                        errorMessage = `This server has reached its group limit (${ownedGroupsCount}/${groupLimit}).`;
                        break;
                      default:
                        errorMessage = `Unknown error; Error code: ${data.error}${
                          data.customError
                            ? "; Custom error: " + data.customError
                            : ""
                        }`;
                        break;
                    }
                    notify.error("Group Creation Failed", errorMessage);
                  } else {
                    notify.success("Success", "Group created successfully!");
                    unmountRoot(document.getElementById("menu"));
                    props.setRefreshGuildDatas(true);
                  }
                })
                .catch(() => {
                  notify.error(
                    "Group Creation Failed",
                    "Unable to create group. Please try again.",
                  );
                });
            }}
          >
            Create
          </button>
        </div>
      </div>
      </div>
      {showGroupLimitModal && (
        <ActionModal
          title="Group limit reached"
          description={
            <p>
              This server has reached its current group quota. Vote on Top.gg or
              subscribe to Orax Plus to unlock more interserver groups.
            </p>
          }
          actions={[
            {
              label: "Vote on Top.gg",
              variant: "secondary",
              disabled: !props.onStartOraxPlusVote,
              onClick: () => {
                setShowGroupLimitModal(false);
                props.onStartOraxPlusVote?.();
              },
            },
            {
              label: "Subscribe $2.99/mo",
              variant: "primary",
              disabled: !props.onStartOraxPlusCheckout,
              onClick: () => {
                setShowGroupLimitModal(false);
                props.onStartOraxPlusCheckout?.("monthly");
              },
            },
            {
              label: "Lifetime $19.99",
              variant: "primary",
              disabled: !props.onStartOraxPlusCheckout,
              onClick: () => {
                setShowGroupLimitModal(false);
                props.onStartOraxPlusCheckout?.("lifetime");
              },
            },
          ]}
          onClose={() => setShowGroupLimitModal(false)}
        />
      )}
    </>
  );
}
