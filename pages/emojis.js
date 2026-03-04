import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/Emojis.module.css";
import config from "../utils/config.json";

export default function EmojisPage() {
  const [query, setQuery] = useState("");
  const [exact, setExact] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const latestRequestId = useRef(0);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const fetchEmojiPage = useCallback(
    async ({ name, pageToLoad, requestId }) => {
      if (pageToLoad === 0) {
        setIsLoadingInitial(true);
      } else {
        setIsLoadingMore(true);
      }

      const controller = new AbortController();
      let timeoutId;

      try {
        timeoutId = window.setTimeout(() => {
          controller.abort();
        }, 12000);

        const res = await fetch(
          `${config.apiV2}search_emoji?name=${encodeURIComponent(name)}&page=${pageToLoad}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error(`Search failed with status ${res.status}`);
        }

        const data = await res.json();

        if (latestRequestId.current !== requestId) return;

        const exactResults = Array.isArray(data.exact) ? data.exact : [];
        const relatedResults = Array.isArray(data.similar) ? data.similar : [];

        if (pageToLoad === 0) {
          setExact(exactResults);
          setSimilar(relatedResults);
        } else {
          setSimilar((previous) => {
            const seen = new Set(
              previous.map((emoji) => `${emoji.id}-${emoji.animated}`),
            );
            const uniqueRelated = relatedResults.filter((emoji) => {
              const key = `${emoji.id}-${emoji.animated}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            return [...previous, ...uniqueRelated];
          });
        }

        setPage(pageToLoad);
        setHasMore(relatedResults.length > 0);
      } catch (e) {
        if (latestRequestId.current !== requestId) return;
        console.error(e);
        setExact([]);
        setSimilar([]);
        setHasMore(false);
        setError("Unable to search emojis right now.");
      } finally {
        window.clearTimeout(timeoutId);
        if (pageToLoad === 0) {
          setIsLoadingInitial(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [],
  );

  const searchEmojis = async (value) => {
    setQuery(value);
    setError("");
    setPage(0);
    setHasMore(false);
    setIsLoadingMore(false);
    setExact([]);
    setSimilar([]);

    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    await fetchEmojiPage({ name: value, pageToLoad: 0, requestId });
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingInitial || isLoadingMore) return;

    const requestId = latestRequestId.current;
    await fetchEmojiPage({
      name: query,
      pageToLoad: page + 1,
      requestId,
    });
  }, [fetchEmojiPage, hasMore, isLoadingInitial, isLoadingMore, page, query]);

  useEffect(() => {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    fetchEmojiPage({ name: "", pageToLoad: 0, requestId });
  }, [fetchEmojiPage]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "300px" },
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMore]);

  useEffect(() => {
    if (!hasMore || isLoadingInitial || isLoadingMore) return;
    if (!sentinelRef.current) return;

    const sentinelRect = sentinelRef.current.getBoundingClientRect();
    const isSentinelVisible = sentinelRect.top <= window.innerHeight + 300;

    if (!isSentinelVisible) return;

    const timer = window.setTimeout(() => {
      loadMore();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasMore, isLoadingInitial, isLoadingMore, loadMore, similar.length]);

  const renderEmojiGrid = (items) => {
    if (!items.length) {
      return <p className={styles.empty}>No emojis found.</p>;
    }

    return (
      <div className={styles.emojiGrid}>
        {items.map((emoji) => (
          <img
            key={`${emoji.id}-${emoji.animated}`}
            className={styles.emojiImage}
            src={`https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=32&animated=${emoji.animated}`}
            alt={`Emoji ${emoji.id}`}
            width={50}
            height={50}
            loading="lazy"
          />
        ))}
      </div>
    );
  };

  const isSearchEmpty = query.trim() === "";

  return (
    <>
      <Header />

      <main className={styles.main}>
        <section className={styles.searchSection}>
          <h1 className={styles.title}>Emoji Search</h1>
          <input
            className={styles.searchInput}
            type="text"
            value={query}
            onChange={(event) => searchEmojis(event.target.value)}
            placeholder="Type an emoji name..."
            aria-label="Search emoji"
          />

          {isLoadingInitial && <p className={styles.status}>Searching...</p>}
          {error && <p className={styles.error}>{error}</p>}
        </section>

        <section className={styles.resultsSection}>
          {!isSearchEmpty && (
            <>
              <h2 className={styles.categoryTitle}>Exact match</h2>
              {renderEmojiGrid(exact)}
            </>
          )}

          {!isSearchEmpty && (
            <h2 className={styles.categoryTitle}>Related emojis</h2>
          )}
          {renderEmojiGrid(similar)}

          {isLoadingMore && <p className={styles.status}>Loading more...</p>}
          <div className={styles.sentinel} ref={sentinelRef} />
        </section>
      </main>

      <Footer />
    </>
  );
}
