import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  createTranslator,
  setGlobalLanguage,
  type LanguageCode,
  type TranslateFn,
} from "../utils/i18n";

interface LanguageContextValue {
  lang: LanguageCode;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  t: createTranslator("en"),
});

interface LanguageProviderProps {
  lang: LanguageCode;
  children: ReactNode;
}

/**
 * Provides the active language and a bound `t()` function to every
 * descendant component via `useLanguage()`.
 *
 * Also mirrors the language into the global translator so that
 * non-React code (utility modules, popups, notification helpers) can
 * call the bare `t()` import and get the right language automatically.
 */
export function LanguageProvider({ lang, children }: LanguageProviderProps) {
  const value = useMemo<LanguageContextValue>(() => {
    setGlobalLanguage(lang);
    return { lang, t: createTranslator(lang) };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Consume the active language and translator from context.
 *
 * ```tsx
 * const { t, lang } = useLanguage();
 * t("nav.createGroup");  // → "Create an interserver group"
 * ```
 */
export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
