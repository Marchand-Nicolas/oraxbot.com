import styles from "../styles/components/Loading.module.css";

export default function LoadingCircle() {
  return (
    <div className={styles.loadingContainer}>
      <div className="loading" />
    </div>
  );
}
