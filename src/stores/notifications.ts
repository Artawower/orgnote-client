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

    const resolveNotificationId = (id?: string): string => {
      if (id && id.trim()) return id;
      return crypto.randomUUID();
    };

    const notify = (notificationConfig: NotificationConfig): string => {
      const id = resolveNotificationId(notificationConfig.id);
      const configuredTimeout = config.value.ui.notificationTimeout;
      const timeout = notificationConfig.timeout ?? configuredTimeout ?? 5000;
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
        const existingNotification = notifications.value.find((n) => n.config.id === id);
        if (existingNotification) {
          existingNotification.dismiss?.();
          existingNotification.dismiss = dismiss;
          existingNotification.config = configWithId;
          existingNotification.icon = notificationConfig.icon;
          existingNotification.iconEnabled = notificationConfig.iconEnabled ?? true;
          existingNotification.createdAt = new Date().toISOString();
          existingNotification.readAt = undefined;
          existingNotification.count = (existingNotification.count ?? 1) + 1;
          return id;
        }

        const nextNotification: Notification = {
          createdAt: new Date().toISOString(),
          readAt: undefined,
          count: 1,
          dismiss,
          config: configWithId,
          icon: notificationConfig.icon,
          iconEnabled: notificationConfig.iconEnabled ?? true,
        };

        notifications.value.push(nextNotification);
      }

      return id;
    };

    const clear = (): void => {
      notifications.value.forEach((n) => n.dismiss?.());
      notifications.value = [];
      groupCounts.value.clear();
    };

    const decrementGroupCount = (notificationId: string): void => {
      const currentCount = groupCounts.value.get(notificationId);
      if (!currentCount) return;
      if (currentCount <= 1) {
        groupCounts.value.delete(notificationId);
        return;
      }
      groupCounts.value.set(notificationId, currentCount - 1);
    };

    const deleteNotification = (notificationId: string): void => {
      if (!notificationId) return;

      const notificationIndex = notifications.value.findIndex((n) => n.config.id === notificationId);
      if (notificationIndex < 0) return;

      const notification = notifications.value[notificationIndex];
      if (!notification) return;

      const currentCount = notification.count ?? 1;
      if (currentCount > 1) {
        notification.count = currentCount - 1;
        decrementGroupCount(notificationId);
        return;
      }

      notification.dismiss?.();
      notifications.value.splice(notificationIndex, 1);
      decrementGroupCount(notificationId);
    };

    const markAsRead = (notificationId: string, readAt?: string): void => {
      if (!notificationId) return;
      const notification = notifications.value.find((n) => n.config.id === notificationId);
      if (!notification) return;
      notification.readAt = readAt ?? new Date().toISOString();
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

      const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => key !== 'message'),
      ) as Partial<NotificationConfig>;

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
