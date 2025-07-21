import { useEffect, useState } from "react";
import config from "../../../../utils/config";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { getCookie } from "../../../../utils/cookies";
import TextInput from "../../../ui/textInput";

const Filters = ({ groupId, guildId }) => {
  const [filterRules, setFilterRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !guildId) return;

    // Fetch initial filter rules
    fetch(`${config.apiV2}get_group_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName: "filterRules",
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        try {
          const rules = data.filterRules ? JSON.parse(data.filterRules) : [];
          setFilterRules(Array.isArray(rules) ? rules : []);
        } catch (error) {
          console.error("Error parsing filter rules:", error);
          setFilterRules([]);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching filter rules:", error);
        setFilterRules([]);
        setIsLoading(false);
      });
  }, [groupId, guildId]);

  const saveFilterRules = (rules) => {
    fetch(`${config.apiV2}set_group_settings_field`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
        fieldName: "filterRules",
        fieldValue: JSON.stringify(rules),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const addRule = () => {
    const newRule = {
      id: Date.now().toString(),
      type: "keyword",
      condition: "include",
      value: "",
    };
    const updatedRules = [...filterRules, newRule];
    setFilterRules(updatedRules);
    saveFilterRules(updatedRules);
  };

  const removeRule = (ruleId) => {
    const updatedRules = filterRules.filter(rule => rule.id !== ruleId);
    setFilterRules(updatedRules);
    saveFilterRules(updatedRules);
  };

  const updateRule = (ruleId, field, value) => {
    const updatedRules = filterRules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    );
    setFilterRules(updatedRules);
    saveFilterRules(updatedRules);
  };

  if (isLoading) {
    return (
      <>
        <label><strong>Message Filters</strong></label>
        <label>Loading filter rules...</label>
      </>
    );
  }

  return (
    <>
      <label>
        <strong>Message Filters</strong>
      </label>
      <label>
        Configure rules to filter which messages are forwarded in the interserver. 
        Messages must match at least one include rule (if any) and no exclude rules.
      </label>
      
      <div style={{ marginTop: "1rem" }}>
        {filterRules.length === 0 ? (
          <div className={styles.emptyFilters}>
            <p>
              No filter rules configured. All messages will be forwarded.
            </p>
          </div>
        ) : (
          filterRules.map((rule, index) => (
            <div key={rule.id} className={styles.filterRule}>
              <select
                value={rule.type}
                onChange={(e) => updateRule(rule.id, "type", e.target.value)}
                className={styles.filterRuleSelect}
                style={{ width: "120px" }}
              >
                <option value="keyword">Keyword</option>
                <option value="media">Media</option>
              </select>

              <select
                value={rule.condition}
                onChange={(e) => updateRule(rule.id, "condition", e.target.value)}
                className={styles.filterRuleSelect}
                style={{ width: "100px" }}
              >
                <option value="include">Include</option>
                <option value="exclude">Exclude</option>
              </select>

              {rule.type === "keyword" ? (
                <TextInput
                  placeholder="Enter keywords (comma separated)"
                  value={rule.value}
                  onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                  className={styles.filterRuleInput}
                />
              ) : (
                <select
                  value={rule.value}
                  onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                  className={styles.filterRuleSelect}
                  style={{ flex: 1 }}
                >
                  <option value="">Select media type</option>
                  <option value="images">Images</option>
                  <option value="videos">Videos</option>
                  <option value="attachments">Files/Attachments</option>
                  <option value="links">Links</option>
                  <option value="embeds">Embeds</option>
                </select>
              )}

              <button
                onClick={() => removeRule(rule.id)}
                className={styles.removeRuleButton}
              >
                Remove
              </button>
            </div>
          ))
        )}

        <button
          onClick={addRule}
          className={styles.addRuleButton}
        >
          + Add Filter Rule
        </button>
      </div>

      {filterRules.length > 0 && (
        <div className={styles.filterHelp}>
          <strong>How it works:</strong>
          <ul>
            <li><strong>Include rules:</strong> Only messages matching these rules will be forwarded (if no include rules, all messages pass)</li>
            <li><strong>Exclude rules:</strong> Messages matching these rules will never be forwarded</li>
            <li><strong>Keywords:</strong> Comma-separated words to match in message content</li>
            <li><strong>Media:</strong> Filter based on message attachments and content type</li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Filters;