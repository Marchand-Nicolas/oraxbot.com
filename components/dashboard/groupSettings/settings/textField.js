import { useEffect, useState } from "react";
import config from "../../../../utils/config";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { getCookie } from "../../../../utils/cookies";
import TextInput from "../../../ui/textInput";

const TextField = ({
  label,
  fieldName,
  description = "",
  groupId,
  guildId,
  apiEndpoint = `${config.apiV2}get_group_settings_field`,
  saveEndpoint = `${config.apiV2}set_group_settings_field`,
  placeholder = "Enter text here...",
  parser = (value) => value, // Default parser (no transformation)
}) => {
  const [value, setValue] = useState("");

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
        setValue(data[fieldName] || ""); // Ensure it's set to a string
      });
  }, [groupId, guildId, fieldName, apiEndpoint]);

  const handleChange = (rawValue) => {
    const parsedValue = parser(rawValue); // Apply the parser function
    setValue(parsedValue);

    // Save the updated value
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
      {description && <p className={styles.description}>{description}</p>}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        id={fieldName}
      />
    </>
  );
};

export default TextField;
