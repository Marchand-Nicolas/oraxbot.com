import styles from "../../styles/components/dashboard/Settings.module.css";
import config from "../../utils/config.json";
import { getCookie } from "../../utils/cookies";
import { useEffect, useState, type ChangeEvent } from "react";
import Command from "./elements/Command";
import { notify } from "../ui/NotificationSystem";
import type { Guild, GuildSettings } from "../../types";

interface SettingsProps {
  guild: Guild;
  guildId: string | string[] | undefined;
  settings: GuildSettings;
  setSettings: (
    updater: (prevState: GuildSettings) => GuildSettings,
  ) => void;
}

export default function Settings({
  guild,
  guildId,
  settings,
  setSettings,
}: SettingsProps) {
  const [save, setSave] = useState(0);

  const updateSettings = async (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string,
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    let newValue: string | number | boolean = "selectedIndex" in target
      ? target.selectedIndex
      : target.value;
    switch (target.type) {
      case "checkbox":
        newValue = (target as HTMLInputElement).checked;
        break;
      case "text":
        newValue = target.value;
        if (field === "public_link") {
          const element = document.getElementById(
            "inviteLink",
          ) as HTMLInputElement | null;
          newValue = (newValue as string)
            .split("https://discord.gg/")
            .join("");
          if ((newValue as string).length > 200)
            return notify.error("Invalid link");
          if (element) element.value = newValue as string;
        }
        break;
    }
    setSettings((prevState) => ({
      ...prevState,
      [field]: newValue,
    }));
    setSave(1);
  };

  useEffect(() => {
    if (save === 0) return;
    if (save === 1) return setSave(2);

    const saveSettings = async () => {
      try {
        const data = await fetch(`${config.apiV2}set_server_settings`, {
          method: "POST",
          body: JSON.stringify({
            token: getCookie("token"),
            guildId: guildId,
            settings: settings,
          }),
        }).then((res) => res.json());

        if (!data.result) {
          throw new Error(data.error || "Failed to save settings");
        }
      } catch (error) {
        console.error("Failed to save settings:", error);
        notify.error(
          "Settings Save Failed",
          "Unable to save your settings. Please try again.",
        );
      }
    };
    saveSettings();
  }, [save, settings, guildId]);

  return (
    <>
      <h2>⚙️ Settings</h2>
      <div className={[styles.parameter, "line"].join(" ")}>
        <p className={styles.parameterName}>Language</p>
        <select
          key={"guild_" + guildId + "_" + settings.lang}
          id="selectLang"
          onChange={(e) => updateSettings(e, "lang")}
          defaultValue={settings.lang}
          className={["input", styles.parameterInput].join(" ")}
        >
          {config.serverLanguages.map((language: string, index: number) => (
            <option key={"lang_" + index} value={index}>
              {language}
            </option>
          ))}
        </select>
      </div>
      <div className={[styles.parameter, "line"].join(" ")}>
        <p className={styles.parameterName}>Public</p>
        <input
          checked={settings.public as boolean}
          onChange={(e) => updateSettings(e, "public")}
          type="checkbox"
        />
      </div>
      {settings.public ? (
        <>
          <p className="information">
            <strong>Your server is public:</strong>
            <br />
            this means that members of your interserver group(s) will be able to
            join <strong>{guild.name}</strong> using the{" "}
            <Command name="channel-infos" /> command
          </p>
          <div className={[styles.parameter, "line wrap"].join(" ")}>
            <p className={styles.parameterName}>Public link</p>
            <p className="hint">discord.gg/</p>
            <input
              id="inviteLink"
              type="text"
              defaultValue={settings.public_link ? settings.public_link : ""}
              onChange={(e) => {
                updateSettings(e, "public_link");
              }}
              className={["input", styles.parameterInput].join(" ")}
            />
          </div>
          <div className={[styles.parameter, "line"].join(" ")}>
            <p className={styles.parameterName}>Public name</p>
            <input
              id="publicName"
              type="text"
              placeholder={guild.name || ""}
              defaultValue={settings.public_name || ""}
              onChange={(e) => {
                updateSettings(e, "public_name");
              }}
              className={["input", styles.parameterInput].join(" ")}
            />
          </div>
        </>
      ) : null}
    </>
  );
}
