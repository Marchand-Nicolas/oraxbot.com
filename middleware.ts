import { NextRequest, NextResponse } from "next/server";

/**
 * Language codes supported by the public site.
 * English lives at the root, others under their own subdirectory.
 */
const SUPPORTED_LANGS = ["en", "fr", "es"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

const DEFAULT_LANG: Lang = "en";
const COOKIE_NAME = "orax_lang";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Public pages that exist in every supported language. Adding a path here
 * automatically gets language detection + a `/fr` and `/es` alias.
 */
const LOCALIZED_PATHS = ["/", "/pricing", "/login"] as const;

/**
 * Parse the Accept-Language header and return the best matching language
 * code from `SUPPORTED_LANGS`, or `null` if none match.
 *
 * Example: "fr-FR,fr;q=0.9,en-US;q=0.8" → "fr"
 */
function detectLanguage(header: string | null): Lang | null {
  if (!header) return null;
  const parsed = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.startsWith("q="));
      const q = qParam ? parseFloat(qParam.slice(2)) : 1;
      return { code: tag.split("-")[0].toLowerCase(), q: isNaN(q) ? 0 : q };
    })
    .filter((entry) => entry.code.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { code } of parsed) {
    if ((SUPPORTED_LANGS as readonly string[]).includes(code)) {
      return code as Lang;
    }
  }
  return null;
}

/**
 * Returns `true` if the request path already carries a language prefix
 * (e.g. `/fr/...` or `/es/...`).
 */
function hasLocalePrefix(pathname: string): boolean {
  return SUPPORTED_LANGS.some(
    (lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`),
  );
}

/**
 * Builds a localized URL for a given language code.
 * English stays at the root, others are placed under their subdirectory.
 */
function localizedUrl(lang: Lang, original: URL): URL {
  if (lang === DEFAULT_LANG) {
    return new URL(original.pathname, original);
  }
  return new URL(`/${lang}${original.pathname}`, original);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Path already carries a locale — never redirect, the user chose it.
  if (hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  // Only act on paths that have a localized version.
  if (!(LOCALIZED_PATHS as readonly string[]).includes(pathname)) {
    return NextResponse.next();
  }

  // Cookie preference takes precedence over the Accept-Language header.
  const cookieLang = request.cookies.get(COOKIE_NAME)?.value;
  const detected: Lang | null = (SUPPORTED_LANGS as readonly string[]).includes(
    cookieLang ?? "",
  )
    ? (cookieLang as Lang)
    : detectLanguage(request.headers.get("accept-language"));

  // No preference or already on the default locale — do nothing.
  if (!detected || detected === DEFAULT_LANG) {
    return NextResponse.next();
  }

  const target = localizedUrl(detected, request.nextUrl);
  target.search = search;

  const response = NextResponse.redirect(target, 302);
  response.cookies.set(COOKIE_NAME, detected, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

/**
 * Run the middleware only on localized public pages, excluding static
 * assets, API routes and Next.js internals.
 */
export const config = {
  matcher: ["/", "/pricing", "/login"],
};
