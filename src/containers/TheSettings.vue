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
import { computed, provide } from 'vue';
import { createSettingsRouter } from './modal-settings-routes';
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

const settingsRouter = createSettingsRouter();
settingsRouter.isReady();

provide(SETTINGS_ROUTER_PROVIDER_TOKEN, settingsRouter);
const currentRoute = computed(() => settingsRouter.currentRoute.value);

const currentView = computed(() => {
  return currentRoute.value.matched[0]?.components?.default;
});

settingsRouter.push({ name: props.initialRoute });
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
