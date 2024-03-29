import { useRouter } from "next/router";
import dashboardStyles from "../../../../../styles/Dashboard.module.css";
import groupStyles from "../../../../../styles/dashboard/OwnedGroup.module.css";
import BackButton from "../../../../../components/ui/backButton";
import ChannelDisableWarningMessage from "../../../../../components/dashboard/groupSettings/channelSettings/channelDisableWarningMessage";
import HiddenMenu from "../../../../../components/ui/hiddenMenu";

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
        <HiddenMenu title={"Override group settings"}>
          <ChannelDisableWarningMessage
            guildId={guildId}
            channelId={channelId}
          />
        </HiddenMenu>
      </div>
    </>
  );
}
