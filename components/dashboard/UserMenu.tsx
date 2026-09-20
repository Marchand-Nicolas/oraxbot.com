import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "../../styles/components/dashboard/UserMenu.module.css";
import GuildIcon from "../GuildIcon";
import { platformList, type PlatformConfig } from "../../utils/platforms";
import { clearPlatformToken } from "../../utils/platforms/oauth";
import { removeStorage } from "../../utils/storage";
import type { DiscordUser } from "../../types";
import { t } from "../../utils/i18n";

interface UserMenuProps {
  user: DiscordUser;
  platform: PlatformConfig;
}

export default function UserMenu({ user, platform }: UserMenuProps) {
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

  const displayName = user.global_name || user.username || t("nav.user");
  const avatarUrl = platform.getUserIconUrl({
    id: user.id,
    avatar: user.avatar,
  });
  const otherPlatforms = platformList.filter((p) => p.slug !== platform.slug);

  function handleLogout() {
    setOpen(false);
    clearPlatformToken(platform);
    removeStorage(platform.cachedUserStorageKey);
    removeStorage(platform.cachedGuildsStorageKey);
    window.location.href = "/dashboard";
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={[
          styles.trigger,
          open ? styles.triggerOpen : null,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={displayName}
      >
        <GuildIcon
          className={styles.avatar}
          iconUrl={avatarUrl}
          name={displayName}
          alt={`${displayName}'s avatar`}
        />
        <span className={styles.username}>{displayName}</span>
        <svg
          className={[
            styles.chevron,
            open ? styles.chevronOpen : null,
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
        <div className={styles.dropdown} role="menu">
          <div className={styles.header}>
            <GuildIcon
              className={styles.headerAvatar}
              iconUrl={avatarUrl}
              name={displayName}
            />
            <div className={styles.headerInfo}>
              <strong className={styles.headerName}>{displayName}</strong>
              {user.username && (
                <span className={styles.headerHandle}>@{user.username}</span>
              )}
              <span
                className={styles.platformBadge}
                style={{ backgroundColor: platform.brandColor }}
              >
                <img
                  src={platform.logoPath}
                  alt=""
                  className={styles.platformLogo}
                />
                {platform.label}
              </span>
            </div>
          </div>

          <div className={styles.divider} />
          <Link
            href={`/dashboard/${platform.slug}/settings`}
            className={styles.menuItem}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span
              className={styles.menuIcon}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.12)" }}
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.397-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </span>
            <span>{t("nav.settings")}</span>
          </Link>

          {otherPlatforms.length > 0 && (
            <>
              <div className={styles.divider} />
              <p className={styles.sectionLabel}>{t("nav.switchPlatform")}</p>
              {otherPlatforms.map((other) => (
                <Link
                  key={other.slug}
                  href={`/dashboard/${other.slug}`}
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <span
                    className={styles.menuIcon}
                    style={{ backgroundColor: other.brandColor }}
                  >
                    <img
                      src={other.logoPath}
                      alt=""
                      className={styles.platformLogo}
                    />
                  </span>
                  <span>{other.label}</span>
                </Link>
              ))}
            </>
          )}

          <div className={styles.divider} />
          <button
            type="button"
            className={[styles.menuItem, styles.dangerItem].join(" ")}
            role="menuitem"
            onClick={handleLogout}
          >
            <span className={[styles.menuIcon, styles.dangerIcon].join(" ")}>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
            </span>
            <span>{t("nav.logout")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
