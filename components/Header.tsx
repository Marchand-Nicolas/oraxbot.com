import Image from "next/image";
import Link from "next/link";
import styles from "../styles/components/Header.module.css";
import { useCallback, useEffect, useState } from "react";
import {
  createTranslator,
  setGlobalLanguage,
  type LanguageCode,
} from "../utils/i18n";
import UserMenu from "./dashboard/UserMenu";
import type { DiscordUser } from "../types";
import type { PlatformConfig } from "../utils/platforms";
import {
  AUTH_CHANGE_EVENT,
  clearPlatformToken,
  detectActivePlatform,
  fetchPlatformUser,
  getPlatformToken,
  setActivePlatformSession,
} from "../utils/platforms/oauth";
import { getStorage, removeStorage, setStorage } from "../utils/storage";
import { setCookie } from "../utils/cookies";

function buildReturnTarget(): string {
  if (typeof window === "undefined") return "/dashboard";
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("action");
  const path = `${url.pathname}${url.search}${url.hash}`;
  return path.startsWith("/") ? path : "/dashboard";
}

function buildPlatformAuthorizeUrl(
  platform: PlatformConfig,
  returnTarget: string,
): string {
  let stateTarget = returnTarget;
  try {
    const url = new URL(returnTarget, "https://oraxbot.com");
    url.searchParams.set("platform", platform.slug);
    stateTarget = `${url.pathname}${url.search}${url.hash}`;
  } catch {
    stateTarget = `/dashboard/${platform.slug}`;
  }
  const sep = platform.authorizeUrl.includes("?") ? "&" : "?";
  return `${platform.authorizeUrl}${sep}state=${encodeURIComponent(stateTarget)}`;
}

export default function NavBar({
  theme = "light",
  lang = "en",
}: {
  theme?: string;
  lang?: LanguageCode;
}) {
  const t = createTranslator(lang);
  setGlobalLanguage(lang);

  const [activePlatform, setActivePlatform] = useState<
    PlatformConfig | undefined
  >(undefined);
  const [activeUser, setActiveUser] = useState<DiscordUser | undefined>(
    undefined,
  );
  const [loginHref, setLoginHref] = useState("/login");

  const syncAuthSession = useCallback(async () => {
    if (typeof window === "undefined") return;

    const currentPath = buildReturnTarget();
    if (currentPath && currentPath !== "/" && !currentPath.startsWith("/login")) {
      setLoginHref(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      setLoginHref("/login");
    }

    const platform = detectActivePlatform();
    if (!platform) {
      setActivePlatform(undefined);
      setActiveUser(undefined);
      return;
    }

    const token = getPlatformToken(platform);
    if (!token) {
      setActivePlatform(undefined);
      setActiveUser(undefined);
      return;
    }

    setActivePlatform(platform);

    const cachedRaw = getStorage(platform.cachedUserStorageKey);
    if (cachedRaw) {
      try {
        const parsed = JSON.parse(cachedRaw) as DiscordUser;
        if (parsed?.id) {
          setActiveUser(parsed);
        }
      } catch {
        removeStorage(platform.cachedUserStorageKey);
      }
    }

    try {
      const user = await fetchPlatformUser(platform, token);
      if ((user as { retry_after?: number })?.retry_after) {
        return;
      }
      if (
        !user ||
        !user.id ||
        (user as { message?: string }).message === "401: Unauthorized"
      ) {
        clearPlatformToken(platform);
        removeStorage(platform.cachedUserStorageKey);
        removeStorage(platform.cachedGuildsStorageKey);
        return;
      }
      setStorage(platform.cachedUserStorageKey, JSON.stringify(user));
      setActivePlatform(platform);
      setActiveUser(user);
    } catch {
      // Keep cached user if network fails temporarily
    }
  }, []);

  useEffect(() => {
    void syncAuthSession();

    const handleAuthChange = () => {
      void syncAuthSession();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, [syncAuthSession]);

  useEffect(() => {
    const nav = document.querySelector("nav");

    const handleScroll = () => {
      if (!nav) return;
      if (theme === "dark") {
        if (window.scrollY > 100)
          nav.style.background = "rgba(7, 11, 20, 0.85)";
        else nav.style.background = "rgba(7, 11, 20, 0.95)";
      } else {
        if (window.scrollY > 100)
          nav.style.background = "rgba(255, 255, 255, 0.2)";
        else nav.style.background = "white";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [theme]);

  const handleSwitchPlatform = useCallback((other: PlatformConfig) => {
    const otherToken = getPlatformToken(other);
    if (otherToken) {
      setActivePlatformSession(other, otherToken);
      return;
    }
    setCookie("token", "", 0);
    window.location.href = buildPlatformAuthorizeUrl(other, buildReturnTarget());
  }, []);

  const handleLogout = useCallback(() => {
    void syncAuthSession();
  }, [syncAuthSession]);

  return (
    <nav
      className={`${styles.nav} ${theme === "dark" ? styles.navDark : styles.navLight}`}
    >
      <Link href="/" className="line">
        <Image src="/logo.png" alt={t("home.ogImageAlt")} width={50} height={50} />
        <strong className={styles.title}>{t("siteHeader.brand")}</strong>
      </Link>
      <Link href="/pricing" className={styles.navLink}>
        {t("siteHeader.pricing")}{" "}
        <span className={styles.freeTag}>{t("siteHeader.free")}</span>
      </Link>
      <a href="https://ko-fi.com/A0A51KMQ7J" target="_blank" className={styles.kofi}>
        <img
          height={36}
          src="https://storage.ko-fi.com/cdn/kofi5.png?v=6"
          alt={t("siteHeader.kofiAlt")}
        />
      </a>
      {activeUser && activePlatform ? (
        <UserMenu
          user={activeUser}
          platform={activePlatform}
          embedded
          onSwitchPlatform={handleSwitchPlatform}
          onLogout={handleLogout}
        />
      ) : (
        <Link href={loginHref} className={styles.discordLogin}>
          {t("siteHeader.login")}
        </Link>
      )}
    </nav>
  );
}
