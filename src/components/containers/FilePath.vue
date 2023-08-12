<template>
  <q-breadcrumbs class="text-italic color-secondary pointer">
    <template v-slot:separator>
      <q-icon size="1.5em" name="chevron_right" class="color-secondary" />
    </template>
    <q-breadcrumbs-el
      class="color-secondary"
      v-for="(q, i) in filePath"
      :label="i === filePath.length - 1 ? removeFileExtension(q) : q"
      v-bind:key="q"
      @click.stop.prevent="searchInFolder(q)"
    ></q-breadcrumbs-el>
  </q-breadcrumbs>
</template>

<script setup lang="ts">
import { toRef } from 'vue';

import { useNotifications } from 'src/hooks';
import { removeFileExtension } from 'src/tools';

const props = defineProps<{ filePath: string[] }>();
const filePath = toRef(props, 'filePath');

const notifications = useNotifications();
const searchInFolder = (folderName: string) =>
  notifications.notify(
    `This functionality is not implemented yet. You clicked on ${folderName}`
  );
</script>
