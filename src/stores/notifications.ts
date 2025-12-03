import { defineStore, storeToRefs } from 'pinia';
import { type Notification, type NotificationConfig, type NotificationsStore } from 'orgnote-api';
import { ref } from 'vue';
import { notify as notiwindNotify } from 'notiwind';
import { useConfigStore } from './config';

let notificationCounter = 0;

const getNotificationKey = (config: NotificationConfig): string =>
  `${config.message}::${config.description ?? ''}::${config.level ?? 'info'}`;

export const useNotificationsStore = defineStore<'notifications', NotificationsStore>(
  'notifications',
  (): NotificationsStore => {
    const notifications = ref<Notification[]>([]);
    const groupCounts = ref<Map<string, number>>(new Map());

    const { config } = storeToRefs(useConfigStore());

    const notify = (notificationConfig: NotificationConfig): void => {
      const id = notificationConfig.id ?? `notification-${++notificationCounter}`;
      const timeout = notificationConfig.timeout ?? config.value.ui.notificationTimeout ?? 5000;
      const shouldGroup = notificationConfig.group !== false;
      const groupKey = getNotificationKey(notificationConfig);

      if (shouldGroup) {
        const currentCount = groupCounts.value.get(groupKey) ?? 0;
        groupCounts.value.set(groupKey, currentCount + 1);
      }

      const count = shouldGroup ? groupCounts.value.get(groupKey) : undefined;

      notiwindNotify(
        {
          group: 'main',
          title: notificationConfig.message,
          text: notificationConfig.description,
          type: notificationConfig.level ?? 'info',
          count,
          groupKey: shouldGroup ? groupKey : undefined,
          closable: notificationConfig.closable ?? true,
          icon: notificationConfig.icon,
          iconEnabled: notificationConfig.iconEnabled ?? true,
          onClick: notificationConfig.onClick,
        },
        timeout,
      );

      const configWithId = { ...notificationConfig, id };

      notifications.value.push({
        read: false,
        config: configWithId,
        icon: notificationConfig.icon,
        iconEnabled: notificationConfig.iconEnabled ?? true,
      });
    };

    const clear = (): void => {
      notifications.value = [];
      groupCounts.value.clear();
    };

    const deleteNotification = (notificationId: string): void => {
      notifications.value = notifications.value.filter((n) => n.config.id !== notificationId);
    };

    const markAsRead = (notificationId: string): void => {
      const notification = notifications.value.find((n) => n.config.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    };

    const hideAll = (): void => {
      notifications.value.forEach((n) => {
        n.dismiss = undefined;
      });
    };

    return {
      notify,
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
