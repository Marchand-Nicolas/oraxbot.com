import config from "./config.json";
import { notify } from "../components/ui/NotificationSystem";
import type { OraxPlusStatus } from "../types";
import { platformApi } from "./platformApi";
import type { PlatformConfig } from "./platforms";
import { t, voteLabel } from "./i18n";

interface OraxPlusVoteResult {
  activated: boolean;
  voteOpened: boolean;
}

/**
 * Paywall a vote or checkout was started from. The bot records it in its
 * Orax Plus funnel so conversion can be compared per paywall.
 */
export type OraxPlusOrigin =
  | "channel_limit"
  | "group_limit"
  | "translation"
  | "dashboard";

interface OraxPlusTrackingTarget {
  origin: OraxPlusOrigin;
  /** Server the user acts from (must be one of theirs). */
  guildId: string;
  groupId?: string | number;
  /** On /join: attributes the event to the group's owner server. */
  linkId?: string;
}

/**
 * Record an Orax Plus funnel step that only the browser sees: a paywall
 * shown, or a vote opened without going through the API. Fire-and-forget:
 * tracking never blocks or breaks the paywall.
 */
export function trackOraxPlusEvent(
  event: "paywall_shown" | "vote_started",
  { origin, guildId, groupId, linkId }: OraxPlusTrackingTarget,
  platform?: PlatformConfig,
) {
  if (!guildId) return;
  platformApi(
    "track_orax_plus_event",
    { event, origin, guildId, groupId, linkId },
    { platform },
  ).catch(() => {});
}

/**
 * Fluxerlist does not send a vote webhook, so after opening the vote page
 * we wait this long before asking the backend to grant Orax Plus. The delay
 * gives the user time to actually cast their vote on fluxerlist.com.
 */
const FLUXERLIST_RETRIEVAL_DELAY_MS = 18000;

export function openTopggVote() {
  window.open(config.topggVoteUrl, "_blank");
  notify.info(
    t("oraxPlus.voteOpenedTitle"),
    t("oraxPlus.voteOpenedDesc"),
  );
}

export async function getOraxPlusStatus(
  guildId: string,
  platform?: PlatformConfig,
) {
  try {
    const data = await platformApi<{
      result?: boolean;
      oraxPlus?: OraxPlusStatus;
    }>("get_server_data", { guildId }, { platform });

    return data.result ? data.oraxPlus : undefined;
  } catch (error) {
    console.error("Unable to refresh Orax Plus status:", error);
    return undefined;
  }
}

export async function startOraxPlusVote(
  guildId: string,
  platform?: PlatformConfig,
  origin: OraxPlusOrigin = "dashboard",
  hasVotedFluxerlist?: boolean,
): Promise<OraxPlusVoteResult> {
  const provider = platform?.vote?.provider;

  if (provider === "fluxerlist") {
    return startFluxerlistVote(guildId, platform!, origin, hasVotedFluxerlist);
  }

  return startTopggVote(guildId, platform, origin);
}

/**
 * Top.gg flow: the dashboard starts a vote intent on the backend, opens the
 * Top.gg vote page, then polls the server until the Top.gg webhook lands.
 */
async function startTopggVote(
  guildId: string,
  platform: PlatformConfig | undefined,
  origin: OraxPlusOrigin,
): Promise<OraxPlusVoteResult> {
  const voteWindow = window.open("about:blank", "_blank");

  try {
    const data = await platformApi<{
      result?: boolean;
      activated?: boolean;
      vote_url?: string;
      message?: string;
    }>("start_orax_plus_vote", { guildId, origin }, { platform });

    if (!data?.result) {
      throw new Error(
        data?.message || "Unable to prepare the Top.gg vote for this server.",
      );
    }

    if (data.activated) {
      voteWindow?.close();
      notify.success(
        t("oraxPlus.activatedTitle"),
        t("oraxPlus.activatedTopggDesc"),
      );
      return { activated: true, voteOpened: false };
    }

    const voteUrl =
      typeof data.vote_url === "string" ? data.vote_url : config.topggVoteUrl;
    if (voteWindow) {
      voteWindow.location.href = voteUrl;
    } else {
      window.location.href = voteUrl;
    }
    notify.success(
      t("oraxPlus.activatedTitle"),
      t("oraxPlus.activatedTopggDesc"),
    );
    return { activated: false, voteOpened: true };
  } catch (error) {
voteWindow?.close();
      notify.error(
        t("oraxPlus.voteSetupFailedTitle"),
        error instanceof Error
          ? error.message
          : "Unable to prepare the Top.gg vote.",
      );
    return { activated: false, voteOpened: false };
  }
}

let voteRetrievalOverlay: HTMLDivElement | null = null;

function showVoteRetrievalOverlay(label: string) {
  if (voteRetrievalOverlay) return;
  const overlay = document.createElement("div");
  overlay.className = "popup";
  overlay.innerHTML =
    '<div class="container" style="text-align:center">' +
    '<div class="spinner" style="margin:0 auto 16px"></div>' +
    `<p style="color:#fff;margin:0">Retrieving your ${label} vote…</p>` +
    "</div>";
  document.body.appendChild(overlay);
  voteRetrievalOverlay = overlay;
}

