import styles from "../../styles/components/ui/inputs.module.css";

const TextInput = ({ placeholder, onChange, value, id }) => {
  return (
    <input
      className={styles.textInput}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      id={id}
    />
  );
};

export default TextInput;
