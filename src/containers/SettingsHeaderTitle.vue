<template>
  <div class="settings-title">
    <visibility-wrapper condition="desktop-below">
      <navigation-history :router="settingsRouter" />
    </visibility-wrapper>
    <h1 class="title capitalize">
      {{ camelCaseToWords(currentRouteName) }}
    </h1>
  </div>
</template>

<script lang="ts" setup>
import NavigationHistory from 'src/components/NavigationHistory.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import { SETTINGS_ROUTER_PROVIDER_TOKEN } from 'src/constants/app-providers';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { computed, inject } from 'vue';
import type { Router } from 'vue-router';

const settingsRouter = inject<Router>(SETTINGS_ROUTER_PROVIDER_TOKEN);

const currentRouteName = computed(() => settingsRouter?.currentRoute.value?.name?.toString());
</script>

<style lang="scss" scoped>
.settings-title {
  @include flexify(row, flex-start, center, var(--gap-md));
}
</style>
