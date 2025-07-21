import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from '../../styles/components/ui/NotificationSystem.module.css';

let notificationId = 0;
let addNotificationRef = null;

// Notification types with their corresponding icons
const NotificationIcons = {
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

const Notification = ({ notification, onRemove }) => {
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
  }, [notification]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  return (
    <div
      className={`${styles.notification} ${styles[notification.type]} ${
        isVisible && !isExiting ? styles.visible : ''
      } ${isExiting ? styles.exiting : ''}`}
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
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = ++notificationId;
    const newNotification = {
      id,
      type: 'info',
      autoClose: true,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Store reference for global access
  useEffect(() => {
    addNotificationRef = addNotification;
    return () => {
      addNotificationRef = null;
    };
  }, [addNotification]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className={styles.container}>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>,
    document.body
  );
};

// Global notification methods
export const notify = {
  success: (title, message, options = {}) => {
    if (addNotificationRef) {
      return addNotificationRef({ type: 'success', title, message, ...options });
    }
  },
  error: (title, message, options = {}) => {
    if (addNotificationRef) {
      return addNotificationRef({ type: 'error', title, message, ...options });
    }
  },
  warning: (title, message, options = {}) => {
    if (addNotificationRef) {
      return addNotificationRef({ type: 'warning', title, message, ...options });
    }
  },
  info: (title, message, options = {}) => {
    if (addNotificationRef) {
      return addNotificationRef({ type: 'info', title, message, ...options });
    }
  },
  custom: (options) => {
    if (addNotificationRef) {
      return addNotificationRef(options);
    }
  },
};

export default NotificationSystem;