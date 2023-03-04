import styles from "../styles/components/Loading.module.css";

export default function Loading() {
  return (
    <div className="popup">
      <div className={styles.container}>
        <div className="loading" />
      </div>
    </div>
  );
}
