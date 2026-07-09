import type { ChangeEvent } from "react";
import styles from "../../styles/components/ui/inputs.module.css";

interface TextInputProps {
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  id?: string;
  className?: string;
}

const TextInput = ({
  placeholder,
  onChange,
  value,
  id,
  className,
}: TextInputProps) => {
  return (
    <input
      className={className ? `${styles.textInput} ${className}` : styles.textInput}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      id={id}
    />
  );
};

export default TextInput;
