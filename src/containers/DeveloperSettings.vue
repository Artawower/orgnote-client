<template>
  <settings-scheme :entries="developmentEntries" path="developer"></settings-scheme>
</template>

<script lang="ts" setup>
import { ORG_NOTE_CONFIG_SCHEMA } from 'orgnote-api';
import SettingsScheme from './SettingsScheme.vue';

const developmentEntries = { ...ORG_NOTE_CONFIG_SCHEMA.entries.developer.entries };
</script>
