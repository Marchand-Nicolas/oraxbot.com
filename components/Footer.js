import Image from "next/image";
import styles from "../styles/components/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      Orax bot
      <span>
        <Image src="/favicon.ico" alt="Orax logo" width={16} height={16} />
      </span>
    </footer>
  );
}
