<template>
  <router-view />
</template>

<script lang="ts">
export default {
  name: 'App',
};
</script>

<script lang="ts" setup>
import { useSyncStore } from './stores';

const syncStore = useSyncStore();

syncStore.syncNotes();
</script>
