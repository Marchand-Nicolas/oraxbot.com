/**
 * Blog article metadata that doesn't change between languages.
 * Add a new entry here every time you publish a new article — the
 * slug is used both by the page route and the sitemap entry.
 */
export interface BlogArticleMeta {
  /** URL slug (without locale prefix). Used as the page route. */
  slug: string;
  /** ISO 8601 publication date. Used by JSON-LD and the sitemap. */
  publishedAt: string;
  /** ISO 8601 last-modified date. Used by JSON-LD and the sitemap. */
  modifiedAt: string;
  /**
   * Estimated reading time in minutes. Computed once at publication
   * time and stored alongside the article — keeps the page static
   * and avoids re-measuring on every render.
   */
  readingTimeMinutes: number;
}

export const BLOG_ARTICLES: BlogArticleMeta[] = [
  {
    slug: "discord-auto-translation-free",
    publishedAt: "2026-08-05T09:00:00.000Z",
    modifiedAt: "2026-08-05T09:00:00.000Z",
    readingTimeMinutes: 7,
  },
];

/** Lookup helper — throws if the slug isn't registered. */
export function getArticleMeta(slug: string): BlogArticleMeta {
  const meta = BLOG_ARTICLES.find((a) => a.slug === slug);
  if (!meta) {
    throw new Error(`Unknown blog article slug: ${slug}`);
  }
  return meta;
}
