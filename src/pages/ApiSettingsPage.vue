<template>
  <navigation-page>
    <the-description
      text="this functionality is only available to registered users with an active subscription."
    />
    <menu-group :items="apiMenuItems" />
  </navigation-page>
</template>

<script lang="ts" setup>
import { copyToClipboard } from 'quasar';
import { ModelsAPIToken } from 'src/generated/api';
import { useSettingsStore } from 'src/stores/settings';
import NavigationPage from 'src/components/ui/NavigationPage.vue';
import TheDescription from 'src/components/ui/TheDescription.vue';

import { computed, ref, toRefs } from 'vue';

import { useAuthStore } from 'src/stores/auth';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import { watch } from 'vue';
import { getCssVar } from 'src/tools';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { useSystemInfoStore } from 'src/stores/system-info';

const settingsStore = useSettingsStore();
const { tokens } = toRefs(settingsStore);
settingsStore.getApiTokens();

const authStore = useAuthStore();
const systemInfoStore = useSystemInfoStore();

const copyToken = (token: ModelsAPIToken) => {
  copyToClipboard(token.token);
};

const apiMenuItems = ref<MenuItemProps[]>([]);

const initMenuitems = () => {
  const items: MenuItemProps[] = tokens.value.map<MenuItemProps>((token) => ({
    label: token.token,
    action: () => copyToken(token),
    popupMenuGroup: {
      items: [
        {
          label: 'copy',
          color: getCssVar('blue'),
          handler: () => copyToken(token),
          actionIcon: 'content_copy',
          activeActionIcon: 'done',
        },
        {
          label: 'delete',
          color: getCssVar('red'),
          handler: () => settingsStore.removeToken(token),
          actionIcon: 'delete',
        },
      ],
    },
  }));

  apiMenuItems.value = [
    ...items,
    {
      label: 'Create new token',
      handler: () => settingsStore.createNewToken(),
      color: getCssVar('blue'),
      disabled: computed(
        () =>
          authStore.user.isAnonymous ||
          (!authStore.user.active &&
            !systemInfoStore.systemInfo.environment?.selfHosted)
      ),
    },
  ];
};

watch(() => tokens.value, initMenuitems);

initMenuitems();
</script>

<style lang="scss">
.token-field {
  .action-btn,
  .delete-btn {
    position: relative;
    display: none;
  }
  &:hover {
    .action-btn,
    .delete-btn {
      display: flex;
    }
  }
}
</style>
