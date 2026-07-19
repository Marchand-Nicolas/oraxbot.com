import { useEffect, useState } from "react";
import styles from "../styles/components/GuildIcon.module.css";

function getInitials(name: string): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .map((word) => word[0]!.toUpperCase())
    .slice(0, 3)
    .join("");
}

interface GuildIconProps {
  /** URL of the guild icon. When null/undefined or when the image fails to load, the initials fallback is shown. */
  iconUrl: string | null | undefined;
  /** Guild name used to compute the initials and the alt/aria-label. */
  name: string;
  /** Class applied to both the <img> and the fallback <div> (typically controls size & border-radius). */
  className?: string;
  /** Optional override for the img alt text. Defaults to `name`. */
  alt?: string;
  /** Called when the image has loaded, or immediately after mount when the fallback is shown. */
  onLoad?: () => void;
}

export default function GuildIcon({
  iconUrl,
  name,
  className,
  alt,
  onLoad,
}: GuildIconProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = !iconUrl || failed;

  useEffect(() => {
    if (showFallback && onLoad) onLoad();
  }, [showFallback, onLoad]);

  if (!showFallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={alt ?? name}
        className={className}
        onLoad={onLoad}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={[styles.fallback, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
