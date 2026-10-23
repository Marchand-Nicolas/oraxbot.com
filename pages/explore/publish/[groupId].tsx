import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/router";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import styles from "../../../styles/ExplorePublish.module.css";
import config from "../../../utils/config.json";
import type { Channel } from "../../../types";
import { getPlatform } from "../../../utils/platforms";
import {
  detectActivePlatform,
  getPlatformToken,
} from "../../../utils/platforms/oauth";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

interface PublishForm {
  description: string;
  image_url: string;
  alerts_channel_id: string;
  published: boolean;
}

export default function PublishGroup() {
  const router = useRouter();
  const {
    groupId,
    guild: guildFromQuery,
    platform: platformFromQuery,
  } = router.query;
  const guildId = Array.isArray(guildFromQuery)
    ? guildFromQuery[0]
    : guildFromQuery;
  const platformSlugParam = Array.isArray(platformFromQuery)
    ? platformFromQuery[0]
    : platformFromQuery;
  const platform =
    (platformSlugParam ? getPlatform(platformSlugParam) : undefined) ||
    (typeof window !== "undefined" ? detectActivePlatform() : undefined);

  const [form, setForm] = useState<PublishForm>({
    description: "",
    image_url: "",
    alerts_channel_id: "",
    published: true,
  });
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [imageData, setImageData] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        const res = await fetch(`${config.apiV2}get_guild_channels`, {
          method: "POST",
          body: JSON.stringify({
            guildId,
            platform: platform?.slug,
          }),
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
  }, [guildId, platform?.slug]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target;
    const { name, value } = target;
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === "checkbox";
    const checked = isCheckbox
      ? (target as HTMLInputElement).checked
      : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const processSelectedFile = (file: File | undefined | null) => {
    if (!file) return;

    setImageError("");
    setSuccess(false);

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      setImageError("Unsupported format. Please upload a PNG, JPG, WEBP, or GIF.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image is too large. Maximum size is 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageData(reader.result);
        setSelectedFileName(file.name);
        setRemoveImage(false);
      }
    };
    reader.onerror = () => {
      setImageError("Failed to read image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processSelectedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processSelectedFile(file);
  };

  const handleRemoveImage = () => {
    setImageData(null);
    setSelectedFileName("");
    setRemoveImage(true);
    setImageError("");
    setForm((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!groupId) return;

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        group_id: groupId,
        description: form.description || null,
        image_url: removeImage ? null : form.image_url || null,
        image_data: imageData || undefined,
        remove_image: removeImage || undefined,
        alerts_channel_id: form.alerts_channel_id || null,
        published: form.published ? 1 : 0,
        platform: platform?.slug,
        token: platform ? getPlatformToken(platform) : undefined,
      };

      const res = await fetch(`${config.apiV2}explore_save_group`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok || data.result === false || data.error) {
        throw new Error(data.message || data.error || "Failed to save group");
      }

      if (typeof data.image_url === "string" || data.image_url === null) {
        setForm((prev) => ({ ...prev, image_url: data.image_url || "" }));
      }
      setImageData(null);
      setSelectedFileName("");
      setRemoveImage(false);
      setSuccess(true);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Failed to save group. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const previewSrc = imageData || (!removeImage ? form.image_url : "");

  return (
    <>
      <Header theme="dark" />
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

          <div className={styles.field}>
            <span>Banner image (PNG, JPG, WEBP, GIF — max 5 MB)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileInputChange}
              className={styles.hiddenFileInput}
            />
            <div
              className={`${styles.uploadDropzone} ${
                isDragging ? styles.uploadDropzoneDragging : ""
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <p className={styles.uploadDropzoneTitle}>
                {selectedFileName
                  ? `Selected: ${selectedFileName}`
                  : "Click or drag & drop an image to upload"}
              </p>
              <small className={styles.hint}>
                Recommended ratio 16:9 — PNG, JPG, WEBP or GIF up to 5 MB
              </small>
            </div>

            {imageError && <p className={styles.error}>{imageError}</p>}

            {previewSrc && (
              <div className={styles.imagePreviewWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={previewSrc}
                  src={previewSrc}
                  alt="Group image preview"
                  className={styles.imagePreview}
                />
                <div className={styles.imagePreviewActions}>
                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={handleRemoveImage}
                  >
                    Remove image
                  </button>
                </div>
              </div>
            )}
          </div>

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
              This is the {platform?.label || ""} channel where servers willing
              to join your group will send their proposals.
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
      <Footer theme="dark" />
    </>
  );
}
