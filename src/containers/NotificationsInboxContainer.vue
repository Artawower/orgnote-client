<template>
  <safe-area fit>
    <container-layout gap="lg">
      <app-flex column v-if="notifications.length > 0" gap="md">
        <app-notification
          v-for="(notification, index) in notifications"
          :key="`${notification.config.id}-${notification.createdAt}-${index}`"
          :icon="notification.icon"
          :type="notification.config.level ?? 'plain'"
          :message="notification.config.message"
          :caption="notification.config.description"
          :count="notification.count"
          :unread="!notification.readAt"
          flat
          clickable
          @click="handleMarkAsRead(notification.config.id)"
          @close="handleDelete(notification.config.id)"
        />
      </app-flex>

      <empty-state v-else :title="t(I18N.NO_NOTIFICATIONS)" icon="sym_o_notifications" />

      <template v-if="notifications.length" #footer>
        <card-wrapper>
          <menu-item type="warning" @click="clearAll">
            {{ t(I18N.CLEAR_ALL_NOTIFICATIONS) }}
          </menu-item>
        </card-wrapper>
      </template>
    </container-layout>
  </safe-area>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { I18N } from 'orgnote-api';
import { api } from 'src/boot/api';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from 'src/containers/MenuItem.vue';
import SafeArea from 'src/components/SafeArea.vue';
import EmptyState from 'src/components/EmptyState.vue';
import AppNotification from 'src/components/AppNotification.vue';
import AppFlex from 'src/components/AppFlex.vue';
import { useI18n } from 'vue-i18n';

const notificationsStore = api.core.useNotifications();
const { notifications } = storeToRefs(notificationsStore);

const handleDelete = (id?: string): void => {
  if (!id) return;
  notificationsStore.delete(id);
};

const handleMarkAsRead = (id?: string): void => {
  if (!id) return;
  notificationsStore.markAsRead(id);
};

const clearAll = (): void => {
  notificationsStore.clear();
};

const markAllAsRead = (): void => {
  notifications.value
    .filter((n) => !n.readAt)
    .forEach((n) => handleMarkAsRead(n.config.id));
};

onMounted(markAllAsRead);

const { t } = useI18n();
</script>
