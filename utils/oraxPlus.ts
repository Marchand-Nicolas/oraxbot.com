import config from "./config.json";
import { getCookie } from "./cookies";
import { notify } from "../components/ui/NotificationSystem";

export function openTopggVote() {
  window.open(config.topggVoteUrl, "_blank");
  notify.info(
    "Vote on Top.gg",
    "Come back here after voting to join the group.",
  );
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
