import { useEffect, useState } from "react";
import config from "../../../../utils/config";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { getCookie } from "../../../../utils/cookies";

const CheckboxField = ({
  label,
  fieldName,
  description = "",
  groupId,
  guildId,
  apiEndpoint = `${config.apiV2}get_group_settings_field`,
  saveEndpoint = `${config.apiV2}set_group_settings_field`,
}) => {
  const [isChecked, setIsChecked] = useState(false);

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
        setIsChecked(!!data[fieldName]); // Ensure it is treated as a boolean
      });
  }, [groupId, guildId, fieldName, apiEndpoint]);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);

    // Save updated value
    fetch(saveEndpoint, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName,
        fieldValue: newValue,
      }),
    });
  };

  return (
    <div className={styles.fieldContainer}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          className={styles.checkboxInput}
        />
        <strong>{label}</strong>
      </label>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
};

export default CheckboxField;
