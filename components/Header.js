import Image from "next/image";
import Link from "next/link";
import styles from "../styles/components/Header.module.css";
import { useRouter } from "next/router";

export default function Footer() {
  const router = useRouter();
  return (
    <nav className={styles.nav}>
      {router.pathname === "/" ? (
        <>
          <Image src="/logo.png" alt="Captcha logo" width={50} height={50} />
          <strong className={styles.title}>Orax bot</strong>
        </>
      ) : (
        <Link href="/">
          <div className={styles.goHomeContainer}>
            <svg
              className={styles.goHomeIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            <p>Go home</p>
          </div>
        </Link>
      )}
    </nav>
  );
}
