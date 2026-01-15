<template>
  <div class="notifications-wrapper">
    <NotificationGroup :group="NOTIFICATION_GROUP">
      <app-flex column gap="var(--notification-container-gap)" class="notifications-container">
        <Notification
          v-slot="{ notifications, close, hovering }"
          :max-notifications="maxNotifications"
          enter="notification-enter"
          enter-from="notification-enter-from"
          enter-to="notification-enter-to"
          leave="notification-leave"
          leave-from="notification-leave-from"
          leave-to="notification-leave-to"
        >
          <app-flex
            v-for="notification in groupByKey(notifications)"
            :key="notification.id"
            gap="sm"
            align-center
            class="notification-item"
            :class="[
              `notification-${notification.type ?? 'info'}`,
              { clickable: !!notification.onClick },
            ]"
            @click="notification.onClick?.()"
            @mouseenter="hovering(notification.id, true)"
            @mouseleave="hovering(notification.id, false)"
          >
            <app-icon
              v-if="getNotificationIcon(notification)"
              :name="getNotificationIcon(notification)"
              :color="getNotificationIconColor(notification)"
              size="sm"
            />
            <app-flex column start align-start gap="xs" class="notification-content">
              <span class="notification-message">
                <span v-html-safe="notification.title"></span>
                <app-badge
                  v-if="notification.count && notification.count > 1"
                  :label="String(notification.count)"
                  size="xs"
                  rounded
                  class="notification-badge"
                />
              </span>
              <span v-if="notification.text" class="notification-caption">
                {{ notification.text }}
              </span>
            </app-flex>
            <action-button
              v-if="notification.closable !== false"
              icon="close"
              size="xs"
              class="notification-close"
              @click.stop="close(notification.id)"
            />
          </app-flex>
        </Notification>
      </app-flex>
    </NotificationGroup>
  </div>
</template>

<script setup lang="ts">
import type { ThemeVariable } from 'orgnote-api';
import { NotificationGroup, Notification } from 'notiwind';
import ActionButton from './ActionButton.vue';
import AppBadge from './AppBadge.vue';
import AppFlex from './AppFlex.vue';
import AppIcon from './AppIcon.vue';
import { STYLE_VARIANT_ICONS } from 'src/constants/style-variant-icons';
import { CARD_TYPE_TO_BACKGROUND } from 'src/constants/card-type-to-background';
import { NOTIFICATION_GROUP } from 'src/constants/notifications';

withDefaults(
  defineProps<{
    maxNotifications?: number;
  }>(),
  {
    maxNotifications: 5,
  },
);

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

const getNotificationIcon = (notification: NotiwindNotification): string | undefined => {
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

const groupByKey = (notifications: NotiwindNotification[]): NotiwindNotification[] => {
  const seen = notifications.reduce((acc, n) => {
    const key = n.groupKey ?? `${n.id}`;
    const existing = acc.get(key);

    if (!existing) {
      acc.set(key, { ...n });
      return acc;
    }

    existing.count = n.count;
    return acc;
  }, new Map<string, NotiwindNotification>());

  return Array.from(seen.values());
};
</script>

<style lang="scss" scoped>
.notifications-container {
  position: fixed;
  top: calc(var(--safe-area-top) + var(--notification-container-top));
  right: var(--notification-container-right);
  bottom: var(--notification-container-bottom);
  left: var(--notification-container-left);
  z-index: var(--notification-z-index);
  max-width: var(--notification-max-width);
  pointer-events: none;
}

.notification-item {
  padding: var(--notification-padding);
  border-radius: var(--notification-radius);
  background: var(--notification-bg);
  color: var(--notification-fg);
  border: var(--notification-border);
  box-shadow: var(--notification-shadow);
  max-width: var(--notification-max-width);
  pointer-events: auto;
  width: 100%;
  min-width: var(--notification-min-width);

  &.clickable {
    cursor: pointer;
    transition: filter 0.2s;

    &:hover {
      filter: brightness(1.1);
    }
  }
}

@include for-each-view-type using ($type, $color) {
  .notification-#{$type} {
    background: color-mix(in srgb, $color, var(--bg) 80%);
    color: var(--fg);
    border-color: $color;
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: var(--notification-message-font-size);
  font-weight: var(--notification-message-font-weight);
}

.notification-caption {
  font-size: var(--notification-caption-font-size);
  opacity: var(--notification-caption-opacity);
}

.notification-close {
  opacity: var(--notification-close-opacity);
}

.notification-enter {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.notification-leave {
  transition: all 0.3s ease;
}

.notification-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
