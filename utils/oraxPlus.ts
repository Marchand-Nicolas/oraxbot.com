import config from "./config.json";
import { notify } from "../components/ui/NotificationSystem";
import type { OraxPlusStatus } from "../types";
import { platformApi } from "./platformApi";
import type { PlatformConfig } from "./platforms";

interface OraxPlusVoteResult {
  activated: boolean;
  voteOpened: boolean;
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
    "Vote on Top.gg",
    "Come back here after voting to join the group.",
  );
}

export async function getOraxPlusStatus(guildId: string) {
  try {
    const data = await platformApi<{
      result?: boolean;
      oraxPlus?: OraxPlusStatus;
    }>("get_server_data", { guildId });

    return data.result ? data.oraxPlus : undefined;
  } catch (error) {
    console.error("Unable to refresh Orax Plus status:", error);
    return undefined;
  }
}

export async function startOraxPlusVote(
  guildId: string,
  platform?: PlatformConfig,
): Promise<OraxPlusVoteResult> {
  const provider = platform?.vote?.provider;

  if (provider === "fluxerlist") {
    return startFluxerlistVote(guildId, platform!);
  }

  return startTopggVote(guildId, platform);
}

/**
 * Top.gg flow: the dashboard starts a vote intent on the backend, opens the
 * Top.gg vote page, then polls the server until the Top.gg webhook lands.
 */
async function startTopggVote(
  guildId: string,
  platform?: PlatformConfig,
): Promise<OraxPlusVoteResult> {
  const voteWindow = window.open("about:blank", "_blank");

  try {
    const data = await platformApi<{
      result?: boolean;
      activated?: boolean;
      vote_url?: string;
      message?: string;
    }>("start_orax_plus_vote", { guildId });

    if (!data?.result) {
      throw new Error(
        data?.message || "Unable to prepare the Top.gg vote for this server.",
      );
    }

    if (data.activated) {
      voteWindow?.close();
      notify.success(
        "Orax Plus activated",
        "Your latest Top.gg vote was applied to this server.",
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
      "Vote opened",
      "Orax Plus will activate automatically when Top.gg sends the vote.",
    );
    return { activated: false, voteOpened: true };
  } catch (error) {
    voteWindow?.close();
    notify.error(
      "Vote setup failed",
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
): Promise<OraxPlusVoteResult> {
  const voteUrl = platform.vote?.url || config.fluxerlistVoteUrl;
  const label = platform.vote?.label || "Vote on Fluxerlist";

  window.open(voteUrl, "_blank");
  showVoteRetrievalOverlay(label);

  try {
    await new Promise((resolve) =>
      setTimeout(resolve, FLUXERLIST_RETRIEVAL_DELAY_MS),
    );

    const data = await platformApi<{
      result?: boolean;
      expires_at?: string;
      message?: string;
    }>("activate_fluxerlist_vote", { guildId });

    if (!data?.result) {
      throw new Error(
        data?.message ||
          "Unable to activate Orax Plus from your Fluxerlist vote.",
      );
    }

    notify.success(
      "Orax Plus activated",
      "Your Fluxerlist vote was applied to this server.",
    );
    return { activated: true, voteOpened: false };
  } catch (error) {
    notify.error(
      "Vote activation failed",
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

export async function startOraxPlusCheckout(
  guildId: string,
  redirectBase = "/dashboard",
  plan: "monthly" | "lifetime" = "monthly",
) {
  showCheckoutOverlay();
  try {
    const data = await platformApi<{
      result?: boolean;
      url?: string;
      message?: string;
    }>("create_orax_plus_checkout_session", {
      guildId,
      plan,
      successUrl: `${window.location.origin}${redirectBase}?guild=${guildId}&orax_plus=success`,
      cancelUrl: `${window.location.origin}${redirectBase}?guild=${guildId}&orax_plus=cancelled`,
    });
    if (!data?.result || !data?.url) {
      throw new Error(data?.message || "Unable to start Stripe Checkout.");
    }
    window.location.href = data.url;
  } catch (error) {
    hideCheckoutOverlay();
    notify.error(
      "Checkout failed",
      error instanceof Error
        ? error.message
        : "Unable to start Orax Plus checkout.",
    );
  }
}
