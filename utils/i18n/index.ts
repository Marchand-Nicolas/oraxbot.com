import type {
  LanguageCode,
  TranslateFn,
  TranslateParams,
  TranslationKey,
} from "./types";
import type { VoteProviderType } from "../platforms/types";
import en from "./translations/en";
import es from "./translations/es";
import fr from "./translations/fr";

/**
 * Registry of all language packs. New languages are added by importing a
 * translation file and registering it here.
 */
const translations = {
  en,
  es,
  fr,
} as const;

/**
 * Ordered list matching `config.json > serverLanguages`. The numeric
 * `settings.lang` value stored per-server is an index into this array.
 *   0 → English, 1 → Español, 2 → Français
 */
export const languageOrder: LanguageCode[] = ["en", "es", "fr"];

/** Map a numeric `settings.lang` index to a `LanguageCode`. */
export function getLanguageByIndex(index: number): LanguageCode {
  const code = languageOrder[index];
  return code ?? "en";
}

/** Map a `LanguageCode` back to its numeric index. */
export function getLanguageIndex(code: LanguageCode): number {
  const idx = languageOrder.indexOf(code);
  return idx === -1 ? 0 : idx;
}

/**
 * Resolve a dot-notation key (e.g. `"common.cancel"`) inside a nested
 * translation object. Returns `undefined` when the path doesn't exist.
 */
function resolveKey(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}

/** Replace `{placeholder}` tokens with values from `params`. */
function interpolate(
  template: string,
  params?: TranslateParams,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/**
 * Translate a key into `lang`, falling back to English when the key is
 * missing from the target language (useful while a translation is
 * incomplete).
 */
export function translate(
  lang: LanguageCode,
  key: TranslationKey,
  params?: TranslateParams,
): string {
  const value = resolveKey(translations[lang], key);
  if (typeof value === "string") return interpolate(value, params);

  const fallback = resolveKey(translations.en, key);
  if (typeof fallback === "string") return interpolate(fallback, params);

  return key;
}

/**
 * Create a translate function permanently bound to a language.
 * Used by the React context provider.
 */
export function createTranslator(lang: LanguageCode): TranslateFn {
  return (key, params) => translate(lang, key, params);
}

/* ------------------------------------------------------------------ *
 * Global language for non-React code (utility functions, popups, …)  *
 * The LanguageProvider sets this on mount / change so that code      *
 * outside the React tree can call `t()` directly.                     *
 * ------------------------------------------------------------------ */

let globalLang: LanguageCode = "en";

export function setGlobalLanguage(lang: LanguageCode): void {
  globalLang = lang;
}

export function getGlobalLanguage(): LanguageCode {
  return globalLang;
}

/**
 * Global translate function — uses the language set by
 * `setGlobalLanguage()`. Intended for utility modules that can't use
 * the `useLanguage()` hook (e.g. `oraxPlus.ts`, `popup.tsx`).
 */
export const t: TranslateFn = (key, params) =>
  translate(globalLang, key, params);

/**
 * Resolve a vote provider to its translated button label.
 * e.g. `"topgg"` → `"Vote on Top.gg"` / `"Voter sur Top.gg"` / etc.
 */
export function getVoteLabel(
  lang: LanguageCode,
  provider: VoteProviderType,
): string {
  return translate(lang, `vote.${provider}` as TranslationKey);
}

/** Global-language convenience wrapper around `getVoteLabel`. */
export function voteLabel(provider: VoteProviderType): string {
  return getVoteLabel(globalLang, provider);
}

export type { LanguageCode, TranslationKey, TranslateFn, TranslateParams };
