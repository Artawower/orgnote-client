<template>
  <div class="settings-menu">
    <card-wrapper background="bg-alt2">
      <menu-item
        @click="navigateTo(RouteNames.SystemSettings)"
        icon="sym_o_settings"
        :active="isActive(RouteNames.SystemSettings)"
      >
        <div class="capitalize text-bold">{{ t(SYSTEM) }}</div>
      </menu-item>
      <menu-item
        @click="navigateTo(RouteNames.LanguageSettings)"
        icon="language"
        :active="isActive(RouteNames.LanguageSettings)"
      >
        <div class="capitalize">{{ t(LANGUAGE) }}</div>
      </menu-item>
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import { SYSTEM, LANGUAGE, RouteNames } from 'orgnote-api';
import { useI18n } from 'vue-i18n';
import { inject } from 'vue';
import type { Router } from 'vue-router';
import { SETTINGS_ROUTER_PROVIDER_TOKEN } from 'src/constants/app-providers';
import { useRouteActive } from 'src/composables/use-route-active';

const settingsRouter = inject<Router>(SETTINGS_ROUTER_PROVIDER_TOKEN);

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const { isActive } = useRouteActive(settingsRouter);

function navigateTo(name: string) {
  settingsRouter.push({ name });
}
</script>

<style lang="scss" scoped>
.card-wrapper {
  width: 100%;
}

.settings-menu {
  width: 420px;

  @include desktop-below {
    width: 100%;
  }
}
</style>
