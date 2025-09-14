import { useRouter } from "next/router";
import styles from "../../../styles/dashboard/OwnedGroup.module.css";
import CustomUsernames from "./settings/customUsernames";
import LogMessages from "./settings/logMessages";
import OptionsField from "./settings/optionField";
import TextField from "./settings/textField";
import CheckboxField from "./settings/checkboxField";

const ModernSettings = () => {
  const router = useRouter();
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild");
  const { groupId } = router.query;

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
            <LogMessages groupId={groupId} guildId={guildId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSettings;
