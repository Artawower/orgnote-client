<template>
  <div class="settings">
    <visibility-wrapper condition="desktop-above">
      <div class="menu">
        <settings-menu />
      </div>
    </visibility-wrapper>
    <div class="content">
      <component :is="currentView" />
      <!-- <settings-scheme
             v-for="(scheme, name) of configScheme.entries"
             :key="name"
             :scheme="scheme"
             :name="name"
             :path="name"
             /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted } from 'vue';
import SettingsMenu from './SettingsMenu.vue';
import { SETTINGS_ROUTER_PROVIDER_TOKEN } from 'src/constants/app-providers';
import { DefaultCommands, RouteNames } from 'orgnote-api';
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
import { api } from 'src/boot/api';
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

const commandsStore = api.core.useCommands();

const routeByCommands: Record<string, string> = {
  [DefaultCommands.SYSTEM_SETTINGS]: RouteNames.SettingsPage,
  [DefaultCommands.LANGUAGE_SETTINGS]: RouteNames.LanguageSettings,
};

const unsubscribe = commandsStore.afterExecute(
  [DefaultCommands.SYSTEM_SETTINGS, DefaultCommands.LANGUAGE_SETTINGS],
  (meta) => {
    const routeName = routeByCommands[meta.command];
    settingsRouter.push({ name: routeName });
  },
);

onUnmounted(() => {
  unsubscribe();
});
</script>

<style lang="scss" scoped>
.settings {
  @include flexify(row, flex-start, flex-start, var(--gap-lg));
  flex: 1;
}

.content {
  @include flexify(column, flex-start, flex-start, var(--gap-lg));
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
</style>
