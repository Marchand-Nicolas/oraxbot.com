import { useRouter } from "next/router";
import HiddenMenu from "../../ui/hiddenMenu";
import CustomUsernames from "./settings/customUsernames";
import LogMessages from "./settings/logMessages";

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
      </>
    </HiddenMenu>
  );
};

export default Settings;
