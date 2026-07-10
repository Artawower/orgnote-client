<template>
  <notifications-list
    :max-notifications="maxNotifications"
    :get-notification-icon="getNotificationIcon"
    :get-notification-title="getNotificationTitle"
    :get-notification-text="getNotificationText"
    :get-notification-count="getNotificationCount"
    :get-notification-icon-color="getNotificationIconColor"
  />
</template>

<script setup lang="ts">
import type { NotificationConfig, ThemeVariable, Notification } from 'orgnote-api';
import { api } from 'src/boot/api';
import NotificationsList from 'src/components/NotificationsList.vue';
import { STYLE_VARIANT_ICONS } from 'src/constants/style-variant-icons';
import { CARD_TYPE_TO_BACKGROUND } from 'src/constants/card-type-to-background';

withDefaults(
  defineProps<{
    maxNotifications?: number;
  }>(),
  {
    maxNotifications: 5,
  },
);

const notificationsStore = api.core.useNotifications();

interface NotiwindNotification {
  id: number;
  group: string;
  title?: string;
  text?: string;
  type?: string;
  count?: number;
  groupKey?: string;
  closable?: boolean;
  icon?: string;
  iconEnabled?: boolean;
  onClick?: () => void;
  [key: string]: unknown;
}

const getStoreNotification = (groupKey: string | undefined): Notification | undefined => {
  if (!groupKey) return undefined;
  return notificationsStore.notifications.find(
    (notification) => notification.config.id === groupKey,
  );
};

const getStoreConfig = (groupKey: string | undefined): NotificationConfig | undefined =>
  getStoreNotification(groupKey)?.config;

const getNotificationIcon = (notification: NotiwindNotification): string | undefined => {
  const storeConfig = getStoreConfig(notification.groupKey);
  if (storeConfig?.icon) return storeConfig.icon;
  if (notification.icon) return notification.icon;
  if (!notification.iconEnabled) return undefined;
  const type = (notification.type ?? 'info') as keyof typeof STYLE_VARIANT_ICONS;
  return STYLE_VARIANT_ICONS[type];
};

const getNotificationIconColor = (
  notification: NotiwindNotification,
): ThemeVariable | undefined => {
  const type = (notification.type ?? 'info') as keyof typeof CARD_TYPE_TO_BACKGROUND;
  return CARD_TYPE_TO_BACKGROUND[type];
};

const getNotificationTitle = (notification: NotiwindNotification): string => {
  const storeConfig = getStoreConfig(notification.groupKey);
  return storeConfig?.message ?? notification.title ?? '';
};

const getNotificationText = (notification: NotiwindNotification): string | undefined => {
  const storeConfig = getStoreConfig(notification.groupKey);
  return storeConfig?.description ?? notification.text;
};

const getNotificationCount = (notification: NotiwindNotification): number | undefined =>
  getStoreNotification(notification.groupKey)?.count ?? notification.count;
</script>
