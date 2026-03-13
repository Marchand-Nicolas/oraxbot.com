import Image from "next/image";
import Link from "next/link";
import styles from "../styles/components/Footer.module.css";

export default function Footer({ theme = "light" }) {
  return (
    <footer
      className={`${styles.footer} ${theme === "dark" ? styles.footerDark : styles.footerLight}`}
    >
      <div>
        Orax bot
        <span>
          <Image src="/favicon.ico" alt="Orax logo" width={16} height={16} />
        </span>
      </div>
      •
      <Link href="/tos" className={styles.footerLink}>
        TOS
      </Link>
      •
      <a
        href="https://ko-fi.com/nicolasmarchand"
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.donate}>
          <p>❤️ 100% free</p>
        </div>
      </a>
    </footer>
  );
}
