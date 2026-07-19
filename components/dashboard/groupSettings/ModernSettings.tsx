import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../../styles/dashboard/OwnedGroup.module.css";
import type { OraxPlusStatus } from "../../../types";
import ActionModal from "../../ui/ActionModal";
import CustomUsernames from "./settings/customUsernames";
import LogMessages from "./settings/logMessages";
import OptionsField from "./settings/optionField";
import TextField from "./settings/textField";
import CheckboxField from "./settings/checkboxField";
import TextareaField from "./settings/textareaField";
import { getPlatform } from "../../../utils/platforms";

interface ModernSettingsProps {
  oraxPlus?: OraxPlusStatus;
  onRefreshOraxPlus?: () => Promise<OraxPlusStatus | undefined>;
  onStartOraxPlusVote?: () => void;
  onStartOraxPlusCheckout?: (plan?: "monthly" | "lifetime") => void;
}

const ModernSettings = ({
  oraxPlus,
  onRefreshOraxPlus,
  onStartOraxPlusVote,
  onStartOraxPlusCheckout,
}: ModernSettingsProps) => {
  const router = useRouter();
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild") || "";
  const { groupId, platform: platformSlug } = router.query;
  const platform =
    typeof platformSlug === "string" ? getPlatform(platformSlug) : undefined;
  const voteProvider = platform?.vote;
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const hasOraxPlus = !!oraxPlus?.active;
  const shouldBlockTranslation = !!oraxPlus && !hasOraxPlus;

  const requireOraxPlus = async () => {
    if (hasOraxPlus) return true;

    const latestOraxPlus = await onRefreshOraxPlus?.();
    if (latestOraxPlus?.active) return true;

    setShowTranslationModal(true);
    return false;
  };

  return (
    <div className={styles.settingsContainer}>
      <h2 className={styles.sectionTitle}>Settings</h2>
      <div className={styles.settingsGrid}>
        {/* Basic Configuration Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>Basic Configuration</h3>

          <div className={styles.settingItem}>
            <CustomUsernames groupId={groupId} guildId={guildId} />
          </div>

          <div className={styles.settingItem}>
            <OptionsField
              label="Replies style"
              fieldName="replyStyle"
              groupId={groupId}
              guildId={guildId}
              options={[
                { name: "Embed", value: "embed" },
                { name: "Quote (Discord's legacy)", value: "quote" },
                { name: "Quote without jump button", value: "quoteNoButton" },
                { name: "Embed without jump button", value: "embedNoButton" },
              ]}
            />
          </div>

          <div className={styles.settingItem}>
            <CheckboxField
              label="Allow @everyone and @here"
              description="Allow people to ping @everyone and @here in the interserver."
              fieldName="allowEveryone"
              groupId={groupId}
              guildId={guildId}
            />
          </div>

          <div className={styles.settingItem}>
            <CheckboxField
              label="Sync role mentions across servers"
              description="Allow @Role pings to notify matching roles across linked servers (names must exactly match)."
              fieldName="syncMentions"
              groupId={groupId}
              guildId={guildId}
            />
          </div>

          <div className={styles.settingItem}>
            <CheckboxField
              label="Translation"
              description="Automatically translate synced messages. Target language can be selected in every channel's settings."
              fieldName="translation"
              groupId={groupId}
              guildId={guildId}
              forceUnchecked={shouldBlockTranslation}
              onBeforeEnable={requireOraxPlus}
              labelAdornment={
                <span
                  className={styles.oraxPlusTooltip}
                  aria-label="Orax Plus only"
                  tabIndex={0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={styles.oraxPlusIcon}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                    />
                  </svg>
                  <span className={styles.oraxPlusTooltipText} role="tooltip">
                    Orax Plus only
                  </span>
                </span>
              }
            />
          </div>
        </div>

        {/* Moderation Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>Moderation & Security</h3>

          <div className={styles.settingItem}>
            <TextField
              label="Moderators"
              description="By default Orax considers all members with the 'Manage Messages' permission as moderators. You can override this behaviour by writing a list of comma separated usernames."
              fieldName="moderators"
              groupId={groupId}
              guildId={guildId}
              placeholder="Enter usernames separated by commas..."
              parser={(value) => value.replace(" ", ",")}
            />
          </div>

          <div className={styles.settingItem}>
            <TextField
              label="Blacklist"
              description="Prevent messages containing certain words from being sent in the interserver. Comma separated."
              fieldName="wordBlacklist"
              groupId={groupId}
              guildId={guildId}
              placeholder="Enter words separated by commas..."
              parser={(value) => value.replace(" ", ",")}
            />
          </div>

          <div className={styles.settingItem}>
            <TextareaField
              label="Interserv rules"
              description='These rules are displayed to users with the "/rules" command.'
              fieldName="rules"
              groupId={groupId}
              guildId={guildId}
              placeholder="Write the interserv rules here..."
              rows={8}
            />
          </div>

          <div className={styles.settingItem}>
            <LogMessages groupId={groupId} guildId={guildId} />
          </div>
        </div>
      </div>
      {showTranslationModal && (
        <ActionModal
          title="Orax Plus required"
          description={
            <p>
              Auto translation is an Orax Plus feature.
              {voteProvider
                ? ` ${voteProvider.label} or subscribe to Orax Plus to enable automatic translation for this group.`
                : " Subscribe to Orax Plus to enable automatic translation for this group."}
            </p>
          }
          actions={[
            ...(voteProvider
              ? [
                  {
                    label: voteProvider.label,
                    variant: "secondary" as const,
                    disabled: !onStartOraxPlusVote,
                    onClick: () => {
                      setShowTranslationModal(false);
                      onStartOraxPlusVote?.();
                    },
                  },
                ]
              : []),
            {
              label: "Subscribe $2.99/mo",
              variant: "primary",
              disabled: !onStartOraxPlusCheckout,
              onClick: () => {
                setShowTranslationModal(false);
                onStartOraxPlusCheckout?.("monthly");
              },
            },
            {
              label: "Lifetime $19.99",
              variant: "primary",
              disabled: !onStartOraxPlusCheckout,
              onClick: () => {
                setShowTranslationModal(false);
                onStartOraxPlusCheckout?.("lifetime");
              },
            },
          ]}
          onClose={() => setShowTranslationModal(false)}
        />
      )}
    </div>
  );
};

export default ModernSettings;
