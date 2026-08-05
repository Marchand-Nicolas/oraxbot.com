import type en from "./en";

/**
 * The canonical shape every blog language file must follow.
 * Derived from the English source so adding a key to `en.ts`
 * forces every other language file to provide it.
 */
export type BlogArticle = typeof en;

/**
 * Resolve all dot-notation paths in a nested object type.
 * e.g. `{ section1: { title: string } }` → `"section1.title"`.
 *
 * Blog articles use flat keys (e.g. `section1Title`) — there's no
 * nesting — so we return the leaf keys as-is.
 */
type NestedPaths<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T & string]: T[K] extends Record<string, unknown>
        ? `${K}.${NestedPaths<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

/** All valid translation keys for blog articles. */
export type BlogTranslationKey = NestedPaths<BlogArticle>;

/** Parameters for string interpolation ({variable}). */
export type BlogTranslateParams = Record<string, string | number>;

/**
 * Translate function bound to a specific language.
 * Accepts a key and optional interpolation params.
 */
export type BlogTranslateFn = (
  key: BlogTranslationKey,
  params?: BlogTranslateParams,
) => string;
