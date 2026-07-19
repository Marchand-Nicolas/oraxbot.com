import { useEffect, useState, type ChangeEvent } from "react";
import config from "../../../../utils/config.json";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { platformApi } from "../../../../utils/platformApi";

interface OptionsFieldProps {
  label: string;
  fieldName: string;
  description?: string;
  groupId?: string | string[];
  guildId?: string | string[];
  channelId?: string | string[];
  apiEndpoint?: string;
  saveEndpoint?: string;
  options?: { id?: string; name?: string; value?: string; label?: string }[];
}

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
}: OptionsFieldProps) => {
  const [fieldValue, setFieldValue] = useState("");
  const [availableOptions, setAvailableOptions] = useState<
    { id?: string; name?: string; value?: string; label?: string }[]
  >(options);
  const effectiveGetEndpoint = channelId
    ? `${config.apiV2}get_channel_settings_field`
    : apiEndpoint;
  const effectiveSetEndpoint = channelId
    ? `${config.apiV2}set_channel_settings_field`
    : saveEndpoint;

  useEffect(() => {
    if (!guildId || !fieldName) return;

    // Fetch initial field value
    platformApi<Record<string, unknown>>(effectiveGetEndpoint, {
      groupId,
      guildId,
      channelId,
      fieldName,
    })
      .then((data) => {
        setFieldValue(
          typeof data[fieldName] != "undefined"
            ? String(data[fieldName])
            : "",
        );
      });

    // Fetch dynamic options if not provided
    if (options.length === 0) {
      platformApi<{ result?: { id: string; name: string }[] }>(
        `${config.apiV2}get_guild_channels`,
        {
          guildId,
        },
      )
        .then((res) => {
          setAvailableOptions(
            (res.result || []).map((c) => ({ id: c.id, name: c.name })),
          );
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    groupId,
    guildId,
    channelId,
    fieldName,
    options,
    apiEndpoint,
    effectiveGetEndpoint,
  ]);

  const handleChange = (value: string) => {
    setFieldValue(value);
    platformApi(effectiveSetEndpoint, {
      groupId,
      guildId,
      channelId,
      fieldName,
      fieldValue: value,
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
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          handleChange(e.target.value)
        }
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
