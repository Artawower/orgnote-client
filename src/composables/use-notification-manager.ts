import type { Notification, NotificationConfig } from 'orgnote-api';
import { ref, type Ref } from 'vue';

export interface NotificationManagerConfig {
  defaultTimeout?: number;
}

export interface NotificationManager {
  notifications: Ref<Notification[]>;
  notify: (config: NotificationConfig) => void;
  dismiss: (notificationId: string) => void;
  delete: (notificationId: string) => void;
  clear: () => void;
  markAsRead: (notificationId: string) => void;
  hideAll: () => void;
}

let notificationCounter = 0;

export const createNotificationManager = (
  config: NotificationManagerConfig = {},
): NotificationManager => {
  const { defaultTimeout = 5000 } = config;

  const notifications = ref<Notification[]>([]);

  const findNotification = (id: string) => notifications.value.find((n) => n.config.id === id);

  const createDismissHandler = (id: string) => () => {
    const notification = findNotification(id);
    if (notification) {
      notification.dismiss = undefined;
    }
  };

  const scheduleAutoDismiss = (id: string, timeout: number) => {
    if (timeout <= 0) return;

    setTimeout(() => {
      const notification = findNotification(id);
      notification?.dismiss?.();
    }, timeout);
  };

  const notify = (notificationConfig: NotificationConfig): void => {
    const id = notificationConfig.id ?? `notification-${++notificationCounter}`;
    const timeout = notificationConfig.timeout ?? defaultTimeout;

    const configWithId = { ...notificationConfig, id };
    const dismiss = createDismissHandler(id);

    notifications.value.push({
      read: false,
      dismiss,
      config: configWithId,
    });

    scheduleAutoDismiss(id, timeout);
  };

  const dismiss = (notificationId: string): void => {
    const notification = findNotification(notificationId);
    if (notification) {
      notification.dismiss = undefined;
    }
  };

  const deleteNotification = (notificationId: string): void => {
    const notification = findNotification(notificationId);
    notification?.dismiss?.();
    notifications.value = notifications.value.filter((n) => n.config.id !== notificationId);
  };

  const clear = (): void => {
    notifications.value.forEach((n) => n.dismiss?.());
    notifications.value = [];
  };

  const markAsRead = (notificationId: string): void => {
    const notification = findNotification(notificationId);
    if (notification) {
      notification.read = true;
    }
  };

  const hideAll = (): void => {
    notifications.value.forEach((n) => {
      n.dismiss?.();
      n.dismiss = undefined;
    });
  };

  return {
    notifications,
    notify,
    dismiss,
    delete: deleteNotification,
    clear,
    markAsRead,
    hideAll,
  };
};

const globalManager = createNotificationManager();

export const useNotificationManager = (): NotificationManager => globalManager;
