import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "../../styles/components/ui/SearchableList.module.css";

interface SearchableListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  /** Text shown for the item, also matched against the search query. */
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
  renderIcon?: (item: T) => ReactNode;
  searchPlaceholder: string;
  /** Shown when `items` is empty. */
  emptyText: string;
  /** Shown when the search matches nothing. */
  noResultsText: string;
  clearSearchLabel?: string;
  loading?: boolean;
  loadingText?: string;
  /** Key of the item being processed: its row shows a spinner and the list is disabled. */
  pendingKey?: string | null;
  /** The search field only appears from this many items. */
  minItemsForSearch?: number;
  /** Focus the search field once it appears (skipped on touch screens to keep the keyboard closed). */
  autoFocus?: boolean;
}

interface FoldedText {
  text: string;
  /** For each code unit of `text`, the [start, end) range of the source character it comes from. */
  ranges: [number, number][];
}

// Lowercases, strips accents and reads "-" / "_" as spaces, so "happy birthday"
// finds "happy-birthday" and "general" finds "Général".
function fold(source: string): FoldedText {
  let text = "";
  const ranges: [number, number][] = [];
  let offset = 0;
  for (const char of source) {
    let folded = char
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    if (folded === "-" || folded === "_") folded = " ";
    for (let i = 0; i < folded.length; i++) {
      ranges.push([offset, offset + char.length]);
    }
    text += folded;
    offset += char.length;
  }
  return { text, ranges };
}

function highlight(label: string, query: string): ReactNode {
  if (!query) return label;
  const { text, ranges } = fold(label);
  const index = text.indexOf(query);
  if (index === -1) return label;
  const start = ranges[index]![0];
  const end = ranges[index + query.length - 1]![1];
  return (
    <>
      {label.slice(0, start)}
      <mark>{label.slice(start, end)}</mark>
      {label.slice(end)}
    </>
  );
}

export default function SearchableList<T>({
  items,
  getKey,
  getLabel,
  onSelect,
  renderIcon,
  searchPlaceholder,
  emptyText,
  noResultsText,
  clearSearchLabel = "Clear search",
  loading = false,
  loadingText,
  pendingKey = null,
  minItemsForSearch = 6,
  autoFocus = false,
}: SearchableListProps<T>) {
  const [query, setQuery] = useState("");
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const showSearch = !loading && items.length >= minItemsForSearch;
  const foldedQuery = showSearch ? fold(query).text.trim() : "";
  const visibleItems = foldedQuery
    ? items.filter((item) => fold(getLabel(item)).text.includes(foldedQuery))
    : items;

  useEffect(() => {
    if (!autoFocus || !showSearch) return;
    if (window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }, [autoFocus, showSearch]);

  // Keeps the list's size while filtering, so in a centered layout the search
  // field does not jump around as results shrink.
  function changeQuery(value: string) {
    if (!query && value) setLockedHeight(rootRef.current?.offsetHeight ?? null);
    if (!value) setLockedHeight(null);
    setQuery(value);
  }

  function focusItem(index: number) {
    const buttons =
      listRef.current?.querySelectorAll<HTMLButtonElement>("button");
    if (!buttons || buttons.length === 0) return;
    buttons[Math.min(index, buttons.length - 1)]?.focus();
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === "Enter" && visibleItems.length === 1) {
      // Only on a single match: picking can trigger a real action (joining).
      event.preventDefault();
      if (!pendingKey) onSelect(visibleItems[0]!);
    }
  }

  function handleItemKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index === 0) inputRef.current?.focus();
      else focusItem(index - 1);
    }
  }

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={lockedHeight ? { minHeight: lockedHeight } : undefined}
    >
      {showSearch && (
        <div className={styles.search}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={styles.searchIcon}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                changeQuery("");
                inputRef.current?.focus();
              }}
              aria-label={clearSearchLabel}
            >
              ×
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className={styles.status} aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          {loadingText && <p>{loadingText}</p>}
        </div>
      ) : visibleItems.length === 0 ? (
        <p className={styles.status} aria-live="polite">
          {items.length === 0 ? emptyText : noResultsText}
        </p>
      ) : (
        <ul ref={listRef} className={styles.list}>
          {visibleItems.map((item, index) => {
            const key = getKey(item);
            const label = getLabel(item);
            const isPending = pendingKey === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  className={
                    isPending ? `${styles.item} ${styles.pending}` : styles.item
                  }
                  onClick={() => onSelect(item)}
                  onKeyDown={(event) => handleItemKeyDown(event, index)}
                  disabled={Boolean(pendingKey)}
                  aria-busy={isPending || undefined}
                  title={label}
                >
                  {renderIcon && (
                    <span className={styles.icon}>{renderIcon(item)}</span>
                  )}
                  <span className={styles.label}>
                    {highlight(label, foldedQuery)}
                  </span>
                  {isPending ? (
                    <span className={styles.spinner} aria-hidden="true" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className={styles.chevron}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
