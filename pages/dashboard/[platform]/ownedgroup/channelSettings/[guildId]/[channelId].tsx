import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dashboardStyles from "../../../../../../styles/Dashboard.module.css";
import groupStyles from "../../../../../../styles/dashboard/OwnedGroup.module.css";
import BackButton from "../../../../../../components/ui/backButton";
import ChannelDisableWarningMessage from "../../../../../../components/dashboard/groupSettings/channelSettings/channelDisableWarningMessage";
import HiddenMenu from "../../../../../../components/ui/hiddenMenu";
import OptionsField from "../../../../../../components/dashboard/groupSettings/settings/optionField";
import config from "../../../../../../utils/config.json";
import {
  setActiveTokenCookie,
  setAuthRedirectTarget,
} from "../../../../../../utils/apiClient";
import { getPlatform } from "../../../../../../utils/platforms";
import { platformApi } from "../../../../../../utils/platformApi";
import {
  getLanguageByIndex,
  setGlobalLanguage,
  t,
} from "../../../../../../utils/i18n";
import { LanguageProvider } from "../../../../../../hooks/useLanguage";

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
  const { guildId, channelId, platform: platformSlug } = router.query;
  const platform =
    typeof platformSlug === "string" ? getPlatform(platformSlug) : undefined;
  const guildIcon = params.get("icon");
  const groupId = params.get("groupId") || undefined;
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [lang, setLang] = useState<"en" | "es" | "fr">("en");
  const [translationLanguageOptions, setTranslationLanguageOptions] = useState<
    TranslationLanguageOption[]
  >(fallbackTranslationLanguageOptions);

  useEffect(() => {
    if (!platform) return;
    setActiveTokenCookie(platform.cookieName);
    setAuthRedirectTarget(`/dashboard/${platform.slug}`);
  }, [platform]);

  useEffect(() => {
    if (!groupId || !guildId || !platform) return;

    platformApi<Record<string, unknown>>("get_group_settings_field", {
      groupId,
      guildId,
      fieldName: "translation",
    })
      .then((data) => {
        setTranslationEnabled(!!data.translation);
      });
  }, [groupId, guildId, platform]);

  useEffect(() => {
    if (!guildId) return;
    platformApi<{ settings?: { lang?: number } }>("get_server_data", {
      guildId,
    })
      .then((data) => {
        const resolved = getLanguageByIndex(data.settings?.lang ?? 0);
        setLang(resolved);
        setGlobalLanguage(resolved);
      })
      .catch(() => undefined);
  }, [guildId]);

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

  const backgroundIconUrl =
    guildIcon && guildIcon !== "null" && platform
      ? platform.getGuildBackgroundUrl({
          id: String(guildId ?? ""),
          icon: guildIcon,
        })
      : null;

  return (
    <LanguageProvider lang={lang}>
      <div
        style={{
          backgroundImage: backgroundIconUrl
            ? `url('${backgroundIconUrl}')`
            : undefined,
        }}
        className={dashboardStyles.background}
      />
      <div className={groupStyles.page}>
        <BackButton buttonName={t("channelSettings.backButton")} />
        <div className={groupStyles.settingsContainer}>
          <div className={groupStyles.settingsGrid}>
            <div className={groupStyles.settingsColumn}>
              <h3 className={groupStyles.sectionTitle}>
                {t("channelSettings.channelConfig")}
              </h3>
              <div className={groupStyles.settingItem}>
                <OptionsField
                  label={t("channelSettings.messageDirection")}
                  description={t("channelSettings.messageDirectionDesc")}
                  fieldName="messageDirection"
                  guildId={guildId}
                  channelId={channelId}
                  options={[
                    { name: t("channelSettings.directionAll"), value: "allMessages" },
                    { name: t("channelSettings.directionIncoming"), value: "incomingOnly" },
                    { name: t("channelSettings.directionOutgoing"), value: "outgoingOnly" },
                  ]}
                />
              </div>

              {translationEnabled && (
                <div className={groupStyles.settingItem}>
                  <OptionsField
                    label={t("channelSettings.translationLanguage")}
                    description={t("channelSettings.translationLanguageDesc")}
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
              <HiddenMenu title={t("channelSettings.overrideGroup")}>
                <ChannelDisableWarningMessage
                  guildId={guildId}
                  channelId={channelId}
                />
              </HiddenMenu>
            </div>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}
