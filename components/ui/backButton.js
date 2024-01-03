import styles from "../../styles/dashboard/OwnedGroup.module.css";

const BackButton = ({ buttonName }) => {
  return (
    <div className="line">
      <svg
        className={styles.back}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        onClick={() => window.history.back()}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h1 className={styles.title}>{buttonName}</h1>
    </div>
  );
};

export default BackButton;
