import Head from "next/head";
import {
  LOCALE_MAP,
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_URL,
  SUPPORTED_LANGS,
  localizedUrl,
  type LanguageCode,
} from "../utils/i18n";

interface LocalizedHeadProps {
  lang: LanguageCode;
  /** Page path, e.g. "/" or "/pricing". */
  path: string;
  title: string;
  description: string;
  imageAlt: string;
  keywords?: string;
  /** Set to `true` for pages that should not be indexed (e.g. login). */
  noindex?: boolean;
  /** Optional JSON-LD structured data block. */
  jsonLd?: Record<string, unknown>;
}

/**
 * Renders the full `<head>` of a localized public page: canonical,
 * hreflang siblings, OpenGraph, Twitter Card and optional JSON-LD.
 * Replaces the ~60 lines of duplicated meta tags previously copy-pasted
 * across `Home`, `Pricing` and `LoginHub`.
 */
export default function LocalizedHead({
  lang,
  path,
  title,
  description,
  imageAlt,
  keywords,
  noindex = false,
  jsonLd,
}: LocalizedHeadProps) {
  const canonical = localizedUrl(lang, path);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={SITE_NAME} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      <link rel="canonical" href={canonical} />

      {SUPPORTED_LANGS.map((code) => (
        <link
          key={code}
          rel="alternate"
          hrefLang={code}
          href={localizedUrl(code, path)}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={localizedUrl("en", path)}
      />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={SITE_LOGO_URL} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:locale" content={LOCALE_MAP[lang]} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={SITE_LOGO_URL} />

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
