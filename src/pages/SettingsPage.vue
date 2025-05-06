<template>
  <div class="settings-page">
    <div class="settings-menu">
      <navigation-header v-if="$q.platform.is.mobile" />
      <div class="menu-items">
        <menu-group :items="commonSettingsItems" />
        <menu-group :items="developerModeSettings" />
        <menu-group :items="externalResourcesItems" />
      </div>
    </div>
    <div v-if="$q.platform.is.desktop" class="content">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import { getCssVar } from 'src/tools';
import { mockDesktop } from 'src/tools/mock-desktop';
import {
  GITHUB_LINK,
  PATREON_LINK,
  WIKI_LINK,
} from 'src/constants/external-links.contant';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { computed } from 'vue';
import { useSystemInfoStore } from 'src/stores/system-info';
import { storeToRefs } from 'pinia';

const router = useRouter();
const visibleCommonSettingsItems: MenuItemProps[] = [
  {
    label: 'system',
    iconBackgroundColor: getCssVar('base5'),
    icon: 'sym_o_settings',
    handler: () => router.push({ name: RouteNames.SystemSettings }),
    narrow: true,
  },
  {
    label: 'language',
    iconBackgroundColor: getCssVar('green'),
    icon: 'language',
    handler: () => router.push({ name: RouteNames.LanguageSettings }),
    narrow: true,
  },
  {
    label: 'interface',
    icon: 'sym_o_wallpaper',
    iconBackgroundColor: getCssVar('cyan'),
    handler: () => router.push({ name: RouteNames.InterfaceSettings }),
    narrow: true,
  },
  {
    label: 'synchronisation',
    icon: 'sym_o_sync',
    iconBackgroundColor: getCssVar('blue'),
    handler: () => router.push({ name: RouteNames.SynchronisationSettings }),
    narrow: true,
  },
];

const { systemInfo } = storeToRefs(useSystemInfoStore());

const commonSettingsItems = computed<MenuItemProps[]>(() => {
  const resultItems = [...visibleCommonSettingsItems];

  mockDesktop(() => {
    resultItems.push({
      label: 'keybindings',
      icon: 'keyboard',
      narrow: true,
      iconBackgroundColor: getCssVar('base5'),
      handler: () => router.push({ name: RouteNames.KeybindingSettings }),
    });
  })();

  if (!systemInfo.value?.environment?.selfHosted) {
    resultItems.push({
      label: 'subscription',
      icon: 'sym_o_loyalty',
      iconBackgroundColor: getCssVar('green'),
      handler: () => router.push({ name: RouteNames.SubscriptionSettings }),
      narrow: true,
    });
  }

  return resultItems;
});

const developerModeSettings: MenuItemProps[] = [
  {
    label: 'developer',
    icon: 'sym_o_terminal',
    iconBackgroundColor: getCssVar('blue'),
    narrow: true,
    handler: () => router.push({ name: RouteNames.DeveloperSettings }),
  },
  {
    label: 'extensions',
    icon: 'sym_o_extension',
    iconBackgroundColor: getCssVar('magenta'),
    narrow: true,
    handler: () => router.push({ name: RouteNames.ExtensionsSettings }),
  },
  {
    label: 'encryption',
    icon: 'sym_o_encrypted',
    iconBackgroundColor: getCssVar('red'),
    handler: () => router.push({ name: RouteNames.EncryptionSettings }),
    narrow: true,
  },
  {
    label: 'API',
    icon: 'sym_o_hub',
    iconBackgroundColor: getCssVar('yellow'),
    handler: () => router.push({ name: RouteNames.ApiSettings }),
    narrow: true,
  },
];

const externalResourcesItems: MenuItemProps[] = [
  {
    label: 'source code',
    icon: 'fa-brands fa-github-alt',
    iconBackgroundColor: getCssVar('base4'),
    handler: () => window.open(GITHUB_LINK, '_blank'),
  },
  {
    label: 'WIKI',
    icon: 'sym_o_help',
    iconBackgroundColor: getCssVar('yellow'),
    handler: () => window.open(WIKI_LINK, '_blank'),
  },
  {
    label: 'sponsor',
    icon: 'sym_o_savings',
    iconBackgroundColor: getCssVar('green'),
    handler: () => window.open(PATREON_LINK, '_blank'),
  },
];
</script>

<style lang="scss" scoped>
.settings-page {
  @include flexify(row, center, flex-start);
}

@include desktop {
  .settings-menu {
    min-width: 300px;
  }
}

@include mobile {
  .settings-menu {
    width: 100%;
  }
}

.content {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.menu-items {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--block-padding-md);
  padding: var(--block-padding-md);

  @include mobile-footer-padding;
}
</style>
