import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "../../styles/components/dashboard/UserMenu.module.css";
import GuildIcon from "../GuildIcon";
import { platformList, type PlatformConfig } from "../../utils/platforms";
import { clearPlatformToken } from "../../utils/platforms/oauth";
import { removeStorage } from "../../utils/storage";
import type { DiscordUser } from "../../types";

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

  const displayName = user.global_name || user.username || "User";
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

          {otherPlatforms.length > 0 && (
            <>
              <div className={styles.divider} />
              <p className={styles.sectionLabel}>Switch platform</p>
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
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
