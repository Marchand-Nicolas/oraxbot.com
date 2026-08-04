import Link from "next/link";
import styles from "../styles/components/Footer.module.css";
import { createTranslator, type LanguageCode } from "../utils/i18n";

export default function Footer({
  theme = "light",
  lang = "en",
}: {
  theme?: string;
  lang?: LanguageCode;
}) {
  const t = createTranslator(lang);
  return (
    <footer
      className={`${styles.footer} ${theme === "dark" ? styles.footerDark : styles.footerLight}`}
    >
      <a href="https://docs.oraxbot.com" target="_blank" rel="noreferrer">
        <div className={styles.tip}>
          <p>{t("siteFooter.docs")}</p>
        </div>
      </a>
      •
      <Link href="/tos" className={styles.footerLink}>
        {t("siteFooter.tos")}
      </Link>
      •
      <a
        href="https://github.com/Marchand-Nicolas/oraxbot.com"
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.tip}>
          <p>{t("siteFooter.github")}</p>
        </div>
      </a>
    </footer>
  );
}
