import { useEffect, useState, type ChangeEvent } from "react";
import styles from "../../../../styles/components/dashboard/groupSettings/settings.module.css";
import { platformApi } from "../../../../utils/platformApi";
import TextInput from "../../../ui/textInput";
import type { FilterRule } from "../../../../types";
import { t } from "../../../../utils/i18n";

interface FiltersProps {
  groupId?: string | string[];
  guildId?: string | string[];
}

const Filters = ({ groupId, guildId }: FiltersProps) => {
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !guildId) return;

    // Fetch initial filter rules
    platformApi<{ filterRules?: string }>("get_group_settings_field", {
      groupId,
      guildId,
      fieldName: "filterRules",
    })
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

  const saveFilterRules = (rules: FilterRule[]) => {
    platformApi("set_group_settings_field", {
      groupId,
      guildId,
      fieldName: "filterRules",
      fieldValue: JSON.stringify(rules),
    });
  };

  const addRule = () => {
    const newRule: FilterRule = {
      id: Date.now().toString(),
      type: "keyword",
      condition: "include",
      value: "",
    };
    const updatedRules = [...filterRules, newRule];
    setFilterRules(updatedRules);
    saveFilterRules(updatedRules);
  };

  const removeRule = (ruleId: string) => {
    const updatedRules = filterRules.filter((rule) => rule.id !== ruleId);
    setFilterRules(updatedRules);
    saveFilterRules(updatedRules);
  };

  const updateRule = (ruleId: string, patch: Partial<FilterRule>) => {
    setFilterRules((prevRules) => {
      const updatedRules = prevRules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...patch } : rule,
      );
      saveFilterRules(updatedRules);
      return updatedRules;
    });
  };

  if (isLoading) {
return (
        <>
          <label>
            <strong>{t("filters.title")}</strong>
          </label>
          <label>{t("filters.loading")}</label>
        </>
      );
    }

  return (
    <>
      <label>
        <strong>{t("filters.title")}</strong>
      </label>
      <label>{t("filters.desc")}</label>

      <div style={{ marginTop: "1rem" }}>
        {filterRules.length === 0 ? (
          <div className={styles.emptyFilters}>
            <p>{t("filters.noRules")}</p>
          </div>
        ) : (
          filterRules.map((rule) => (
            <div key={rule.id} className={styles.filterRule}>
              <select
                value={rule.type}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const newType = e.target.value as FilterRule["type"];
                  updateRule(
                    rule.id,
                    newType !== rule.type
                      ? { type: newType, value: "" }
                      : { type: newType },
                  );
                }}
                className={styles.filterRuleSelect}
                style={{ width: "120px" }}
              >
                <option value="keyword">{t("filters.keyword")}</option>
                <option value="media">{t("filters.media")}</option>
                <option value="author">{t("filters.author")}</option>
              </select>

              <select
                value={rule.condition}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  updateRule(rule.id, {
                    condition: e.target.value as FilterRule["condition"],
                  })
                }
                className={styles.filterRuleSelect}
                style={{ width: "100px" }}
              >
                <option value="include">{t("filters.include")}</option>
                <option value="exclude">{t("filters.exclude")}</option>
              </select>

              {rule.type === "keyword" ? (
                <TextInput
                  placeholder={t("filters.enterKeywords")}
                  value={rule.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateRule(rule.id, { value: e.target.value })
                  }
                  className={styles.filterRuleInput}
                />
              ) : rule.type === "author" ? (
                <select
                  value={rule.value}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    updateRule(rule.id, { value: e.target.value })
                  }
                  className={styles.filterRuleSelect}
                  style={{ flex: 1 }}
                >
                  <option value="">{t("filters.selectAuthorType")}</option>
                  <option value="human">{t("common.human")}</option>
                  <option value="webhook">{t("common.webhook")}</option>
                  <option value="bot">{t("common.bot")}</option>
                </select>
              ) : (
                <select
                  value={rule.value}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    updateRule(rule.id, { value: e.target.value })
                  }
                  className={styles.filterRuleSelect}
                  style={{ flex: 1 }}
                >
                  <option value="">{t("filters.selectMediaType")}</option>
                  <option value="images">{t("filters.images")}</option>
                  <option value="videos">{t("filters.videos")}</option>
                  <option value="attachments">{t("filters.attachments")}</option>
                  <option value="links">{t("filters.links")}</option>
                  <option value="embeds">{t("filters.embeds")}</option>
                </select>
              )}

              <button
                onClick={() => removeRule(rule.id)}
                className={styles.removeRuleButton}
              >
                {t("common.remove")}
              </button>
            </div>
          ))
        )}

        <button onClick={addRule} className={styles.addRuleButton}>
          {t("filters.addRule")}
        </button>
      </div>

      {filterRules.length > 0 && (
        <div className={styles.filterHelp}>
          <strong>{t("filters.howItWorks")}</strong>
          <ul>
            <li>
              <strong>{t("filters.include")}:</strong> {t("filters.includeDesc")}
            </li>
            <li>
              <strong>{t("filters.exclude")}:</strong> {t("filters.excludeDesc")}
            </li>
            <li>
              <strong>{t("filters.keyword")}:</strong> {t("filters.keywordsDesc")}
            </li>
            <li>
              <strong>{t("filters.media")}:</strong> {t("filters.mediaDesc")}
            </li>
            <li>
              <strong>{t("filters.author")}:</strong> {t("filters.authorDesc")}
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Filters;
