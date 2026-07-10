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

interface ModernSettingsProps {
  oraxPlus?: OraxPlusStatus;
  onRefreshOraxPlus?: () => Promise<OraxPlusStatus | undefined>;
  onStartOraxPlusVote?: () => void;
  onStartOraxPlusCheckout?: () => void;
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
  const { groupId } = router.query;
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
              Auto translation is an Orax Plus feature. Vote on Top.gg or
              subscribe to Orax Plus to enable automatic translation for this
              group.
            </p>
          }
          actions={[
            {
              label: "Vote on Top.gg",
              variant: "secondary",
              disabled: !onStartOraxPlusVote,
              onClick: () => {
                setShowTranslationModal(false);
                onStartOraxPlusVote?.();
              },
            },
            {
              label: "Subscribe $2.99/mo",
              variant: "primary",
              disabled: !onStartOraxPlusCheckout,
              onClick: () => {
                setShowTranslationModal(false);
                onStartOraxPlusCheckout?.();
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