function hideVoteRetrievalOverlay() {
  voteRetrievalOverlay?.remove();
  voteRetrievalOverlay = null;
}

/**
 * Fluxerlist flow: there is no webhook, so we open the vote page, show a
 * "Retrieving vote…" overlay for ~20s, then ask the backend to grant
 * Orax Plus on a trust basis.
 */
async function startFluxerlistVote(
  guildId: string,
  platform: PlatformConfig,
  origin: OraxPlusOrigin,
  hasVotedFluxerlist?: boolean,
): Promise<OraxPlusVoteResult> {
  const label = voteLabel(platform.vote?.provider || "fluxerlist");
  let votedBefore = hasVotedFluxerlist;

  if (votedBefore === undefined) {
    const voteWindow = window.open("about:blank", "_blank");
    try {
      const status = await getOraxPlusStatus(guildId, platform);
      votedBefore = status?.hasVotedFluxerlist;
    } catch {
      votedBefore = false;
    }
    const voteUrl = votedBefore
      ? config.fblVoteUrl
      : platform.vote?.url || config.fluxerlistVoteUrl;
    if (voteWindow) {
      voteWindow.location.href = voteUrl;
    } else {
      window.open(voteUrl, "_blank");
    }
  } else {
    const voteUrl = votedBefore
      ? config.fblVoteUrl
      : platform.vote?.url || config.fluxerlistVoteUrl;
    window.open(voteUrl, "_blank");
  }

  showVoteRetrievalOverlay(label);

  try {
    await new Promise((resolve) =>
      setTimeout(resolve, FLUXERLIST_RETRIEVAL_DELAY_MS),
    );

    const data = await platformApi<{
      result?: boolean;
      expires_at?: string;
      message?: string;
    }>("activate_fluxerlist_vote", { guildId, origin }, { platform });

    if (!data?.result) {
      throw new Error(
        data?.message ||
          "Unable to activate Orax Plus from your Fluxerlist vote.",
      );
    }

    notify.success(
      t("oraxPlus.activatedTitle"),
      t("oraxPlus.activatedFluxerDesc"),
    );
    return { activated: true, voteOpened: false };
  } catch (error) {
    notify.error(
      t("oraxPlus.voteActivationFailedTitle"),
      error instanceof Error
        ? error.message
        : "Unable to activate Orax Plus from your Fluxerlist vote.",
    );
    return { activated: false, voteOpened: false };
  } finally {
    hideVoteRetrievalOverlay();
  }
}

let checkoutOverlay: HTMLDivElement | null = null;

function showCheckoutOverlay() {
  if (checkoutOverlay) return;
  const overlay = document.createElement("div");
  overlay.className = "popup";
  overlay.innerHTML =
    '<div class="container" style="text-align:center">' +
    '<div class="spinner" style="margin:0 auto 16px"></div>' +
    '<p style="color:#fff;margin:0">Redirecting to checkout…</p>' +
    "</div>";
  document.body.appendChild(overlay);
  checkoutOverlay = overlay;
}

function hideCheckoutOverlay() {
  checkoutOverlay?.remove();
  checkoutOverlay = null;
}

interface OraxPlusCheckoutOptions {
  origin?: OraxPlusOrigin;
  /**
   * Group invite link: lets a user who does not administer `guildId` pay
   * Orax Plus for it, as long as it owns that group (sponsoring on /join).
   */
  sponsorLinkId?: string;
  /** `guild` query param after checkout, when it differs from `guildId`. */
  returnGuildId?: string;
}

export async function startOraxPlusCheckout(
  guildId: string,
  redirectBase = "/dashboard",
  plan: "monthly" | "lifetime" = "monthly",
  platform?: PlatformConfig,
  { origin = "dashboard", sponsorLinkId, returnGuildId }: OraxPlusCheckoutOptions = {},
) {
  showCheckoutOverlay();
  const returnGuild = returnGuildId ?? guildId;
  try {
    const data = await platformApi<{
      result?: boolean;
      url?: string;
      message?: string;
    }>(
      "create_orax_plus_checkout_session",
      {
        guildId,
        plan,
        origin,
        sponsorLinkId,
        successUrl: `${window.location.origin}${redirectBase}?guild=${returnGuild}&orax_plus=success`,
        cancelUrl: `${window.location.origin}${redirectBase}?guild=${returnGuild}&orax_plus=cancelled`,
      },
      { platform },
    );
    if (!data?.result || !data?.url) {
      throw new Error(data?.message || "Unable to start Stripe Checkout.");
    }
    window.location.href = data.url;
  } catch (error) {
hideCheckoutOverlay();
      notify.error(
        t("oraxPlus.checkoutFailedTitle"),
        error instanceof Error
          ? error.message
          : "Unable to start Orax Plus checkout.",
      );
  }
}

/**
 * Move an active Orax Plus entitlement from the server it was purchased on
 * to a different server the user admins. The backend only accepts the
 * request when the purchase is less than 24 hours old and the caller has
 * admin permissions on the destination server.
 */
export async function changeOraxPlusServer(guildId: string) {
  return platformApi<{ result?: boolean; message?: string }>(
    "change_orax_plus_server",
    { guildId },
  );
}
