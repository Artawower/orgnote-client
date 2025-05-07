import { defineStore, storeToRefs } from 'pinia';
import { I18N, type NotificationConfig, type NotificationsStore } from 'orgnote-api';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useConfigStore } from './config';

export const useNotificationsStore = defineStore<'notifications', NotificationsStore>(
  'notifications',
  (): NotificationsStore => {
    const notifications = ref<
      {
        read?: boolean;
        config: NotificationConfig;
      }[]
    >([]);

    const { t } = useI18n({
      useScope: 'global',
      inheritLocale: true,
    });

    const { config } = storeToRefs(useConfigStore());

    const notify = (notificationConfig: NotificationConfig): void => {
      Notify.create({
        message: notificationConfig.message,
        caption: notificationConfig.caption,
        timeout: notificationConfig.timeout ?? config.value.ui.notificationTimeout ?? 5000,
        type: notificationConfig.level || 'info',
        group: notificationConfig.group ?? notificationConfig.message,
        classes: 'notification',
        closeBtn: notificationConfig.closable ? t(I18N.CLOSE) : null,
      });

      notifications.value.push({
        read: false,
        config: notificationConfig,
      });
    };

    const clear = (): void => {
      notifications.value = [];
    };

    const deleteNotification = (notificationId: string): void => {
      notifications.value = notifications.value.filter(
        (notification) => notification.config.id !== notificationId,
      );
    };

    const markAsRead = (notificationId: string): void => {
      const notification = notifications.value.find(
        (notification) => notification.config.id === notificationId,
      );
      if (notification) {
        notification.read = true;
      }
    };

    return {
      notify,
      clear,
      delete: deleteNotification,
      markAsRead,
      notifications,
    };
  },
  {
    persist: true,
  },
);
