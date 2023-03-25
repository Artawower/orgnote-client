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

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { locale } = useI18n({ useScope: 'global' });

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
