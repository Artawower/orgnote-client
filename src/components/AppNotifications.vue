<template>
  <div class="notifications-wrapper">
    <NotificationGroup group="main">
      <app-flex column gap="var(--notification-container-gap)" class="notifications-container">
        <Notification
          v-slot="{ notifications, close }"
          :max-notifications="maxNotifications"
          enter="notification-enter"
          enter-from="notification-enter-from"
          enter-to="notification-enter-to"
          leave="notification-leave"
          leave-from="notification-leave-from"
          leave-to="notification-leave-to"
        >
          <app-flex
            v-for="notification in groupedNotifications(notifications)"
            :key="notification.id"
            gap="sm"
            align-center
            class="notification-item"
            :class="[
              `notification-${notification.type ?? 'info'}`,
              { clickable: !!notification.onClick },
            ]"
            @click="notification.onClick?.()"
          >
            <app-icon
              v-if="getNotificationIcon(notification)"
              :name="getNotificationIcon(notification)"
              :color="getNotificationIconColor(notification)"
              size="sm"
            />
            <app-flex column start align-start gap="xs" class="notification-content">
              <span class="notification-message">
                {{ notification.title }}
                <span
                  v-if="notification.count && notification.count > 1"
                  class="notification-badge"
                >
                  {{ notification.count }}
                </span>
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
              @click="close(notification.id as number)"
            />
          </app-flex>
        </Notification>
      </app-flex>
    </NotificationGroup>
  </div>
</template>

<script setup lang="ts">
import { NotificationGroup, Notification } from 'notiwind';
import ActionButton from './ActionButton.vue';
import AppFlex from './AppFlex.vue';
import AppIcon from './AppIcon.vue';
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

const getNotificationIconColor = (notification: NotiwindNotification) => {
  const type = (notification.type ?? 'info') as keyof typeof CARD_TYPE_TO_BACKGROUND;
  return CARD_TYPE_TO_BACKGROUND[type];
};

const groupedNotifications = (notifications: NotiwindNotification[]): NotiwindNotification[] => {
  const seen = new Map<string, NotiwindNotification>();

  for (const n of notifications) {
    if (!n.groupKey) {
      seen.set(String(n.id), n);
      continue;
    }

    const existing = seen.get(n.groupKey);
    if (existing) {
      existing.count = n.count;
    } else {
      seen.set(n.groupKey, { ...n });
    }
  }

  return Array.from(seen.values());
};
</script>

<style lang="scss" scoped>
.notifications-container {
  position: fixed;
  top: var(--notification-container-top);
  right: var(--notification-container-right);
  bottom: var(--notification-container-bottom);
  left: var(--notification-container-left);
  z-index: var(--notification-z-index);
  max-width: var(--notification-max-width);
  pointer-events: none;
}

.notification-item {
  padding: var(--notification-padding);
  border-radius: var(--notification-border-radius);
  background: var(--notification-bg);
  color: var(--notification-color);
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

.notification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--notification-badge-size);
  height: var(--notification-badge-size);
  padding: 0 var(--notification-badge-padding);
  margin-left: var(--notification-badge-margin);
  font-size: var(--notification-badge-font-size);
  font-weight: var(--notification-badge-font-weight);
  background: var(--notification-badge-bg);
  color: var(--notification-badge-color);
  border-radius: var(--notification-badge-radius);
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
