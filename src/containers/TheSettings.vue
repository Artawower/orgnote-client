<template>
  <div class="settings">
    <visibility-wrapper condition="desktop-above">
      <div class="menu">
        <settings-menu />
      </div>
    </visibility-wrapper>
    <div class="content">
      <component :is="currentView" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import SettingsMenu from './SettingsMenu.vue';
import { SETTINGS_ROUTER_PROVIDER_TOKEN } from 'src/constants/app-providers';
import { RouteNames } from 'orgnote-api';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';

const props = withDefaults(
  defineProps<{
    initialRoute?: RouteNames;
  }>(),
  {
    initialRoute: RouteNames.SettingsPage,
  },
);

import { getCurrentInstance } from 'vue';
import { createSettingsRouter } from './modal-settings-routes';
const app = getCurrentInstance().appContext.app;
const settingsRouter = createSettingsRouter();

app.provide(SETTINGS_ROUTER_PROVIDER_TOKEN, settingsRouter);
settingsRouter.isReady();

const currentRoute = computed(() => settingsRouter.currentRoute.value);

const currentView = computed(() => {
  return currentRoute.value.matched[0]?.components?.default;
});

const navigate = (routeName: string) => {
  settingsRouter.push({ name: routeName });
};

navigate(props.initialRoute);
</script>

<style lang="scss" scoped>
.settings {
  @include flexify(row, flex-start, flex-start, var(--gap-lg));
  flex: 1;

  & > div {
    height: 100%;
    overflow-y: auto;
  }
}

.content {
  @include flexify(column, flex-start, flex-start, var(--gap-lg));
  flex: 1;
}
</style>
