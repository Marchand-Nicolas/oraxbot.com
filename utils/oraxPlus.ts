import config from "./config.json";
import { getCookie } from "./cookies";
import { notify } from "../components/ui/NotificationSystem";
import type { OraxPlusStatus } from "../types";

interface OraxPlusVoteResult {
  activated: boolean;
  voteOpened: boolean;
}

export function openTopggVote() {
  window.open(config.topggVoteUrl, "_blank");
  notify.info(
    "Vote on Top.gg",
    "Come back here after voting to join the group.",
  );
}

export async function getOraxPlusStatus(guildId: string) {
  try {
    const data = await fetch(`${config.apiV2}get_server_data`, {
      method: "POST",
      body: JSON.stringify({
        guildId,
        token: getCookie("token"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    return data.result ? (data.oraxPlus as OraxPlusStatus | undefined) : undefined;
  } catch (error) {
    console.error("Unable to refresh Orax Plus status:", error);
    return undefined;
  }
}

export async function startOraxPlusVote(
  guildId: string,
): Promise<OraxPlusVoteResult> {
  const voteWindow = window.open("about:blank", "_blank");

  try {
    const response = await fetch(`${config.apiV2}start_orax_plus_vote`, {
      method: "POST",
      body: JSON.stringify({
        guildId,
        token: getCookie("token"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok || !data?.result) {
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

export async function startOraxPlusCheckout(
  guildId: string,
  redirectBase = "/dashboard",
) {
  try {
    const response = await fetch(
      `${config.apiV2}create_orax_plus_checkout_session`,
      {
        method: "POST",
        body: JSON.stringify({
          guildId,
          token: getCookie("token"),
          successUrl: `${window.location.origin}${redirectBase}?guild=${guildId}&orax_plus=success`,
          cancelUrl: `${window.location.origin}${redirectBase}?guild=${guildId}&orax_plus=cancelled`,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    if (!response.ok || !data?.result || !data?.url) {
      throw new Error(data?.message || "Unable to start Stripe Checkout.");
    }
    window.location.href = data.url;
  } catch (error) {
    notify.error(
      "Checkout failed",
      error instanceof Error
        ? error.message
        : "Unable to start Orax Plus checkout.",
    );
  }
}
