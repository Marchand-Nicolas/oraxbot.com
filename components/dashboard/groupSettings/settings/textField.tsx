import { useEffect, useState, type ChangeEvent } from "react";
import config from "../../../../utils/config.json";
import { platformApi } from "../../../../utils/platformApi";
import TextInput from "../../../ui/textInput";

interface TextFieldProps {
  label: string;
  fieldName: string;
  description?: string;
  groupId?: string | string[];
  guildId?: string | string[];
  apiEndpoint?: string;
  saveEndpoint?: string;
  placeholder?: string;
  parser?: (value: string) => string;
}

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
}: TextFieldProps) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!groupId || !guildId || !fieldName) return;

    // Fetch initial field value
    platformApi<Record<string, string>>(apiEndpoint, {
      groupId,
      guildId,
      fieldName,
    }).then((data) => {
      setValue(data[fieldName] || ""); // Ensure it's set to a string
    });
  }, [groupId, guildId, fieldName, apiEndpoint]);

  const handleChange = (rawValue: string) => {
    const parsedValue = parser(rawValue); // Apply the parser function
    setValue(parsedValue);

    // Save the updated value
    platformApi(saveEndpoint, {
      groupId,
      guildId,
      fieldName,
      fieldValue: parsedValue,
    });
  };

  return (
    <>
      <label>
        <strong>{label}</strong>
      </label>
      {description && <label>{description}</label>}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value)
        }
        id={fieldName}
      />
    </>
  );
};

export default TextField;
