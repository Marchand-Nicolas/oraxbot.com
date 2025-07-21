import { useRouter } from "next/router";
import dashboardStyles from "../../../styles/Dashboard.module.css";
import styles from "../../../styles/dashboard/OwnedGroup.module.css";
import { useEffect, useState } from "react";
import config from "../../../utils/config";
import { getCookie } from "../../../utils/cookies";
import popup from "../../../utils/popup";
import drop from "../../../public/icons/drop.svg";
import Link from "next/link";
import ModernSettings from "../../../components/dashboard/groupSettings/ModernSettings";
import ModernAdvancedSettings from "../../../components/dashboard/groupSettings/ModernAdvancedSettings";
import ActivityGraph from "../../../components/dashboard/groupSettings/activityGraph";
import ChannelButton from "../../../components/dashboard/groupSettings/channelButton";
import Skeleton from "../../../components/ui/skeleton";

export default function OwnedGroup() {
  const router = useRouter();
  const { groupId } = router.query;
  const [link, setLink] = useState("");
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild");
  const guildIcon = params.get("icon");
  const groupName = params.get("groupName");

  useEffect(() => {
    if (groupId) {
      fetch(`${config.apiV2}get_admin_group_data`, {
        method: "POST",
        body: JSON.stringify({
          token: getCookie("token"),
          groupId,
          guildId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((datas) => {
          console.log(datas);
          if (datas.result) {
            setLink(
              process.env.NEXT_PUBLIC_WEBSITE_URL + "/join/" + datas.link
            );
            setChannels(datas.channels);
            setLoading(false);
          }
        });
    }
  }, [groupId, guildId]);

  return (
    <>
      <div
        style={{
          backgroundImage:
            guildIcon && guildIcon != "null"
              ? `url('https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.webp?size=96')`
              : null,
        }}
        className={dashboardStyles.background}
      />
      <div className={styles.page}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.headerGrid}>
            <div>
              <div className="line">
                <Link href={"../?guild=" + guildId}>
                  <svg
                    className={styles.back}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </Link>
                <h1 className={styles.title}>{groupName}</h1>
              </div>

              {loading ? (
                <Skeleton height="60px" width="100%" />
              ) : (
                <div className={styles.inviteLinkSection}>
                  <div className={styles.inviteLinkRow}>
                    <p style={{ margin: 0, fontWeight: "600" }}>Invite link:</p>
                    <a
                      className={styles.inviteLink}
                      href={link ? link : "#"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link ? link : "No invitation link found"}
                    </a>
                    <svg
                      onClick={() => {
                        navigator.clipboard.writeText(link);
                        popup("Success", `Copied to clipboard`, "default", {
                          icon: drop,
                        });
                      }}
                      className={styles.linkIcon}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {!loading && (
              <button
                onClick={() =>
                  fetch(`${config.serverIp}generate_interserv_group_link`, {
                    method: "POST",
                    body: `{ "token": "${getCookie(
                      "token"
                    )}", "groupId": ${groupId}, "guildId":"${guildId}" }`,
                  })
                    .then((res) => res.json())
                    .then((datas) => {
                      if (datas.result) {
                        setLink(
                          process.env.NEXT_PUBLIC_WEBSITE_URL +
                            "/join/" +
                            datas.link
                        );
                      }
                    })
                }
                className={styles.regenerateInviteLink}
              >
                Regenerate invite link
              </button>
            )}
          </div>
        </div>

        {/* Channels Section */}
        {(channels.length || loading) && (
          <div className={styles.channelsSection}>
            <h2 style={{ margin: "0 0 16px 0", color: "#ffffff" }}>
              Linked channels
            </h2>
            {loading ? (
              <div className={styles.channelsGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={"skeleton_" + index}
                    height="60px"
                    width="100%"
                  />
                ))}
              </div>
            ) : (
              <div className={styles.channelsGrid}>
                {channels.map((channel, index) => (
                  <ChannelButton
                    key={"channel_" + index}
                    channel={channel}
                    groupId={groupId}
                    guildId={guildId}
                    setChannels={setChannels}
                    icon={guildIcon}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State for No Channels */}
        {!channels.length && !loading && (
          <div className={styles.channelsSection}>
            <div
              className={dashboardStyles.emptyGroupContainer}
              style={{ textAlign: "center", padding: "40px" }}
            >
              <h2 style={{ color: "#ffffff", marginBottom: "16px" }}>
                No channels linked to this group
              </h2>
              <p style={{ color: "#cccccc", margin: 0 }}>
                Use or share the invite link to start adding more channels
              </p>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        {loading ? (
          <div className={styles.settingsContainer}>
            <Skeleton height="300px" width="100%" />
            <br />
            <Skeleton height="200px" width="100%" />
          </div>
        ) : (
          <>
            <ModernSettings />
            <ModernAdvancedSettings />
          </>
        )}

        {/* Activity Graph */}
        <div className={styles.settingsContainer}>
          <ActivityGraph />
        </div>
      </div>
    </>
  );
}
