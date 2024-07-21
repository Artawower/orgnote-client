<template>
  <div class="settings-page">
    <div class="settings-menu">
      <navigation-header v-if="$q.platform.is.mobile" />
      <menu-group :group-config="commonSettings" />
      <menu-group :group-config="developerModeSettings" />
      <menu-group :group-config="sponsorsSettings" />
    </div>
    <div v-if="$q.platform.is.desktop" class="content">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth';
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup, { MenuGroupConfig } from 'src/components/ui/MenuGroup.vue';
import { getCssVar } from 'src/tools';
import { mockDesktop } from 'src/tools/mock-desktop';
import {
  GITHUB_LINK,
  PATREON_LINK,
  WIKI_LINK,
} from 'src/constants/external-links.contant';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';

const authStore = useAuthStore();

const router = useRouter();
const commonSettings: MenuGroupConfig = {
  items: [
    {
      label: 'system',
      iconBackgroundColor: getCssVar('base5'),
      icon: 'sym_o_settings',
      handler: () => router.push({ name: RouteNames.SystemSettings }),
    },
    {
      label: 'language',
      iconBackgroundColor: getCssVar('green'),
      icon: 'language',
      handler: () => router.push({ name: RouteNames.LanguageSettings }),
    },
    {
      label: 'interface',
      icon: 'sym_o_wallpaper',
      iconBackgroundColor: getCssVar('cyan'),
      handler: () => router.push({ name: RouteNames.InterfaceSettings }),
    },
    {
      label: 'synchronisation',
      icon: 'sym_o_sync',
      iconBackgroundColor: getCssVar('blue'),
      handler: () => router.push({ name: RouteNames.SynchronisationSettings }),
    },
  ],
};

mockDesktop(() => {
  commonSettings.items.push({
    label: 'keybindings',
    icon: 'keyboard',
    iconBackgroundColor: getCssVar('base5'),
  });
})();

const developerModeSettings: MenuGroupConfig = {
  items: [
    {
      label: 'developer',
      icon: 'sym_o_terminal',
      iconBackgroundColor: getCssVar('blue'),
      handler: () => router.push({ name: RouteNames.DeveloperSettings }),
    },
    {
      label: 'encryption',
      icon: 'sym_o_encrypted',
      iconBackgroundColor: getCssVar('red'),
      handler: () => router.push({ name: RouteNames.EncryptionSettings }),
    },
    {
      label: 'API',
      icon: 'sym_o_hub',
      iconBackgroundColor: getCssVar('yellow'),
      handler: () => router.push({ name: RouteNames.ApiSettings }),
    },
  ],
};

const sponsorsSettings: MenuGroupConfig = {
  items: [
    {
      label: 'source code',
      icon: 'fa-brands fa-github-alt',
      iconBackgroundColor: getCssVar('base4'),
      handler: () => window.open(GITHUB_LINK, '_blank'),
      disableNarrow: true,
    },
    {
      label: 'WIKI',
      icon: 'sym_o_help',
      iconBackgroundColor: getCssVar('yellow'),
      handler: () => window.open(WIKI_LINK, '_blank'),
      disableNarrow: true,
    },
    {
      label: 'sponsor',
      icon: 'sym_o_savings',
      iconBackgroundColor: getCssVar('green'),
      handler: () => window.open(PATREON_LINK, '_blank'),
      disableNarrow: true,
    },
  ],
};
</script>

<style lang="scss" scoped>
.settings-page {
  @include flexify(row, center, flex-start);
  width: 100%;
  height: calc(100% - var(--sidebar-width));
}

@include desktop {
  .settings-page {
    height: 100%;
  }
  .settings-menu {
    min-width: 300px;
    padding: var(--block-padding-md);
  }
}

@include mobile {
  .settings-menu {
    width: 100%;
  }
}

.content {
  width: 100%;
  padding: var(--block-padding-md);
  padding-left: 0;
}
</style>
