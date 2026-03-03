import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "../../../components/Footer";
import styles from "../../../styles/ExplorePublish.module.css";
import config from "../../../utils/config.json";

export default function PublishGroup() {
  const router = useRouter();
  const { groupId, guild: guildFromQuery } = router.query;
  const guildId = Array.isArray(guildFromQuery)
    ? guildFromQuery[0]
    : guildFromQuery;

  const [form, setForm] = useState({
    description: "",
    image_url: "",
    alerts_channel_id: "",
    published: true,
  });
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    async function loadExistingData() {
      try {
        const res = await fetch(
          `${config.apiV2}explore_get_group?group_id=${groupId}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.result || !data.group) return;
        const g = data.group;
        setForm((prev) => ({
          ...prev,
          description: g.description || "",
          image_url: g.image_url || "",
          alerts_channel_id: g.alerts_channel_id || "",
          published: g.published
            ? g.published === 1 || g.published === true
            : prev.published,
        }));
      } catch (e) {
        console.error("Failed to load existing explore group data", e);
      }
    }

    loadExistingData();
  }, [groupId]);

  useEffect(() => {
    if (!guildId) return;

    async function loadChannels() {
      try {
        const res = await fetch(`${config.serverIp}get_guild_channels`, {
          method: "POST",
          body: JSON.stringify({ guildId }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data && Array.isArray(data.result)) {
          setChannels(data.result);
        } else {
          setChannels([]);
        }
      } catch (e) {
        console.error("Failed to load channels for publish group", e);
        setChannels([]);
      }
    }

    loadChannels();
  }, [guildId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        group_id: groupId,
        description: form.description || null,
        image_url: form.image_url || null,
        alerts_channel_id: form.alerts_channel_id || null,
        published: form.published ? 1 : 0,
      };

      const res = await fetch(`${config.apiV2}explore_save_group`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save group");
      }

      setSuccess(true);
    } catch (e) {
      console.error(e);
      setError("Failed to save group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className={styles.main}>
        <section className={styles.header}>
          <h1 className={styles.title}>Publish your group</h1>
          <p className={styles.subtitle}>
            Configure how your group appears on the explore page.
          </p>
        </section>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Description</span>
            <textarea
              className={styles.textarea}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description of what your group is about."
              rows={4}
            />
          </label>

          <label className={styles.field}>
            <span>Image URL</span>
            <input
              className="textInput normal"
              type="url"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://example.com/your-banner.png"
            />
          </label>

          <label className={styles.field}>
            <span>Proposals channel</span>
            <select
              className="textInput normal"
              name="alerts_channel_id"
              value={form.alerts_channel_id}
              onChange={handleChange}
            >
              <option value="">Select a channel</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
            <small className={styles.hint}>
              This is the Discord channel where servers willing to join your
              group will send their proposals.
            </small>
          </label>

          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
            />
            <span>Published (visible on explore)</span>
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {success && (
            <p className={styles.success}>
              Group saved successfully. It will appear on the explore page if
              published is enabled.
            </p>
          )}

          <div className={styles.actions}>
            <button type="submit" className="button round" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
