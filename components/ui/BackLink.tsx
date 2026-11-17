import styles from "../../styles/components/ui/BackLink.module.css";

interface BackLinkProps {
  label: string;
  onClick: () => void;
  /** Lets the parent set the spacing around the link. */
  className?: string;
}

export default function BackLink({ label, onClick, className }: BackLinkProps) {
  return (
    <button
      type="button"
      className={className ? `${styles.backLink} ${className}` : styles.backLink}
      onClick={onClick}
    >
      ← {label}
    </button>
  );
}
