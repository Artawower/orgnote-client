<template>
  <settings-scheme :entries="extensionsEntries" path="extensions"></settings-scheme>
</template>

<script lang="ts" setup>
import { ORG_NOTE_CONFIG_SCHEMA } from 'orgnote-api';
import SettingsScheme from './SettingsScheme.vue';

const extensionsEntries = { ...ORG_NOTE_CONFIG_SCHEMA.entries.extensions.entries };
</script>
