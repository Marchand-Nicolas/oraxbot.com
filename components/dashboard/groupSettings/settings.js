import { useRouter } from "next/router";
import HiddenMenu from "../../ui/hiddenMenu";
import CustomUsernames from "./settings/customUsernames";
import LogMessages from "./settings/logMessages";
import OptionsField from "./settings/optionField";
import TextField from "./settings/textField";

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
        <TextField
          label="Moderators"
          description="By default Orax considers all members with the 'Manage Messages' permission as moderators. You can override this behaviour by writting a list of comma separated usernames."
          fieldName="moderators"
          groupId={groupId}
          guildId={guildId}
          placeholder="Enter usernames separated by commas..."
          parser={(value) => value.replace(" ", ",")}
        />
      </>
    </HiddenMenu>
  );
};

export default Settings;
