import config from "./config.json";
import type { LanguageCode } from "./i18n";

const EUROPEAN_COUNTRY_CODES = new Set([
  "AD",
  "AL",
  "AM",
  "AT",
  "AX",
  "AZ",
  "BA",
  "BE",
  "BG",
  "BY",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FO",
  "FR",
  "GB",
  "GE",
  "GG",
  "GI",
  "GR",
  "HR",
  "HU",
  "IE",
  "IM",
  "IS",
  "IT",
  "JE",
  "KZ",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MD",
  "ME",
  "MK",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "RS",
  "RU",
  "SE",
  "SI",
  "SK",
  "SM",
  "TR",
  "UA",
  "VA",
  "XK",
]);

const LOCALES: Record<LanguageCode, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

export type PricingRegion = "default" | "europe";

export interface OraxPlusPricing {
  monthly: string;
  lifetime: string;
}

export function getPricingRegion(
  country: string | string[] | undefined,
): PricingRegion {
  const countryCode = Array.isArray(country) ? country[0] : country;
  return countryCode && EUROPEAN_COUNTRY_CODES.has(countryCode.toUpperCase())
    ? "europe"
    : "default";
}

export function getOraxPlusPricing(
  region: PricingRegion,
  lang: LanguageCode,
): OraxPlusPricing {
  const isEurope = region === "europe";
  const currency = isEurope ? "EUR" : "USD";
  const formatter = new Intl.NumberFormat(LOCALES[lang], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  });

  return {
    monthly: formatter.format(
      isEurope
        ? config.oraxPlusEuropeMonthlyPrice
        : config.oraxPlusMonthlyPrice,
    ),
    lifetime: formatter.format(
      isEurope
        ? config.oraxPlusEuropeLifetimePrice
        : config.oraxPlusLifetimePrice,
    ),
  };
}
