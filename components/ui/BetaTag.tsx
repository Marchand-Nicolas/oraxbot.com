import styles from "../../styles/components/ui/BetaTag.module.css";

export default function BetaTag() {
  console.log(styles.betaTag);
  return <p className={styles.betaTag}>Beta</p>;
}
