<template>
  <div class="settings">
    <div class="menu">
      <settings-menu />
    </div>
    <div class="content">
      <settings-scheme
        v-for="(scheme, name) of configScheme.entries"
        :key="name"
        :scheme="scheme"
        :name="name"
        :path="name"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ORG_NOTE_CONFIG_SCHEMA } from 'orgnote-api';
import SettingsScheme from './SettingsScheme.vue';
import SettingsMenu from './SettingsMenu.vue';
// import { storeToRefs } from 'pinia';
// import { api } from 'src/boot/api';

// const { config } = storeToRefs(api.core.useSettings());
const configScheme = ORG_NOTE_CONFIG_SCHEMA;
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
.menu {
  /* padding-top: 54px; */
}
</style>
