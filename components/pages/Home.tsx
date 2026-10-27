import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/Home.module.css";
import Footer from "../Footer";
import Header from "../Header";
import LocalizedHead from "../LocalizedHead";
import config from "../../utils/config.json";
import {
  createTranslator,
  localizedPath,
  type LanguageCode,
} from "../../utils/i18n";

const HOME_PATH = "/";

interface HomeProps {
  lang: LanguageCode;
}

export default function Home({ lang }: HomeProps) {
  const t = createTranslator(lang);
  const title = t("home.metaTitle");
  const description = t("home.metaDescription");
  const platforms = [
    t("home.platformDiscord"),
    t("home.platformFluxer"),
  ];
  const [platformIndex, setPlatformIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPlatformIndex((index) => (index + 1) % platforms.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [platforms.length]);

  return (
    <>
      <LocalizedHead
        lang={lang}
        path={HOME_PATH}
        title={title}
        description={description}
        keywords={t("home.metaKeywords")}
        imageAlt={t("home.ogImageAlt")}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Orax",
          url: HOME_PATH,
          description,
          applicationCategory: "CommunicationApplication",
          operatingSystem: "Web",
          inLanguage: lang,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }}
      />
      <Header lang={lang} />
      <section className={styles.gradient} aria-label="Hero">
        <div className={styles.platforms} aria-hidden="true">
          <span className={`${styles.platformBubble} ${styles.platformDiscord}`}>
            <img src="/assets/platforms/discord-color.svg" alt="" />
          </span>
          <span className={`${styles.platformBubble} ${styles.platformFluxer}`}>
            <img src="/assets/platforms/fluxer-color.svg" alt="" />
          </span>
          <span className={`${styles.platformBubble} ${styles.platformTelegram}`}>
            <img src="/assets/platforms/telegram.svg" alt="" />
          </span>
        </div>
        <div className={styles.heroContent}>
          <span className={styles.brand}>{t("home.brand")}</span>
          <h1 className={styles.title}>
            <span className={styles.srOnly}>{t("home.heroTitle")}</span>
            <span aria-hidden="true">
              {t("home.heroTitlePrefix")} {" "}
              {t("home.heroTitlePlatformPrefix")} {" "}
              <span className={styles.platformName}>
                {platforms[platformIndex]}
              </span>{" "}
              {t("home.heroTitleSuffix")}
            </span>
          </h1>
          <p className={styles.description}>{t("home.heroDescription")}</p>
          <a
            href={config.inviteLink}
            target="_blank"
            rel="noreferrer"
            className={`button round main ${styles.cta}`}
          >
            {t("home.cta")}
          </a>
          <a href="#description" aria-label={t("home.scrollToFeatures")}>
            <svg
              className={styles.bottomArrow}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>
      </section>
      <section id="description" aria-label="Features">
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className={styles.exampleContainer}>
          <img
            src="/assets/strip1.svg"
            className={[styles.strip, styles.v1].join(" ")}
            alt={t("home.waveAlt")}
          />
          <div className={styles.glassCard}>
            <Image
              src="/illustrations/example1.png"
              alt={t("home.syncChannelsAlt")}
              layout="fill"
            />
          </div>
          <p>
            <strong className={styles.strong}>
              {t("home.feature1Title")}
            </strong>
            <br />
            <br />
            {t("home.feature1Description")}
          </p>
        </div>
        <div className={[styles.exampleContainer, styles.reverse].join(" ")}>
          <div className={[styles.glassCard, styles.secondCard].join(" ")}>
            <Image
              src="/illustrations/example2.png"
              alt={t("home.slashCommandAlt")}
              layout="fill"
            />
          </div>
          <p>
            <strong className={styles.strong}>
              {t("home.feature2Title")}
            </strong>
            <br />
            <br />
            {t("home.feature2Description")}
          </p>
        </div>
      </section>
      <Link href="dashboard">
        <p className="button round center main">{t("home.dashboard")}</p>
      </Link>
      <section
        id="informations"
        className={styles.main}
        aria-label={t("home.resourcesTitle")}
      >
        <div className={styles.grid}>
          <a
            href="https://docs.oraxbot.com"
            target="_blank"
            rel="noreferrer"
            className={styles.card}
          >
            <h2>📚 {t("home.cardDocsTitle")}</h2>
            <p>{t("home.cardDocsDescription")}</p>
          </a>
          <a
            href="https://ko-fi.com/nicolasmarchand"
            target="_blank"
            rel="noreferrer"
            className={styles.card}
          >
            <h2>❤️ {t("home.cardTipTitle")}</h2>
            <p>{t("home.cardTipDescription")}</p>
          </a>
          <a
            href="https://discord.gg/e3pBtbum4A"
            target="_blank"
            rel="noreferrer"
            className={`${styles.card} ${styles.soft}`}
          >
            <h2>{t("home.cardSupportTitle")}</h2>
            <p>{t("home.cardSupportDescription")}</p>
          </a>
          <Link
            href={localizedPath(lang, "/explore")}
            className={`${styles.card} ${styles.soft}`}
          >
            <h2>{t("home.cardExploreTitle")}</h2>
            <p>{t("home.cardExploreDescription")}</p>
          </Link>
        </div>
      </section>
      <Footer lang={lang} showCopyright />
    </>
  );
}
