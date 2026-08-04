import Link from "next/link";
import styles from "../../styles/Pricing.module.css";
import Footer from "../Footer";
import Header from "../Header";
import LocalizedHead from "../LocalizedHead";
import config from "../../utils/config.json";
import { createTranslator, type LanguageCode } from "../../utils/i18n";
import {
  getOraxPlusPricing,
  type PricingRegion,
} from "../../utils/pricing";

const PRICING_PATH = "/pricing";

interface PricingProps {
  lang: LanguageCode;
  pricingRegion: PricingRegion;
}

export default function Pricing({ lang, pricingRegion }: PricingProps) {
  const t = createTranslator(lang);
  const pricing = getOraxPlusPricing(pricingRegion, lang);
  const title = t("pricing.metaTitle");
  const description = t("pricing.metaDescription");

  return (
    <>
      <LocalizedHead
        lang={lang}
        path={PRICING_PATH}
        title={title}
        description={description}
        keywords={t("pricing.metaKeywords")}
        imageAlt={t("pricing.ogImageAlt")}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          url: PRICING_PATH,
          description,
          inLanguage: lang,
        }}
      />
      <Header lang={lang} />
      <div className={styles.page} aria-label={t("pricing.ariaLabelPricing")}>
        <header className={styles.header}>
          <h1>{t("pricing.pageTitle")}</h1>
          <p>{t("pricing.pageSubtitle")}</p>
        </header>

        <div className={styles.tiers}>
          <div
            className={styles.tier}
            aria-label={t("pricing.ariaLabelFreeTier")}
          >
            <p className={styles.tierName}>{t("pricing.tierFreeName")}</p>
            <div className={styles.price}>
              <span className={styles.priceAmount}>$0</span>
            </div>
            <p className={styles.tierDescription}>
              {t("pricing.tierFreeDescription")}
            </p>
            <ul className={styles.features}>
              <li>
                <span className={styles.check}>&#10003;</span>
                {t("pricing.tierFreeFeature1")}
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                {t("pricing.tierFreeFeature2")}
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                {t("pricing.tierFreeFeature3")}
              </li>
            </ul>
            <a
              href={config.inviteLink}
              target="_blank"
              rel="noreferrer"
              className={styles.cta}
            >
              {t("pricing.tierFreeCta")}
            </a>
          </div>

          <div
            className={`${styles.tier} ${styles.featured}`}
            aria-label={t("pricing.ariaLabelPlusTier")}
          >
            <span className={styles.tierBadge}>
              {t("pricing.tierPlusBadge")}
            </span>
            <p className={styles.tierName}>{t("pricing.tierPlusName")}</p>
            <div className={styles.price}>
              <span className={styles.priceAmount}>
                {t("pricing.fromPrice", { price: pricing.monthly })}
              </span>
              <span className={styles.pricePeriod}>
                {t("pricing.perMonth")}
              </span>
            </div>
            <p className={styles.freeVoteNote}>
              {t("pricing.freeVoteNotePrefix")}{" "}
              <strong>{t("pricing.freeVoteNoteStrong")}</strong>{" "}
              {t("pricing.freeVoteNoteSuffix")}
            </p>
            <p className={styles.tierDescription}>
              {t("pricing.tierPlusDescription")}
            </p>
            <ul className={styles.features}>
              <li>
                <span className={styles.check}>&#10003;</span>
                {t("pricing.tierPlusFeature1")}
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                {t("pricing.tierPlusFeature2")}
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                <a
                  href="https://docs.oraxbot.com/features/auto-translate"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.featureLink}
                >
                  {t("pricing.tierPlusFeature3")}
                </a>
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                <a
                  href="https://docs.oraxbot.com/commands/resync"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.featureLink}
                >
                  {t("pricing.tierPlusFeature4")}
                </a>
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                <a
                  href="https://docs.oraxbot.com/premium"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.featureLink}
                >
                  {t("pricing.tierPlusFeature5")}
                </a>
              </li>
              <li>
                <span className={styles.check}>&#10003;</span>
                {t("pricing.tierPlusFeature6")}
              </li>
            </ul>
            <Link href="/dashboard" className={`${styles.cta} ${styles.main}`}>
              {t("pricing.tierPlusCta")}
            </Link>
          </div>
        </div>

        <section
          className={styles.waysSection}
          aria-label={t("pricing.ariaLabelWays")}
        >
          <h2>{t("pricing.waysSectionTitle")}</h2>
          <div className={styles.ways}>
            <div className={styles.way}>
              <h3>{t("pricing.waysVoteTitle")}</h3>
              <p className={styles.wayPrice}>{t("pricing.waysVotePrice")}</p>
              <p>{t("pricing.waysVoteDescription")}</p>
            </div>
            <div className={styles.way}>
              <h3>{t("pricing.waysMonthlyTitle")}</h3>
              <p className={styles.wayPrice}>
                {t("pricing.waysMonthlyPrice", { price: pricing.monthly })}
              </p>
              <p>{t("pricing.waysMonthlyDescription")}</p>
            </div>
            <div className={styles.way}>
              <h3>{t("pricing.waysLifetimeTitle")}</h3>
              <p className={styles.wayPrice}>
                {t("pricing.waysLifetimePrice", {
                  price: pricing.lifetime,
                })}
              </p>
              <p>{t("pricing.waysLifetimeDescription")}</p>
            </div>
          </div>
          <p className={styles.waysNote}>{t("pricing.waysNote")}</p>
        </section>

        <section className={styles.faq} aria-label={t("pricing.ariaLabelFaq")}>
          <h2>{t("pricing.faqTitle")}</h2>
          <div className={styles.faqItem}>
            <h3>{t("pricing.faq1Question")}</h3>
            <p>{t("pricing.faq1Answer")}</p>
          </div>
          <div className={styles.faqItem}>
            <h3>{t("pricing.faq2Question")}</h3>
            <p>{t("pricing.faq2Answer")}</p>
          </div>
          <div className={styles.faqItem}>
            <h3>{t("pricing.faq3Question")}</h3>
            <p>{t("pricing.faq3Answer")}</p>
          </div>
          <div className={styles.faqItem}>
            <h3>{t("pricing.faq4Question")}</h3>
            <p>
              {t("pricing.faq4Answer")}{" "}
              <a href={`mailto:${t("pricing.faq4SupportLink")}`}>
                {t("pricing.faq4SupportLink")}
              </a>
              .
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3>{t("pricing.faq5Question")}</h3>
            <p>
              {t("pricing.faq5Answer")}{" "}
              <a href={`mailto:${t("pricing.faq4SupportLink")}`}>
                {t("pricing.faq5SupportLink")}
              </a>
              .
            </p>
          </div>
          <div className={styles.faqMore}>
            <a
              href="https://docs.oraxbot.com/faq"
              target="_blank"
              rel="noreferrer"
              className={`${styles.cta} ${styles.main}`}
            >
              {t("pricing.faqMore")}
            </a>
          </div>
        </section>
      </div>
      <Footer lang={lang} />
    </>
  );
}
