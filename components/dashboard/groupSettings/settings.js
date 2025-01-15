import { useRouter } from "next/router";
import HiddenMenu from "../../ui/hiddenMenu";
import CustomUsernames from "./settings/customUsernames";
import LogMessages from "./settings/logMessages";
import OptionsField from "./settings/optionField";

const Settings = ({}) => {
  const router = useRouter();
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild");
  const { groupId } = router.query;

  return (
    <HiddenMenu title={"Settings"} defaultOpen={true}>
      <>
        <CustomUsernames groupId={groupId} guildId={guildId} />
        <br></br>
        <LogMessages groupId={groupId} guildId={guildId} />
        <br></br>
        <OptionsField
          label="Replies style"
          fieldName="replyStyle"
          groupId={groupId}
          guildId={guildId}
          options={[
            { name: "Embed", value: "embed" },
            { name: "Quote (Discord's legacy)", value: "quote" },
            { name: "Quote without jump button", value: "quoteNoButton" },
          ]}
        />
        <br></br>
        <OptionsField
          label="Explanation message"
          description="When enabled, the bot will send a message explaining how the interserv works"
          fieldName="interservHelper"
          groupId={groupId}
          guildId={guildId}
          options={[
            { name: "Disabled", value: 0 },
            { name: "Every 20 messages", value: 20 },
            { name: "Every 50 messages", value: 50 },
            { name: "Every 100 messages", value: 100 },
            { name: "Every 200 messages", value: 200 },
          ]}
        />
      </>
    </HiddenMenu>
  );
};

export default Settings;
