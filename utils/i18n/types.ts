import type en from "./translations/en";

/**
 * The canonical shape every language file must follow.
 * Derived from the English source so adding a key to `en.ts`
 * forces every other language to provide it.
 */
export type Translation = typeof en;

/**
 * Resolve all dot-notation paths in a nested object type.
 * e.g. `{ common: { cancel: string } }` → `"common.cancel"`
 */
type NestedPaths<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T & string]: T[K] extends Record<string, unknown>
        ? `${K}.${NestedPaths<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

/** All valid translation keys (e.g. `"common.cancel" | "nav.support" | …`). */
export type TranslationKey = NestedPaths<Translation>;

/** Supported ISO language codes. */
export type LanguageCode = "en" | "es" | "fr";

/** Parameters for string interpolation ({variable}). */
export type TranslateParams = Record<string, string | number>;

/**
 * Translate function bound to a specific language.
 * Accepts a dot-notation key and optional interpolation params.
 */
export type TranslateFn = (
  key: TranslationKey,
  params?: TranslateParams,
) => string;
