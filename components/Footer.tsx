import Link from "next/link";
import styles from "../styles/components/Footer.module.css";

export default function Footer({ theme = "light" }: { theme?: string }) {
  return (
    <footer
      className={`${styles.footer} ${theme === "dark" ? styles.footerDark : styles.footerLight}`}
    >
      <a href="https://docs.oraxbot.com" target="_blank" rel="noreferrer">
        <div className={styles.tip}>
          <p>Docs</p>
        </div>
      </a>
      •
      <Link href="/tos" className={styles.footerLink}>
        TOS
      </Link>
      •
      <a
        href="https://github.com/Marchand-Nicolas/oraxbot.com"
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.tip}>
          <p>GitHub</p>
        </div>
      </a>
    </footer>
  );
}
