import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../../styles/dashboard/OwnedGroup.module.css";
import type { OraxPlusStatus } from "../../../types";
import ActionModal from "../../ui/ActionModal";
import StarIcon from "../../ui/icons/StarIcon";
import CustomUsernames from "./settings/customUsernames";
import LogMessages from "./settings/logMessages";
import OptionsField from "./settings/optionField";
import TextField from "./settings/textField";
import CheckboxField from "./settings/checkboxField";
import TextareaField from "./settings/textareaField";
import { getPlatform } from "../../../utils/platforms";
import type { OraxPlusPricing } from "../../../utils/pricing";
import { t, getVoteLabel, getGlobalLanguage } from "../../../utils/i18n";

interface ModernSettingsProps {
  oraxPlus?: OraxPlusStatus;
  onRefreshOraxPlus?: () => Promise<OraxPlusStatus | undefined>;
  onStartOraxPlusVote?: () => void;
  onStartOraxPlusCheckout?: (plan?: "monthly" | "lifetime") => void;
  pricing: OraxPlusPricing;
}

const ModernSettings = ({
  oraxPlus,
  onRefreshOraxPlus,
  onStartOraxPlusVote,
  onStartOraxPlusCheckout,
  pricing,
}: ModernSettingsProps) => {
  const router = useRouter();
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild") || "";
  const { groupId, platform: platformSlug } = router.query;
  const platform =
    typeof platformSlug === "string" ? getPlatform(platformSlug) : undefined;
  const voteProvider = platform?.vote;
  const voteLabelText = voteProvider
    ? getVoteLabel(getGlobalLanguage(), voteProvider.provider)
    : "";
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
      <h2 className={styles.sectionTitle}>{t("groupSettings.settingsTitle")}</h2>
      <div className={styles.settingsGrid}>
        {/* Basic Configuration Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>{t("groupSettings.basicConfig")}</h3>

          <div className={styles.settingItem}>
            <CustomUsernames groupId={groupId} guildId={guildId} />
          </div>

          <div className={styles.settingItem}>
            <OptionsField
              label={t("groupSettings.repliesStyle")}
              fieldName="replyStyle"
              groupId={groupId}
              guildId={guildId}
              options={[
                { name: t("groupSettings.repliesEmbed"), value: "embed" },
                { name: t("groupSettings.repliesQuote"), value: "quote" },
                { name: t("groupSettings.repliesQuoteNoButton"), value: "quoteNoButton" },
                { name: t("groupSettings.repliesEmbedNoButton"), value: "embedNoButton" },
              ]}
            />
          </div>

          <div className={styles.settingItem}>
            <CheckboxField
              label={t("groupSettings.allowEveryone")}
              description={t("groupSettings.allowEveryoneDesc")}
              fieldName="allowEveryone"
              groupId={groupId}
              guildId={guildId}
            />
          </div>

          <div className={styles.settingItem}>
            <CheckboxField
              label={t("groupSettings.syncMentions")}
              description={t("groupSettings.syncMentionsDesc")}
              fieldName="syncMentions"
              groupId={groupId}
              guildId={guildId}
            />
          </div>

          <div className={styles.settingItem}>
            <CheckboxField
              label={t("groupSettings.translation")}
              description={t("groupSettings.translationDesc")}
              fieldName="translation"
              groupId={groupId}
              guildId={guildId}
              forceUnchecked={shouldBlockTranslation}
              onBeforeEnable={requireOraxPlus}
              labelAdornment={
                <span
                  className={styles.oraxPlusTooltip}
                  aria-label={t("oraxPlus.only")}
                  tabIndex={0}
                >
                  <StarIcon className={styles.oraxPlusIcon} />
                  <span className={styles.oraxPlusTooltipText} role="tooltip">
                    {t("oraxPlus.only")}
                  </span>
                </span>
              }
            />
          </div>
        </div>

        {/* Moderation Column */}
        <div className={styles.settingsColumn}>
          <h3 className={styles.sectionTitle}>{t("groupSettings.moderationSecurity")}</h3>

          <div className={styles.settingItem}>
            <TextField
              label={t("groupSettings.moderators")}
              description={t("groupSettings.moderatorsDesc")}
              fieldName="moderators"
              groupId={groupId}
              guildId={guildId}
              placeholder={t("groupSettings.moderatorsPlaceholder")}
              parser={(value) => value.replace(" ", ",")}
            />
          </div>

          <div className={styles.settingItem}>
            <TextField
              label={t("groupSettings.blacklist")}
              description={t("groupSettings.blacklistDesc")}
              fieldName="wordBlacklist"
              groupId={groupId}
              guildId={guildId}
              placeholder={t("groupSettings.blacklistPlaceholder")}
              parser={(value) => value.replace(" ", ",")}
            />
          </div>

          <div className={styles.settingItem}>
            <TextareaField
              label={t("groupSettings.interservRules")}
              description={t("groupSettings.interservRulesDesc")}
              fieldName="rules"
              groupId={groupId}
              guildId={guildId}
              placeholder={t("groupSettings.interservRulesPlaceholder")}
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
          title={t("oraxPlus.requiredTitle")}
          description={
            <p>
              {voteProvider
                ? t("oraxPlus.requiredDesc", { vote: voteLabelText })
                : t("oraxPlus.requiredDescNoVote").trim()}
            </p>
          }
          actions={[
            ...(voteProvider
              ? [
                  {
                    label: voteLabelText,
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
              label: t("oraxPlus.subscribe", { price: pricing.monthly }),
              variant: "primary",
              disabled: !onStartOraxPlusCheckout,
              onClick: () => {
                setShowTranslationModal(false);
                onStartOraxPlusCheckout?.("monthly");
              },
            },
            {
              label: t("oraxPlus.lifetime", { price: pricing.lifetime }),
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
