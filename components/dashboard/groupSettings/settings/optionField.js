import { useEffect, useState } from "react";
import config from "../../../../utils/config";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { getCookie } from "../../../../utils/cookies";

const OptionsField = ({
  label,
  fieldName,
  description = "",
  groupId,
  guildId,
  channelId,
  apiEndpoint = `${config.apiV2}get_group_settings_field`,
  saveEndpoint = `${config.apiV2}set_group_settings_field`,
  options = [],
}) => {
  const [fieldValue, setFieldValue] = useState("");
  const [availableOptions, setAvailableOptions] = useState(options);
  const effectiveGetEndpoint = channelId
    ? `${config.apiV2}get_channel_settings_field`
    : apiEndpoint;
  const effectiveSetEndpoint = channelId
    ? `${config.apiV2}set_channel_settings_field`
    : saveEndpoint;

  useEffect(() => {
    if (!guildId || !fieldName) return;

    // Fetch initial field value
    fetch(effectiveGetEndpoint, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        channelId,
        fieldName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setFieldValue(
          typeof data[fieldName] != "undefined" ? data[fieldName] : ""
        );
      });

    // Fetch dynamic options if not provided
    if (options.length === 0) {
      fetch(`${config.serverIp}get_guild_channels`, {
        method: "POST",
        body: JSON.stringify({ guildId }),
      })
        .then((res) => res.json())
        .then((res) => {
          setAvailableOptions(res.result || []);
        });
    }
  }, [
    groupId,
    guildId,
    channelId,
    fieldName,
    options,
    apiEndpoint,
    effectiveGetEndpoint,
  ]);

  const handleChange = (value) => {
    setFieldValue(value);
    fetch(effectiveSetEndpoint, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        channelId,
        fieldName,
        fieldValue: value,
      }),
    });
  };

  return (
    <>
      <label htmlFor={fieldName}>
        <strong>{label}</strong>
      </label>
      {description && (
        <label className="hint" style={{ display: "block", marginTop: 4 }}>
          {description}
        </label>
      )}
      <select
        className={styles.selectInput}
        value={fieldValue}
        onChange={(e) => handleChange(e.target.value)}
        id={fieldName}
      >
        <option value="">Select an option</option>
        {availableOptions.map((option, index) => (
          <option key={`option_${index}`} value={option.id || option.value}>
            {option.name || option.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default OptionsField;
