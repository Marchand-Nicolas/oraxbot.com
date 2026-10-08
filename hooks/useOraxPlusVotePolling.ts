import { useCallback, useEffect, useRef, useState } from "react";
import { notify } from "../components/ui/NotificationSystem";
import type { OraxPlusStatus } from "../types";
import { t } from "../utils/i18n";

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 24;

interface VotePollingOptions {
  guildId?: string;
  /** The server's current Orax Plus status, kept fresh by `refresh`. */
  oraxPlus?: OraxPlusStatus;
  /** Reloads `oraxPlus` from the API. */
  refresh: () => void;
}

/**
 * After the Top.gg vote page is opened, the vote reaches the bot through a
 * webhook. This refreshes the server's Orax Plus status every 5 s for up to
 * 2 minutes and tells the user when the vote's entitlement shows up (or
 * extends the one they already had).
 */
export function useOraxPlusVotePolling({
  guildId,
  oraxPlus,
  refresh,
}: VotePollingOptions) {
  const [isPolling, setIsPolling] = useState(false);
  const [baselineExpiresAt, setBaselineExpiresAt] = useState<string | null>(
    null,
  );
  const attemptsRef = useRef(0);
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (!isPolling || !guildId) return;

    attemptsRef.current = 0;
    refreshRef.current();

    const intervalId = window.setInterval(() => {
      attemptsRef.current += 1;
      refreshRef.current();

      if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
        window.clearInterval(intervalId);
        setIsPolling(false);
        setBaselineExpiresAt(null);
        notify.error(
          t("oraxPlus.voteNotDetectedTitle"),
          t("oraxPlus.voteNotDetectedDesc"),
          { duration: 8000 },
        );
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [guildId, isPolling]);

  const source = oraxPlus?.entitlement?.source;
  const expiresAt = oraxPlus?.entitlement?.expiresAt || null;
  useEffect(() => {
    if (!isPolling || !oraxPlus?.active || source !== "topgg_vote") return;

    // A server that already had a vote plan only changes when it is extended.
    if (baselineExpiresAt) {
      const extended =
        expiresAt !== null &&
        new Date(expiresAt).getTime() > new Date(baselineExpiresAt).getTime();
      if (!extended) return;
    }

    setIsPolling(false);
    setBaselineExpiresAt(null);
    notify.success(
      t("oraxPlus.activatedTitle"),
      baselineExpiresAt
        ? t("oraxPlus.activatedExtendedDesc")
        : t("oraxPlus.activatedNewDesc"),
    );
  }, [isPolling, oraxPlus?.active, source, expiresAt, baselineExpiresAt]);

  /**
   * @param currentExpiresAt - Expiry of the vote plan the server already has,
   *   so a renewal is detected as an extension rather than ignored.
   */
  const startPolling = useCallback((currentExpiresAt?: string | null) => {
    setBaselineExpiresAt(currentExpiresAt ?? null);
    setIsPolling(true);
  }, []);

  return { isPolling, startPolling };
}
