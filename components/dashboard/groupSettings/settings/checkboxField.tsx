import { useCallback, useEffect, useState } from "react";
import config from "../../../../utils/config.json";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { getCookie } from "../../../../utils/cookies";

interface CheckboxFieldProps {
  label: string;
  fieldName: string;
  description?: string;
  groupId?: string | string[];
  guildId?: string | string[];
  apiEndpoint?: string;
  saveEndpoint?: string;
  forceUnchecked?: boolean;
  onBeforeEnable?: () => boolean | Promise<boolean>;
}

const CheckboxField = ({
  label,
  fieldName,
  description = "",
  groupId,
  guildId,
  apiEndpoint = `${config.apiV2}get_group_settings_field`,
  saveEndpoint = `${config.apiV2}set_group_settings_field`,
  forceUnchecked = false,
  onBeforeEnable,
}: CheckboxFieldProps) => {
  const [isChecked, setIsChecked] = useState(false);

  const saveValue = useCallback(
    (fieldValue: boolean) => {
      fetch(saveEndpoint, {
        method: "POST",
        body: JSON.stringify({
          token: getCookie("token"),
          groupId,
          guildId,
          fieldName,
          fieldValue,
        }),
      });
    },
    [fieldName, groupId, guildId, saveEndpoint],
  );

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
      .then((data: Record<string, unknown>) => {
        const fieldValue = !!data[fieldName];
        if (forceUnchecked && fieldValue) saveValue(false);
        setIsChecked(forceUnchecked ? false : fieldValue);
      });
  }, [groupId, guildId, fieldName, apiEndpoint, forceUnchecked, saveValue]);

  useEffect(() => {
    if (!forceUnchecked || !isChecked) return;

    setIsChecked(false);
    saveValue(false);
  }, [forceUnchecked, isChecked, saveValue]);

  const handleToggle = async () => {
    const newValue = !isChecked;

    if (newValue && onBeforeEnable && !(await onBeforeEnable())) {
      setIsChecked(false);
      return;
    }

    setIsChecked(newValue);
    saveValue(newValue);
  };

  return (
    <>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          className={styles.checkboxInput}
        />
        <strong>{label}</strong>
      </label>
      {description && <label>{description}</label>}
    </>
  );
};

export default CheckboxField;
