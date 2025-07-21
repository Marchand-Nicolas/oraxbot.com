import { useEffect, useState } from "react";
import styles from "../../styles/Join.module.css";
import dashboardStyles from "../../styles/Dashboard.module.css";
import { getCookie } from "../../utils/cookies";
import Link from "next/link";
import { useRouter } from "next/router";
import config from "../../utils/config";
import popup from "../../utils/popup";
import meteor from "../../public/icons/meteor.svg";

export default function JoinGroup() {
  const router = useRouter();
  const [guilds, setGuilds] = useState([]);
  const [user, setUser] = useState({});
  const [group, setGroup] = useState({});
  const [channels, setChannels] = useState([]);

  const { linkId } = router.query;

  function checkAdminPerms(guild) {
    // Check if user has admin permission on this guild (https://discord.com/developers/docs/topics/permissions)
    return guild.permissions_new.toString(16) & 0x0000000000000032;
  }

  const guildId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("guild")
      : "";
  let guild = guilds.find((guild) => guild.id === guildId);

  if (!guild) {
    if (guilds.length > 0) {
      guild = guilds.find((guild) => checkAdminPerms(guild));
    }
    if (!guild)
      guild = {
        id: "",
        name: "",
        icon: "",
        owner: false,
        permissions: 2147483647,
        permissions_new: "4398046511103",
      };
  }

  function imgError(guildId) {
    const guildElement = document.getElementById("guild_" + guildId);
    const img = guildElement.querySelector("img");
    img.src = "/assets/default_guild_icon.jpg";
  }
  function endImgLoading(guildId) {
    const guildElement = document.getElementById("guild_" + guildId);
    guildElement.classList.remove("loading");
  }

  useEffect(() => {
    fetch(`${config.serverIp}preview_group`, {
      method: "POST",
      body: `{ "linkId": "${linkId}" }`,
    })
      .then((res) => res.json())
      .then((res) => {
        setGroup(res);
      });
    if (guildId) {
      fetch(`${config.serverIp}get_guild_channels`, {
        method: "POST",
        body: `{ "guildId": "${guildId}" }`,
      })
        .then((res) => res.json())
        .then((res) => {
          setChannels(res);
        });
    }
    let token = getCookie("token");
    if (!token || token === "undefined") {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        fetch(`${config.serverIp}login`, {
          method: "POST",
          body: `{ "token": "${code}" }`,
        })
          .then((res) => res.json())
          .then((res) => {
            if (!res.access_token || res.access_token === "undefined") {
              window.location.href = "/dashboard";
            } else {
              setCookie("token", res.access_token, res.expires_in - 1000);
              token = res.access_token;
              loadPage();
            }
          });
      } else {
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=812298057470967858&redirect_uri=${encodeURI(
          process.env.NEXT_PUBLIC_WEBSITE_URL
        )}%2Fdashboard&response_type=code&scope=identify%20guilds&state=${encodeURIComponent(
          window.location.href
        )}`;
      }
    } else {
      loadPage();
    }
    async function loadPage() {
      const userDatas = await (
        await fetch("https://discordapp.com/api/users/@me", {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        })
      ).json();
      if (userDatas.message === "401: Unauthorized") {
        setCookie("token", "", 0);
        window.location.href = "/dashboard";
      } else {
        setUser(userDatas);
        const guilds = await (
          await fetch("https://discordapp.com/api/v6/users/@me/guilds", {
            method: "GET",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
              Authorization: "Bearer " + token,
            },
          })
        ).json();
        if (guilds.retry_after) {
          setTimeout(() => {
            loadPage();
          }, guilds.retry_after);
        } else {
          if (guilds?.length > 0) setGuilds(guilds);
        }
      }
    }
  }, [linkId, guildId]);
  let adminGuildNumber = 0;
  for (let index = 0; index < guilds.length; index++) {
    const guild = guilds[index];
    if (checkAdminPerms(guild)) adminGuildNumber++;
  }

  return (
    <>
      <div className={dashboardStyles.background} />
      <div className={styles.page}>
        <a href="/" target="_blank" rel="noreferrer">
          <button className={styles.helpButton}>
            What is an interserver group ?
          </button>
        </a>
        {guildId ? (
          channels.result ? (
            <div className={styles.buttonContainer}>
              <h2 className={styles.subtitle}>And finally, select a channel</h2>
              {channels.result.map((channel, index) => (
                <button
                  onClick={() => {
                    fetch(`${config.apiV2}join_group_with_link`, {
                      method: "POST",
                      body: `{ "linkId": "${linkId}", "guildId": "${guildId}", "channelId": "${
                        channel.id
                      }", "token": "${getCookie("token")}" }`,
                    })
                      .then((res) => res.json())
                      .then((res) => {
                        if (res.error) popup("Error", res.error, "error");
                        else {
                          popup(
                            "Success",
                            "You have successfully joined the group !",
                            "success"
                          );
                          router.push(`/dashboard?guild=${guildId}`);
                        }
                      });
                  }}
                  key={"channel_" + index}
                  className={styles.channelButton}
                >
                  {channel.name}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() =>
                popup("Invite the bot", `Warning`, "warning", {
                  content: (
                    <p className="content">
                      It is necessary for Orax to access the content of the
                      messages in order to synchronize them between the
                      channels. By inviting Orax, it will be able to read all
                      the messages of your server.<br></br>
                      For security and privacy reasons, we suggest you to give
                      him the permission to read the messages only in the
                      channels the bot is concerned with.
                    </p>
                  ),
                  icon: meteor,
                  action: function () {
                    window.open(config.inviteLink + +"&guild_id=" + guildId);
                  },
                })
              }
              className={styles.addOraxButton}
            >
              You must add orax to your server to continue
            </button>
          )
        ) : guilds.length && group.hasOwnProperty("error") ? (
          <h1 className={styles.title}>The invitation link has expired</h1>
        ) : (
          <div className={styles.selectGuildContainer}>
            <h1 className={styles.title}>
              You have been invited to join the{" "}
              {group.name ? group.name : "..."} interserver group.
            </h1>
            <h2 className={styles.subtitle}>
              Select a server to join the group.
            </h2>
            <div
              style={{ maxWidth: adminGuildNumber > 9 ? "1000px" : "500px" }}
              className={styles.guilds}
            >
              {adminGuildNumber > 0
                ? guilds.map((g) =>
                    checkAdminPerms(g) ? (
                      <Link
                        key={"nav_guild_" + g.id}
                        href={`./${linkId}?guild=${g.id}`}
                      >
                        <div
                          id={"guild_" + g.id}
                          className={[
                            styles.navGuild,
                            !document.getElementById("guild_" + g.id) &&
                              "loading",
                            guild.id === g.id ? styles.selected : null,
                          ].join(" ")}
                        >
                          <img
                            className={styles.guildIcon}
                            onLoad={() => endImgLoading(g.id)}
                            onError={() => imgError(g.id)}
                            src={
                              g.icon
                                ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=96`
                                : "/assets/default_guild_icon.jpg"
                            }
                            alt={g.name + " (guild icon)"}
                          />
                          <p>
                            {g.name.length > 10
                              ? g.name.substring(0, 10) + "..."
                              : g.name}
                          </p>
                        </div>
                      </Link>
                    ) : null
                  )
                : [...Array(3)].map((o, index) => (
                    <div key={"nav_guild_" + index} className={styles.navGuild}>
                      <div
                        className={[styles.guildIcon, styles.placeHolder].join(
                          " "
                        )}
                      />
                    </div>
                  ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
