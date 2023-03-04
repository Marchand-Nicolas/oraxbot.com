import styles from "../../../styles/components/dashboard/elements/Command.module.css";

export default function Command({ name }) {
  return <strong className={styles.container}>/{name}</strong>;
}
