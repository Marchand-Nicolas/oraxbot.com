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
          label="Reply style"
          fieldName="replyStyle"
          groupId={groupId}
          guildId={guildId}
          options={[
            { name: "Embed", value: "embed" },
            { name: "Quote (Discord's legacy)", value: "quote" },
          ]}
        />
      </>
    </HiddenMenu>
  );
};

export default Settings;
