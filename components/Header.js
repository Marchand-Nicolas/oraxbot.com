import Image from "next/image";
import Link from "next/link";
import styles from "../styles/components/Header.module.css";
import { useEffect } from "react";

export default function NavBar({ theme = "light" }) {
  useEffect(() => {
    const nav = document.querySelector("nav");

    const handleScroll = () => {
      if (theme === "dark") {
        if (window.scrollY > 100)
          nav.style.background = "rgba(7, 11, 20, 0.85)";
        else nav.style.background = "rgba(7, 11, 20, 0.95)";
      } else {
        if (window.scrollY > 100)
          nav.style.background = "rgba(255, 255, 255, 0.2)";
        else nav.style.background = "white";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [theme]);
  return (
    <nav
      className={`${styles.nav} ${theme === "dark" ? styles.navDark : styles.navLight}`}
    >
      <Link href="/" className="line">
        <Image src="/logo.png" alt="Captcha logo" width={50} height={50} />
        <strong className={styles.title}>Orax bot</strong>
      </Link>
      <a href="https://ko-fi.com/A0A51KMQ7J" target="_blank">
        <img
          height="36"
          src="https://storage.ko-fi.com/cdn/kofi5.png?v=6"
          border="0"
          alt="Buy Me a Coffee at ko-fi.com"
        />
      </a>
    </nav>
  );
}
