import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dashboardStyles from "../../../../../styles/Dashboard.module.css";
import groupStyles from "../../../../../styles/dashboard/OwnedGroup.module.css";
import BackButton from "../../../../../components/ui/backButton";
import ChannelDisableWarningMessage from "../../../../../components/dashboard/groupSettings/channelSettings/channelDisableWarningMessage";
import HiddenMenu from "../../../../../components/ui/hiddenMenu";
import OptionsField from "../../../../../components/dashboard/groupSettings/settings/optionField";
import config from "../../../../../utils/config.json";
import { getCookie } from "../../../../../utils/cookies";

type TranslationLanguageOption = {
  name: string;
  value: string;
};

const fallbackTranslationLanguageOptions: TranslationLanguageOption[] = [
  { name: "English", value: "en" },
  { name: "Español", value: "es" },
  { name: "Français", value: "fr" },
];

type TranslationLanguagesResponse = {
  success?: boolean;
  languages?: { code?: unknown; name?: unknown }[];
};

export default function ChannelSettings() {
  const router = useRouter();
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const { guildId, channelId } = router.query;
  const guildIcon = params.get("icon");
  const groupId = params.get("groupId") || undefined;
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [translationLanguageOptions, setTranslationLanguageOptions] = useState<
    TranslationLanguageOption[]
  >(fallbackTranslationLanguageOptions);

  useEffect(() => {
    if (!groupId || !guildId) return;

    fetch(`${config.apiV2}get_group_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName: "translation",
      }),
    })
      .then((res) => res.json())
      .then((data: Record<string, unknown>) => {
        setTranslationEnabled(!!data.translation);
      });
  }, [groupId, guildId]);

  useEffect(() => {
    fetch(`${config.apiV2}get_translation_languages`)
      .then((res) => res.json())
      .then((data: TranslationLanguagesResponse) => {
        if (!data.success || !Array.isArray(data.languages)) return;

        const languages = data.languages
          .filter(
            (language) =>
              typeof language.code === "string" &&
              language.code.trim() &&
              typeof language.name === "string" &&
              language.name.trim(),
          )
          .map((language) => ({
            name: String(language.name),
            value: String(language.code),
          }));

        if (languages.length > 0) {
          setTranslationLanguageOptions(languages);
        }
      })
      .catch(() => {
        setTranslationLanguageOptions(fallbackTranslationLanguageOptions);
      });
  }, []);

  return (
    <>
      <div
        style={{
          backgroundImage:
            guildIcon && guildIcon != "null"
              ? `url('https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.webp?size=96')`
              : undefined,
        }}
        className={dashboardStyles.background}
      />
      <div className={groupStyles.page}>
        <BackButton buttonName="Channel settings" />
        <div className={groupStyles.settingsContainer}>
          <div className={groupStyles.settingsGrid}>
            <div className={groupStyles.settingsColumn}>
              <h3 className={groupStyles.sectionTitle}>
                Channel configuration
              </h3>
              <div className={groupStyles.settingItem}>
                <OptionsField
                  label="Message direction"
                  description="Incoming only: receive messages from the interserver, but do not send messages from this channel to others. Outgoing only: send messages from this channel to the interserver, but do not receive messages here."
                  fieldName="messageDirection"
                  guildId={guildId}
                  channelId={channelId}
                  options={[
                    { name: "All messages (default)", value: "allMessages" },
                    { name: "Incoming only", value: "incomingOnly" },
                    { name: "Outgoing only", value: "outgoingOnly" },
                  ]}
                />
              </div>

              {translationEnabled && (
                <div className={groupStyles.settingItem}>
                  <OptionsField
                    label="Translation language"
                    description="Auto translate is enabled, so all messages sent to this channel will be translated to the selected language."
                    fieldName="translationLanguage"
                    groupId={groupId}
                    guildId={guildId}
                    channelId={channelId}
                    options={translationLanguageOptions}
                  />
                </div>
              )}
            </div>

            <div className={groupStyles.settingsColumn}>
              <HiddenMenu title={"Override group settings"}>
                <ChannelDisableWarningMessage
                  guildId={guildId}
                  channelId={channelId}
                />
              </HiddenMenu>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
