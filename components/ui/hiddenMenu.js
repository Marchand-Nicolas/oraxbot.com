import styles from "../../styles/components/ui/hiddenMenu.module.css";

const HiddenMenu = ({ children, title, defaultOpen }) => {
  return (
    <>
      <label className={styles.openMenuLabel}>
        <input
          type="checkbox"
          id="group-advanced-settings"
          className={styles.openMenuCheckbox}
          defaultChecked={defaultOpen ? defaultOpen : false}
        />
        <div className={styles.openMenuVisual}>
          <h2>{title}</h2>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={styles.openMenuIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </label>
      <div className={styles.content}>{children}</div>
    </>
  );
};

export default HiddenMenu;
