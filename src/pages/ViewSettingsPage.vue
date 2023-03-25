<template>
  <div class="col-12">
    <h4 class="text-h4">{{ $t('View settings') }}</h4>
    <q-toggle
      v-model="settingsStore.showUserProfiles"
      :label="$t('Show author profile info')"
    ></q-toggle>
  </div>
</template>


<script lang="ts" setup>
import { useSettingsStore } from 'src/stores/settings';
const settingsStore = useSettingsStore();
</script>
