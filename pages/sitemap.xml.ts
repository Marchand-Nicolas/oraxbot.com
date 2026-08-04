import { GetServerSideProps } from "next";

const SITEMAP_BASE_URL = "https://oraxbot.com";

/**
 * Pages that exist in every supported language.
 * Listed here automatically get full hreflang siblings in the sitemap.
 */
const LOCALES = ["en", "fr", "es"] as const;
type Locale = (typeof LOCALES)[number];

const LOCALIZED_PATHS = new Set(["/", "/pricing", "/login"]);

interface PageEntry {
  path: string;
  priority: string;
  changefreq: string;
}

const STATIC_PAGES: PageEntry[] = [
  { path: "", priority: "1.0", changefreq: "weekly" },
  { path: "/pricing", priority: "0.8", changefreq: "monthly" },
  { path: "/explore", priority: "0.8", changefreq: "daily" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/tos", priority: "0.3", changefreq: "yearly" },
];

/** Builds the localized URL for a given page + locale. */
function localizedUrl(path: string, locale: Locale): string {
  const tail = path === "" ? "/" : path;
  if (locale === "en") return `${SITEMAP_BASE_URL}${tail}`;
  return `${SITEMAP_BASE_URL}/${locale}${tail}`;
}

/**
 * Generates the `<xhtml:link>` hreflang siblings for a single page.
 * Localized pages emit all variants; non-localized pages only emit
 * the `x-default` self-reference.
 */
function hreflangLinks(path: string): string {
  const isLocalized = LOCALIZED_PATHS.has(path);

  if (!isLocalized) {
    return `    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(path, "en")}" />`;
  }

  const variants: { hreflang: string; href: string }[] = [
    { hreflang: "x-default", href: localizedUrl(path, "en") },
    ...LOCALES.map((locale) => ({
      hreflang: locale,
      href: localizedUrl(path, locale),
    })),
  ];
  return variants
    .map(
      (v) =>
        `    <xhtml:link rel="alternate" hreflang="${v.hreflang}" href="${v.href}" />`,
    )
    .join("\n");
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const lastModified = new Date().toISOString();

  const urls = STATIC_PAGES.map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${localizedUrl(path, "en")}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangLinks(path)}
  </url>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
