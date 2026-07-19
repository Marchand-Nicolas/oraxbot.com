import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/PlatformLogin.module.css";
import { platformList, getPlatform } from "../utils/platforms";
import type { PlatformConfig } from "../utils/platforms/types";
import {
  exchangeOauthCode,
  persistPlatformToken,
} from "../utils/platforms/oauth";
import { getCookie, setCookie } from "../utils/cookies";
import { notify } from "./ui/NotificationSystem";
import Loading from "./Loading";

const TITLE = "Orax Dashboard — Choose your platform";
const DESCRIPTION =
  "Sign in to the Orax dashboard with Discord or Fluxer to manage your interserver groups.";

/**
 * Platform chooser + OAuth callback handler shared by the `/dashboard`
 * and `/login` entry points.
 *
 * Responsibilities:
 *  - If the OAuth provider sent us back here with `?code=...&state=...`,
 *    exchange the code with the platform encoded in `state`, persist the
 *    token, and redirect to the right dashboard.
 *  - When `autoRedirect` is true (the `/dashboard` behaviour), bounce
 *    users that already have a valid session straight to their platform
 *    dashboard. When false (the `/login` behaviour), the chooser is
 *    always shown so they can switch accounts or platforms.
 *  - Otherwise render a button per registered platform that starts the
 *    OAuth flow with `state=/dashboard/<slug>` so the callback can route
 *    the user back correctly.
 *
 * Adding a new platform only requires registering it in
 * `utils/platforms/index.ts` — this component renders a button for every
 * entry.
 */
export default function LoginHub({
  autoRedirect = false,
}: {
  autoRedirect?: boolean;
}) {
  const [status, setStatus] = useState<
    "loading" | "ready" | "exchanging"
  >("loading");

  useEffect(() => {
    void handleEntry();
  }, []);

  async function handleEntry() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const stateParam = params.get("state");

    // OAuth callback: provider returned here with a code.
    if (code) {
      const targetPlatform = resolvePlatformFromState(stateParam);

      if (!targetPlatform) {
        notify.error(
          "Login Failed",
          "We could not determine which platform you tried to log in with.",
        );
        cleanOAuthQuery();
        setStatus("ready");
        return;
      }

      setStatus("exchanging");
      try {
        const response = await exchangeOauthCode(targetPlatform, code);
        if (!response.access_token || response.access_token === "undefined") {
          notify.error(
            "Login Failed",
            "Invalid authentication response. Please try again.",
          );
          cleanOAuthQuery();
          setStatus("ready");
          return;
        }

        const expiresIn =
          typeof response.expires_in === "number" ? response.expires_in : 0;
        persistPlatformToken(
          targetPlatform,
          response.access_token,
          Math.max(expiresIn - 1000, 60),
        );

        // If state points somewhere other than the platform root (e.g. a
        // deep link the user wanted to land on post-login), honour it as
        // long as it is a relative path.
        const deepLink =
          stateParam &&
          stateParam.startsWith("/") &&
          stateParam !== `/dashboard/${targetPlatform.slug}`
            ? stateParam
            : `/dashboard/${targetPlatform.slug}`;

        window.location.href = deepLink;
        return;
      } catch (error) {
        notify.error(
          "Login Failed",
          "Unable to complete authentication. Please try again.",
        );
        cleanOAuthQuery();
        setStatus("ready");
        return;
      }
    }

    // Already logged in to a platform? Bounce to its dashboard, but only
    // when the caller opted into the auto-redirect behaviour.
    if (autoRedirect) {
      const activePlatform = detectActivePlatform();
      if (activePlatform) {
        window.location.href = `/dashboard/${activePlatform.slug}`;
        return;
      }
    }

    setStatus("ready");
  }

  function handleLoginClick(platform: PlatformConfig) {
    // Already logged in to this platform? Skip the OAuth flow and drop
    // the user straight into their dashboard.
    const token = getCookie(platform.cookieName);
    if (token && token !== "undefined") {
      window.location.href = `/dashboard/${platform.slug}`;
      return;
    }

    // Mirror any other platform token out of the shared `token` cookie so
    // the new platform's session is the one that becomes active.
    const other = detectActivePlatform();
    if (other && other.slug !== platform.slug) {
      // keep the per-platform cookie; just clear the shared alias.
      setCookie("token", "", 0);
    }
    window.location.href = buildAuthorizeUrl(platform);
  }

  if (status === "loading" || status === "exchanging") {
    return (
      <div className={styles.container}>
        <div className={styles.spinnerContainer}>
          <div className="spinner" aria-hidden="true" />
          <span>
            {status === "exchanging"
              ? "Completing sign-in..."
              : "Loading..."}
          </span>
        </div>
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className={styles.container}>
        <div className={styles.card}>
          <img
            src="/logo.png"
            alt="Orax logo"
            className={styles.logo}
            width={56}
            height={56}
          />
          <h1 className={styles.title}>Welcome to Orax</h1>
          <p className={styles.subtitle}>
            Choose a platform to access your dashboard
          </p>
          <div className={styles.buttonList}>
            {platformList.map((platform) => (
              <button
                key={platform.slug}
                type="button"
                className={styles.button}
                style={{
                  background:
                    platform.brandGradient ?? platform.brandColor,
                }}
                onClick={() => handleLoginClick(platform)}
              >
                <PlatformIcon platform={platform} />
                <span>Login with {platform.label}</span>
              </button>
            ))}
          </div>
          <p className={styles.footer}>
            New here?{" "}
            <Link href="/">Learn more about Orax</Link>
          </p>
        </div>
      </div>
    </>
  );
}

function PlatformIcon({ platform }: { platform: PlatformConfig }) {
  return (
    <img
      src={platform.logoPath}
      alt=""
      className={styles.buttonIcon}
      width={22}
      height={22}
    />
  );
}

/**
 * Builds the OAuth authorize URL for a platform and embeds the post-login
 * destination in the `state` param so the callback page can route it.
 */
function buildAuthorizeUrl(platform: PlatformConfig): string {
  const target = `/dashboard/${platform.slug}`;
  const stateParam = encodeURIComponent(target);
  const sep = platform.authorizeUrl.includes("?") ? "&" : "?";
  return `${platform.authorizeUrl}${sep}state=${stateParam}`;
}

/** Try to extract a registered platform slug from the OAuth state param. */
function resolvePlatformFromState(
  state: string | null,
): PlatformConfig | undefined {
  if (!state) {
    // Legacy callback without state — assume Discord (the original flow).
    return getPlatform("discord");
  }
  const decoded = decodeURIComponent(state);
  const match = decoded.match(/^\/dashboard\/([^/?#]+)/);
  if (match) {
    return getPlatform(match[1]);
  }
  if (getPlatform(decoded)) {
    return getPlatform(decoded);
  }
  return undefined;
}

/**
 * Returns the first registered platform that has a non-empty session
 * cookie, so we can auto-redirect users that are already signed in.
 */
function detectActivePlatform(): PlatformConfig | undefined {
  return platformList.find((platform) => {
    const token = getCookie(platform.cookieName);
    return Boolean(token && token !== "undefined");
  });
}

function cleanOAuthQuery() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, document.title, url.toString());
}
