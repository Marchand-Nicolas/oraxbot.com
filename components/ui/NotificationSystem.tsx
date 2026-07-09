import React, { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "../../styles/components/ui/NotificationSystem.module.css";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationItem {
  id: number;
  type: NotificationType;
  title?: string;
  message?: string;
  autoClose?: boolean;
  duration?: number;
  [key: string]: unknown;
}

interface AddNotificationOptions {
  type?: NotificationType;
  title?: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
  [key: string]: unknown;
}

let notificationId = 0;
let addNotificationRef: ((notification: AddNotificationOptions) => number) | null =
  null;

// Notification types with their corresponding icons
const NotificationIcons: Record<NotificationType, ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.65 21H20.35A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 16V12M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const Notification = ({
  notification,
  onRemove,
}: {
  notification: NotificationItem;
  onRemove: (id: number) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.autoClose !== false) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration || 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const typeStyle = styles[notification.type] as string | undefined;

  return (
    <div
      className={`${styles.notification} ${typeStyle ?? ""} ${
        isVisible && !isExiting ? styles.visible : ""
      } ${isExiting ? styles.exiting : ""}`}
    >
      <div className={styles.iconContainer}>
        {NotificationIcons[notification.type]}
      </div>
      <div className={styles.content}>
        <div className={styles.title}>{notification.title}</div>
        {notification.message && (
          <div className={styles.message}>{notification.message}</div>
        )}
      </div>
      <button
        className={styles.closeButton}
        onClick={handleRemove}
        aria-label="Close notification"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((notification: AddNotificationOptions) => {
    const id = ++notificationId;
    const newNotification: NotificationItem = {
      id,
      type: "info",
      autoClose: true,
      duration: 5000,
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    return id;
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  // Store reference for global access
  useEffect(() => {
    addNotificationRef = addNotification;
    return () => {
      addNotificationRef = null;
    };
  }, [addNotification]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className={styles.container}>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>,
    document.body,
  );
};

// Global notification methods
export const notify = {
  success: (title: string, message?: string, options: AddNotificationOptions = {}): number | undefined => {
    if (addNotificationRef) {
      return addNotificationRef({ type: "success", title, message, ...options });
    }
    return undefined;
  },
  error: (title: string, message?: string, options: AddNotificationOptions = {}): number | undefined => {
    if (addNotificationRef) {
      return addNotificationRef({ type: "error", title, message, ...options });
    }
    return undefined;
  },
  warning: (title: string, message?: string, options: AddNotificationOptions = {}): number | undefined => {
    if (addNotificationRef) {
      return addNotificationRef({ type: "warning", title, message, ...options });
    }
    return undefined;
  },
  info: (title: string, message?: string, options: AddNotificationOptions = {}): number | undefined => {
    if (addNotificationRef) {
      return addNotificationRef({ type: "info", title, message, ...options });
    }
    return undefined;
  },
  custom: (options: AddNotificationOptions): number | undefined => {
    if (addNotificationRef) {
      return addNotificationRef(options);
    }
    return undefined;
  },
};

export default NotificationSystem;
