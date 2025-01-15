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
  apiEndpoint = `${config.apiV2}get_group_settings_field`,
  saveEndpoint = `${config.apiV2}set_group_settings_field`,
  options = [],
}) => {
  const [fieldValue, setFieldValue] = useState("");
  const [availableOptions, setAvailableOptions] = useState(options);

  useEffect(() => {
    if (!groupId || !guildId || !fieldName) return;

    // Fetch initial field value
    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setFieldValue(data[fieldName] || "");
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
  }, [groupId, guildId, fieldName, options, apiEndpoint]);

  const handleChange = (value) => {
    setFieldValue(value);
    fetch(saveEndpoint, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName,
        fieldValue: value,
      }),
    });
  };

  return (
    <div className={styles.fieldContainer}>
      <label>
        <strong>{label}</strong>
      </label>
      {description && <p className={styles.description}>{description}</p>}
      <select
        className={styles.selectInput}
        value={fieldValue || ""}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">Select an option</option>
        {availableOptions.map((option, index) => (
          <option key={`option_${index}`} value={option.id || option.value}>
            {option.name || option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OptionsField;
