<template>
  <div class="full-width">
    <h4 class="text-h5 q-pb-lg text-capitalize">{{ $t('view settings') }}</h4>
    <q-toggle
      v-model="settingsStore.showUserProfiles"
      :label="$t('Show author profile info')"
    ></q-toggle>

    <q-select
      standout
      @update:model-value="setDarkMode"
      v-model="settings.darkMode"
      :options="darkModeOptions"
      label="Dark mode"
      emit-value
      map-options
    >
      <template v-slot:selected>
        <span v-if="(settings.darkMode as any) === 'auto'">System</span>
        <span v-else-if="settings.darkMode">Dark mode</span>
        <span v-else>Light mode</span>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useSettingsStore } from 'src/stores/settings';

const settingsStore = useSettingsStore();

const settings = storeToRefs(settingsStore);

const darkModeOptions = [
  { label: 'Light', value: false },
  { label: 'Dark', value: true },
  { label: 'System', value: 'auto' },
];

const setDarkMode = (value: boolean | 'auto') => {
  settingsStore.setDarkMode(value);
};
</script>
