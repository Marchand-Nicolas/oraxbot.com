import { useRouter } from "next/router";
import dashboardStyles from "../../../../../styles/Dashboard.module.css";
import groupStyles from "../../../../../styles/dashboard/OwnedGroup.module.css";
import BackButton from "../../../../../components/ui/backButton";
import ChannelDisableWarningMessage from "../../../../../components/dashboard/groupSettings/channelSettings/channelDisableWarningMessage";
import HiddenMenu from "../../../../../components/ui/hiddenMenu";
import OptionsField from "../../../../../components/dashboard/groupSettings/settings/optionField";

export default function ChannelSettings() {
  const router = useRouter();
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const { guildId, channelId } = router.query;
  const guildIcon = params.get("icon");
  return (
    <>
      <div
        style={{
          backgroundImage:
            guildIcon && guildIcon != "null"
              ? `url('https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.webp?size=96')`
              : null,
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
