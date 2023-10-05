<template>
  <router-view />
</template>

<script lang="ts">
export default {
  name: 'App',
};
</script>

<script lang="ts" setup>
import { jsBabel } from './plugins/js-babel';
import { useOrgBabelStore, useSyncStore } from './stores';

const syncStore = useSyncStore();

syncStore.syncNotes();

// TODO: tmp place for register potential plugins.
// Will be moved into a separate file later.
const orgBabelStore = useOrgBabelStore();
orgBabelStore.register(jsBabel);

if (window.navigator.standalone) {
  document.body.classList.add('standalone');
}
</script>
