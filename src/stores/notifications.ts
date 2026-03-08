import { defineStore, storeToRefs } from 'pinia';
import { type Notification, type NotificationConfig, type NotificationsStore } from 'orgnote-api';
import { ref } from 'vue';
import { notify as notiwindNotify } from 'notiwind';
import { useConfigStore } from './config';
import { NOTIFICATION_GROUP } from 'src/constants/notifications';

export const useNotificationsStore = defineStore<'notifications', NotificationsStore>(
  'notifications',
  (): NotificationsStore => {
    const notifications = ref<Notification[]>([]);
    const groupCounts = ref<Map<string, number>>(new Map());

    const { config } = storeToRefs(useConfigStore());

    const notify = (notificationConfig: NotificationConfig): string => {
      const id = notificationConfig.id ?? crypto.randomUUID();

      const timeout = notificationConfig.timeout ?? config.value.ui.notificationTimeout ?? 5000;
      const shouldGroup = notificationConfig.group !== false;
      const groupKey = id;

      if (shouldGroup) {
        const currentCount = groupCounts.value.get(groupKey) ?? 0;
        groupCounts.value.set(groupKey, currentCount + 1);
      }

      const count = shouldGroup ? groupCounts.value.get(groupKey) : undefined;

      const dismiss = notiwindNotify(
        {
          group: NOTIFICATION_GROUP,
          title: notificationConfig.message,
          text: notificationConfig.description,
          type: notificationConfig.level ?? 'info',
          count,
          groupKey,
          closable: notificationConfig.closable ?? true,
          icon: notificationConfig.icon,
          iconEnabled: notificationConfig.iconEnabled ?? true,
          onClick: notificationConfig.onClick,
        },
        timeout,
      );

      const configWithId = { ...notificationConfig, id };

      if (notificationConfig.stored) {
        notifications.value.push({
          read: false,
          dismiss,
          config: configWithId,
          icon: notificationConfig.icon,
          iconEnabled: notificationConfig.iconEnabled ?? true,
        });
      }

      return id;
    };

    const clear = (): void => {
      notifications.value.forEach((n) => n.dismiss?.());
      notifications.value = [];
      groupCounts.value.clear();
    };

    const deleteNotification = (notificationId: string): void => {
      const notification = notifications.value.find((n) => n.config.id === notificationId);
      notification?.dismiss?.();
      notifications.value = notifications.value.filter((n) => n.config.id !== notificationId);
    };

    const markAsRead = (notificationId: string): void => {
      const notification = notifications.value.find((n) => n.config.id === notificationId);
      if (!notification) return;
      notification.read = true;
    };

    const hideAll = (): void => {
      notifications.value.forEach((n) => {
        n.dismiss?.();
        n.dismiss = undefined;
      });
    };

    const update = (notificationId: string, updates: Partial<NotificationConfig>): void => {
      const notification = notifications.value.find((n) => n.config.id === notificationId);
      if (!notification) return;

      const { message, ...safeUpdates } = updates;
      void message;

      notification.config = { ...notification.config, ...safeUpdates };
    };

    return {
      notify,
      update,
      clear,
      hideAll,
      delete: deleteNotification,
      markAsRead,
      notifications,
    };
  },
  {
    persist: true,
  },
);
