<template>
  <q-select
    class="language-select"
    v-model="locale"
    :options="localeOptions"
    :label="$t('pick language')"
    dense
    borderless
    emit-value
    map-options
    options-dense
  />
</template>

<!-- TODO: feat/settings delete  -->
<script setup lang="ts">
import { watch } from 'vue';
import { useSettingsStore } from 'src/stores/settings';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n({ useScope: 'global' });

const settingsStore = useSettingsStore();

watch(
  () => locale.value,
  (locale) => {
    settingsStore.setLocale(locale as string);
  }
);

const localeOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'ru-RU', label: 'Russian' },
];
</script>

<style lang="scss">
.language-select {
  width: 100%;
}
</style>
