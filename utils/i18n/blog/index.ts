import type {
  BlogArticle,
  BlogTranslateFn,
  BlogTranslateParams,
  BlogTranslationKey,
} from "./types";
import type { LanguageCode } from "../types";
import en from "./en";
import es from "./es";
import fr from "./fr";

/**
 * Registry of all blog language packs. New languages are added by
 * importing a translation file and registering it here.
 */
const blogTranslations: Record<LanguageCode, BlogArticle> = {
  en,
  es,
  fr,
};

/**
 * Resolve a dot-notation key (e.g. `"section1Title"`) inside a nested
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
  params?: BlogTranslateParams,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/**
 * Translate a blog key into `lang`, falling back to English when the key
 * is missing from the target language.
 */
export function translateBlog(
  lang: LanguageCode,
  key: BlogTranslationKey,
  params?: BlogTranslateParams,
): string {
  const value = resolveKey(blogTranslations[lang], key);
  if (typeof value === "string") return interpolate(value, params);

  const fallback = resolveKey(blogTranslations.en, key);
  if (typeof fallback === "string") return interpolate(fallback, params);

  return key;
}

/**
 * Create a translate function permanently bound to a language.
 * Use this from blog components instead of the main `createTranslator`
 * to keep blog content in its own translation files.
 */
export function createBlogTranslator(lang: LanguageCode): BlogTranslateFn {
  return (key, params) => translateBlog(lang, key, params);
}
