import { useEffect, useState } from "react";
import config from "../../../../utils/config";
import styles from "../../../../styles/components/ui/inputs.module.css";
import { getCookie } from "../../../../utils/cookies";

const TextareaField = ({
  label,
  fieldName,
  description = "",
  groupId,
  guildId,
  apiEndpoint = `${config.apiV2}get_group_settings_field`,
  saveEndpoint = `${config.apiV2}set_group_settings_field`,
  placeholder = "Write here...",
  rows = 6,
  parser = (value) => value,
}) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!groupId || !guildId || !fieldName) return;
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
        setValue(data[fieldName] || "");
      });
  }, [groupId, guildId, fieldName, apiEndpoint]);

  const handleChange = (rawValue) => {
    const parsedValue = parser(rawValue);
    setValue(parsedValue);
    fetch(saveEndpoint, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName,
        fieldValue: parsedValue,
      }),
    });
  };

  return (
    <>
      <label>
        <strong>{label}</strong>
      </label>
      {description && <label>{description}</label>}
      <textarea
        className={styles.textInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        id={fieldName}
        rows={rows}
      />
    </>
  );
};

export default TextareaField;

