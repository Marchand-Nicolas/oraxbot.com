import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/Article.module.css";
import Footer from "../Footer";
import Header from "../Header";
import LocalizedHead from "../LocalizedHead";
import config from "../../utils/config.json";
import { createBlogTranslator } from "../../utils/i18n/blog";
import { getArticleMeta } from "../../utils/i18n/blog/articles";
import { SITE_URL, localizedUrl, type LanguageCode } from "../../utils/i18n";

const ARTICLE_SLUG = "discord-auto-translation-free";
const ARTICLE_PATH = `/blog/${ARTICLE_SLUG}`;

const ARTICLE_META = getArticleMeta(ARTICLE_SLUG);

const LOCALE_FOR_DATE: Record<LanguageCode, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
};

interface ArticleProps {
  lang: LanguageCode;
}

export default function Article({ lang }: ArticleProps) {
  const t = createBlogTranslator(lang);
  const title = t("metaTitle");
  const description = t("metaDescription");
  const homePath = lang === "en" ? "/" : `/${lang}/`;
  const pricingPath = lang === "en" ? "/pricing" : `/${lang}/pricing`;

  const publishedDate = new Date(ARTICLE_META.publishedAt);
  const formattedPublishedDate = new Intl.DateTimeFormat(
    LOCALE_FOR_DATE[lang],
    { year: "numeric", month: "long", day: "numeric" },
  ).format(publishedDate);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: (
      [
        ["faq1Q", "faq1A"],
        ["faq2Q", "faq2A"],
        ["faq3Q", "faq3A"],
        ["faq4Q", "faq4A"],
        ["faq5Q", "faq5A"],
        ["faq6Q", "faq6A"],
      ] as const
    ).map(([qKey, aKey]) => ({
      "@type": "Question",
      name: t(qKey),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(aKey),
      },
    })),
  };

  return (
    <>
      <LocalizedHead
        lang={lang}
        path={ARTICLE_PATH}
        title={title}
        description={description}
        keywords={t("metaKeywords")}
        imageAlt={t("ogImageAlt")}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: t("heroTitle"),
          description,
          inLanguage: lang,
          datePublished: ARTICLE_META.publishedAt,
          dateModified: ARTICLE_META.modifiedAt,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": localizedUrl(lang, ARTICLE_PATH),
          },
          author: {
            "@type": "Organization",
            name: "Orax",
            url: SITE_URL,
          },
          publisher: {
            "@type": "Organization",
            name: "Orax",
            url: SITE_URL,
          },
        }}
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>
      <Header lang={lang} />
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href={homePath}>{t("breadcrumbHome")}</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href={`${ARTICLE_PATH}`}>{t("breadcrumbBlog")}</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>
            {t("heroTitle")}
          </span>
        </nav>

        <header className={styles.hero}>
          <span className={styles.heroBadge}>
            {t("badgeGuide")}
          </span>
          <span className={styles.heroEyebrow}>
            {t("heroEyebrow")}
          </span>
          <h1 className={styles.heroTitle}>
            {t("heroTitle")}
          </h1>
          <p className={styles.heroSubtitle}>
            {t("heroSubtitle")}
          </p>
          <div className={styles.meta}>
            <time dateTime={ARTICLE_META.publishedAt}>
              {t("publishedOn", { date: formattedPublishedDate })}
            </time>
            <span className={styles.metaDot} aria-hidden="true" />
            <span>
              {t("readingTime", {
                minutes: ARTICLE_META.readingTimeMinutes,
              })}
            </span>
          </div>
        </header>

        <article className={styles.content}>
          <p>{t("introP1")}</p>
          <p>{t("introP2")}</p>
          <p>{t("introP3")}</p>
          <p>{t("introP4")}</p>
          <p className={styles.seeAlso}>
            {t("seeAlsoPricingPrefix")}
            <Link href={pricingPath} className={styles.seeAlsoLink}>
              {t("pricingLinkAnchor")}
            </Link>
            .
          </p>

          <aside className={styles.toc} aria-label="Table of contents">
            <p className={styles.tocTitle}>{t("tocTitle")}</p>
            <ol className={styles.tocList}>
              <li>
                <a href="#what-is-auto-translate">
                  {t("toc1")}
                </a>
              </li>
              <li>
                <a href="#why-orax">{t("toc2")}</a>
              </li>
              <li>
                <a href="#step-1">{t("toc3")}</a>
              </li>
              <li>
                <a href="#step-2">{t("toc4")}</a>
              </li>
              <li>
                <a href="#step-3">{t("toc5")}</a>
              </li>
              <li>
                <a href="#step-4">{t("toc6")}</a>
              </li>
              <li>
                <a href="#step-5">{t("toc7")}</a>
              </li>
              <li>
                <a href="#step-6">{t("toc8")}</a>
              </li>
              <li>
                <a href="#protected">{t("toc9")}</a>
              </li>
              <li>
                <a href="#tips">{t("toc10")}</a>
              </li>
              <li>
                <a href="#faq">{t("toc11")}</a>
              </li>
            </ol>
          </aside>

          <section
            id="what-is-auto-translate"
            className={styles.section}
          >
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>1</span>
              <span>{t("section1Title")}</span>
            </h2>
            <p>{t("section1P1")}</p>
            <p>{t("section1P2")}</p>
            <ul className={styles.bullets}>
              <li>{t("section1Li1")}</li>
              <li>{t("section1Li2")}</li>
              <li>{t("section1Li3")}</li>
              <li>{t("section1Li4")}</li>
              <li>{t("section1Li5")}</li>
            </ul>
          </section>

          <section id="why-orax" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>2</span>
              <span>{t("section2Title")}</span>
            </h2>
            <p>{t("section2P1")}</p>
            <ul className={styles.bullets}>
              <li>{t("section2Li1")}</li>
              <li>{t("section2Li2")}</li>
              <li>{t("section2Li3")}</li>
              <li>{t("section2Li4")}</li>
              <li>{t("section2Li5")}</li>
            </ul>
          </section>

          <section id="step-1" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>3</span>
              <span>{t("section3Title")}</span>
            </h2>
            <p>{t("section3P1")}</p>
            <p>{t("section3Step")}</p>
            <a
              href={config.inviteLink}
              target="_blank"
              rel="noreferrer"
              className={styles.cta}
            >
              {t("section3Cta")}
            </a>
            <p>{t("section3P2")}</p>
            <div className={styles.tipBox}>
              <p className={styles.tipTitle}>
                {t("section3TipTitle")}
              </p>
              <p className={styles.tipBody}>
                {t("section3TipBody")}
              </p>
            </div>
          </section>

          <section id="step-2" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>4</span>
              <span>{t("section4Title")}</span>
            </h2>
            <p>{t("section4P1")}</p>
            <p>{t("section4P2")}</p>
            <ol className={styles.steps}>
              <li>{t("section4Li1")}</li>
              <li>{t("section4Li2")}</li>
              <li>{t("section4Li3")}</li>
            </ol>
            <p>{t("section4P3")}</p>
          </section>

          <section id="step-3" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>5</span>
              <span>{t("section5Title")}</span>
            </h2>
            <p>{t("section5P1")}</p>
            <ul className={styles.bullets}>
              <li>{t("section5Li1")}</li>
              <li>{t("section5Li2")}</li>
              <li>{t("section5Li3")}</li>
            </ul>
            <p>{t("section5P2")}</p>
            <ol className={styles.steps}>
              <li>{t("section5Li4")}</li>
            </ol>
            <p>{t("section5P3")}</p>
          </section>

          <section id="step-4" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>6</span>
              <span>{t("section6Title")}</span>
            </h2>
            <p>{t("section6P1")}</p>
            <p>{t("section6P2")}</p>
            <ol className={styles.steps}>
              <li>
                <a
                  href={config.topggVoteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.linkInline}
                >
                  {t("section6Li1Link")}
                </a>
                . {t("section6Li1")}
              </li>
              <li>{t("section6Li2")}</li>
              <li>{t("section6Li3")}</li>
              <li>{t("section6Li4")}</li>
            </ol>
            <div className={styles.tipBox}>
              <p className={styles.tipTitle}>
                {t("section6TipTitle")}
              </p>
              <p className={styles.tipBody}>
                {t("section6TipBody")}
              </p>
            </div>
          </section>

          <section id="step-5" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>7</span>
              <span>{t("section7Title")}</span>
            </h2>
            <p>{t("section7P1")}</p>
            <ol className={styles.steps}>
              <li>{t("section7Li1")}</li>
              <li>{t("section7Li2")}</li>
              <li>{t("section7Li3")}</li>
            </ol>
            <p>{t("section7P2")}</p>
          </section>

          <section id="step-6" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>8</span>
              <span>{t("section8Title")}</span>
            </h2>
            <p>{t("section8P1")}</p>
            <p>{t("section8P2")}</p>
            <ol className={styles.steps}>
              <li>{t("section8Li1")}</li>
              <li>{t("section8Li2")}</li>
              <li>{t("section8Li3")}</li>
              <li>{t("section8Li4")}</li>
            </ol>
            <p>{t("section8P3")}</p>
            <p>{t("section8P4")}</p>
          </section>

          <section id="protected" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>9</span>
              <span>{t("section9Title")}</span>
            </h2>
            <p>{t("section9P1")}</p>
            <ul className={styles.bullets}>
              <li>{t("section9Li1")}</li>
              <li>{t("section9Li2")}</li>
              <li>{t("section9Li3")}</li>
              <li>{t("section9Li4")}</li>
            </ul>
            <p>{t("section9P2")}</p>
          </section>

          <section id="tips" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>10</span>
              <span>{t("section10Title")}</span>
            </h2>
            <p>{t("section10P1")}</p>
            <ul className={styles.bullets}>
              <li>{t("section10Li1")}</li>
              <li>{t("section10Li2")}</li>
              <li>{t("section10Li3")}</li>
              <li>{t("section10Li4")}</li>
              <li>{t("section10Li5")}</li>
            </ul>
          </section>

          <section id="faq" className={styles.faq}>
            <h2 className={styles.faqTitle}>
              {t("faqTitle")}
            </h2>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>{t("faq1Q")}</h3>
              <p className={styles.faqA}>{t("faq1A")}</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>{t("faq2Q")}</h3>
              <p className={styles.faqA}>{t("faq2A")}</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>{t("faq3Q")}</h3>
              <p className={styles.faqA}>{t("faq3A")}</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>{t("faq4Q")}</h3>
              <p className={styles.faqA}>{t("faq4A")}</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>{t("faq5Q")}</h3>
              <p className={styles.faqA}>{t("faq5A")}</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQ}>{t("faq6Q")}</h3>
              <p className={styles.faqA}>{t("faq6A")}</p>
            </div>
          </section>

          <section className={styles.finalCta}>
            <h2 className={styles.finalCtaTitle}>
              {t("ctaTitle")}
            </h2>
            <p className={styles.finalCtaSubtitle}>
              {t("ctaSubtitle")}
            </p>
            <div className={styles.finalCtaButtons}>
              <a
                href={config.inviteLink}
                target="_blank"
                rel="noreferrer"
                className={styles.cta}
              >
                {t("ctaPrimary")}
              </a>
              <a
                href={config.topggVoteUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.cta}
              >
                {t("ctaSecondary")}
              </a>
            </div>
          </section>

          <Link href={homePath} className={styles.backHome}>
            ← {t("backToHome")}
          </Link>
        </article>
      </main>
      <Footer lang={lang} />
    </>
  );
}
