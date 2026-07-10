import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "../../styles/components/ui/ActionModal.module.css";

export interface ActionModalAction {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  onClick: () => void;
}

interface ActionModalProps {
  title: string;
  description: ReactNode;
  actions: ActionModalAction[];
  onClose: () => void;
}

export default function ActionModal({
  title,
  description,
  actions,
  onClose,
}: ActionModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Close modal"
          onClick={onClose}
        >
          x
        </button>
        <h2 id="action-modal-title">{title}</h2>
        <div className={styles.description}>{description}</div>
        <div className={styles.actions}>
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={[
                styles.actionButton,
                styles[action.variant || "secondary"],
              ].join(" ")}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>,
    document.body,
  );
}
