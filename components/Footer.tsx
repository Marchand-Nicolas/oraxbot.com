import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/components/Footer.module.css";
import config from "../utils/config.json";
import { setCookie } from "../utils/cookies";
import {
  SUPPORTED_LANGS,
  createTranslator,
  localizedPath,
  type LanguageCode,
} from "../utils/i18n";

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

const LANGUAGE_COOKIE = "orax_lang";
const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const LOCALIZED_PATHS = new Set([
  "/",
  "/pricing",
  "/login",
  "/explore",
  "/blog/discord-auto-translation-free",
]);

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

function getBasePath(pathname: string): string {
  for (const code of SUPPORTED_LANGS) {
    if (pathname === `/${code}`) return "/";
    if (pathname.startsWith(`/${code}/`)) return pathname.slice(code.length + 1);
  }
  return pathname;
}

function FooterAnchor({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        className={styles.link}
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={styles.link}>
      {link.label}
    </Link>
  );
}

function LanguageSwitcher({
  lang,
  basePath,
  label,
}: {
  lang: LanguageCode;
  basePath: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [open]);

  return (
    <div className={styles.language} ref={wrapperRef}>
      <button
        type="button"
        className={styles.languageButton}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label}: ${LANGUAGE_NAMES[lang]}`}
      >
        <svg
          className={styles.languageIcon}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9 9 0 1 0 0-18m0 18a9 9 0 1 1 0-18m0 18c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-8.716 6h17.432M3.284 15h17.432"
          />
        </svg>
        <span>{LANGUAGE_NAMES[lang]}</span>
        <svg
          className={[
            styles.languageChevron,
            open ? styles.languageChevronOpen : null,
          ]
            .filter(Boolean)
            .join(" ")}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {open && (
        <ul className={styles.languageMenu} role="menu">
          {SUPPORTED_LANGS.map((code) => (
            <li key={code} role="none">
              <Link
                href={localizedPath(code, basePath)}
                hrefLang={code}
                lang={code}
                role="menuitem"
                aria-current={code === lang ? "true" : undefined}
                className={[
                  styles.languageOption,
                  code === lang ? styles.languageOptionActive : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  setCookie(LANGUAGE_COOKIE, code, LANGUAGE_COOKIE_MAX_AGE);
                  setOpen(false);
                }}
              >
                <span>{LANGUAGE_NAMES[code]}</span>
                {code === lang && (
                  <svg
                    className={styles.languageCheck}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Footer({
  theme = "light",
  lang = "en",
  showCopyright = false,
}: {
  theme?: string;
  lang?: LanguageCode;
  showCopyright?: boolean;
}) {
  const t = createTranslator(lang);
  const router = useRouter();
  const basePath = getBasePath(router.pathname);
  const canSwitchLanguage = LOCALIZED_PATHS.has(basePath);

  const columns: FooterColumn[] = [
    {
      title: t("siteFooter.product"),
      links: [
        { label: t("siteFooter.pricing"), href: localizedPath(lang, "/pricing") },
        { label: t("siteFooter.dashboard"), href: "/dashboard" },
        {
          label: t("siteFooter.addToDiscord"),
          href: config.inviteLink,
          external: true,
        },
        {
          label: t("siteFooter.addToFluxer"),
          href: config.fluxerInviteLink,
          external: true,
        },
      ],
    },
    {
      title: t("siteFooter.resources"),
      links: [
        {
          label: t("siteFooter.docs"),
          href: "https://docs.oraxbot.com",
          external: true,
        },
        { label: t("siteFooter.explore"), href: localizedPath(lang, "/explore") },
        {
          label: t("siteFooter.autoTranslateGuide"),
          href: localizedPath(lang, "/blog/discord-auto-translation-free"),
        },
      ],
    },
    {
      title: t("siteFooter.community"),
      links: [
        {
          label: t("siteFooter.supportServer"),
          href: "https://discord.gg/e3pBtbum4A",
          external: true,
        },
        {
          label: t("siteFooter.github"),
          href: "https://github.com/Marchand-Nicolas/oraxbot.com",
          external: true,
        },
        {
          label: t("siteFooter.tip"),
          href: "https://ko-fi.com/nicolasmarchand",
          external: true,
        },
      ],
    },
  ];

  return (
    <footer
      className={`${styles.footer} ${theme === "dark" ? styles.footerDark : styles.footerLight}`}
    >
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href={localizedPath(lang, "/")} className={styles.brandLink}>
              <Image
                src="/logoshadow.png"
                alt={t("home.ogImageAlt")}
                width={36}
                height={36}
                className={styles.brandLogo}
              />
              <span>{t("home.brand")}</span>
            </Link>
            <p className={styles.tagline}>{t("siteFooter.tagline")}</p>
            {canSwitchLanguage && (
              <LanguageSwitcher
                lang={lang}
                basePath={basePath}
                label={t("siteFooter.language")}
              />
            )}
          </div>

          {columns.map((column) => (
            <nav
              key={column.title}
              className={styles.column}
              aria-label={column.title}
            >
              <h2 className={styles.columnTitle}>{column.title}</h2>
              <ul className={styles.list}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.bottom}>
          {showCopyright && (
            <span className={styles.copyright}>© 2021–2026 Orax</span>
          )}
          <div className={styles.legal}>
            <Link href="/tos" className={styles.link}>
              {t("siteFooter.tos")}
            </Link>
            <Link href="/privacy" className={styles.link}>
              {t("siteFooter.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
