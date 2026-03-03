import Image from "next/image";
import Link from "next/link";
import styles from "../styles/components/Header.module.css";

export default function Footer() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className="line">
        <Image src="/logo.png" alt="Captcha logo" width={50} height={50} />
        <strong className={styles.title}>Orax bot</strong>
      </Link>
      <a
        href="https://ko-fi.com/nicolasmarchand"
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.donate}>
          <p>❤️ Orax is 100% free</p>
        </div>
      </a>
    </nav>
  );
}
