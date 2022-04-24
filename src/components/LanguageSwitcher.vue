<template>
  <q-select
    v-model="locale"
    :options="localeOptions"
    label="Pick language"
    dense
    borderless
    emit-value
    map-options
    options-dense
    style="min-width: 150px"
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
