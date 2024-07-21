<template>
  <navigation-header />
  <div class="full-width">
    <settings-description
      text="this functionality is only available to registered users with an active subscription."
    />
    <menu-group :group-config="menu" />
  </div>
</template>

<script lang="ts" setup>
import { copyToClipboard } from 'quasar';
import { ModelsAPIToken } from 'src/generated/api';
import { useSettingsStore } from 'src/stores/settings';
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import SettingsDescription from 'src/components/ui/SettingsDescription.vue';

import { ref, toRefs } from 'vue';

import { useAuthStore } from 'src/stores/auth';
import MenuGroup, {
  MenuGroupConfig,
  MenuItem,
} from 'src/components/ui/MenuGroup.vue';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { getCssVar } from 'src/tools';

const settingsStore = useSettingsStore();
const { tokens } = toRefs(settingsStore);
settingsStore.getApiTokens();

const authStore = useAuthStore();

const copyToken = (token: ModelsAPIToken) => {
  copyToClipboard(token.token);
};

const { t } = useI18n();

const menu = ref<MenuGroupConfig>(null);

const initMenuitems = () => {
  const items: MenuItem[] = tokens.value.map<MenuItem>((token) => ({
    label: token.token,
    action: () => copyToken(token),
    disableNarrow: true,
    popupMenuGroup: {
      border: true,
      items: [
        {
          label: t('copy'),
          color: getCssVar('blue'),
          handler: () => copyToken(token),
          disableNarrow: true,
          actionIcon: 'content_copy',
          activeActionIcon: 'done',
        },
        {
          label: t('delete'),
          color: getCssVar('red'),
          handler: () => settingsStore.removeToken(token),
          disableNarrow: true,
          actionIcon: 'delete',
        },
      ],
    },
  }));

  menu.value = {
    items: [
      ...items,
      {
        label: t('Create new token'),
        handler: () => settingsStore.createNewToken(),
        color: getCssVar('blue'),
        disableNarrow: true,
        disabled: !authStore.user.active,
      },
    ],
  };
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
