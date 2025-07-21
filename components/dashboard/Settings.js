import styles from "../../styles/components/dashboard/Settings.module.css";
import config from "../../utils/config.json";
import { getCookie } from "../../utils/cookies";
import { useEffect, useState } from "react";
import Command from "./elements/Command";
import { api } from "../../utils/apiClient";
import { notify } from "../ui/NotificationSystem";

export default function Settings({ guild, guildId, settings, setSettings }) {
  const [save, setSave] = useState(0);
  const [errorMessages, setErrorMessages] = useState("");
  const [saved, setSaved] = useState(false);

  const updateSettings = async (e, field) => {
    let newValue = e.target.selectedIndex;
    switch (e.target.type) {
      case "checkbox":
        newValue = e.target.checked;
        break;
      case "text":
        newValue = e.target.value;
        if (field === "public_link") {
          const element = inviteLink;
          newValue = newValue.split("https://discord.gg/").join("");
          if (newValue.length > 15 || newValue.length < 4)
            return setErrorMessages("Invalid link");
          setErrorMessages("");
          element.value = newValue;
        }
        break;
    }
    setSettings((prevState) => ({ ...prevState, [field]: newValue }));
    setSave(1);
  };

  useEffect(() => {
    if (save === 0) return;
    if (save === 1) return setSave(2);

    const saveSettings = async () => {
      setSaved(false);

      try {
        const data = await fetch(`${config.serverIp}set_server_settings`, {
          method: "POST",
          body: JSON.stringify({
            token: getCookie("token"),
            guildId: guildId,
            settings: settings,
          }),
        }).then((res) => res.json());

        if (data.result) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000); // Hide success message after 3 seconds
        } else {
          throw new Error(data.error || "Failed to save settings");
        }
      } catch (error) {
        console.error("Failed to save settings:", error);
        notify.error(
          "Settings Save Failed",
          "Unable to save your settings. Please try again."
        );
        setErrorMessages("Failed to save settings");
      }
    };

    let timeout = setTimeout(saveSettings, 500);
    return () => clearTimeout(timeout);
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
          {config.serverLanguages.map((language, index) => (
            <option key={"lang_" + index} value={index}>
              {language}
            </option>
          ))}
        </select>
      </div>
      <div className={[styles.parameter, "line"].join(" ")}>
        <p className={styles.parameterName}>Public</p>
        <input
          checked={settings.public}
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
        </>
      ) : null}
      {errorMessages.length > 0 ? (
        <p className="message error">{errorMessages}</p>
      ) : saved ? (
        <p className="message success">Saved</p>
      ) : null}
    </>
  );
}
