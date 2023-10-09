<template>
  <q-page>
    <div class="fit flex items-center justify-center">
      <loader-spinner v-if="creating" />
      <div
        v-else-if="!notesStore.total"
        @click="createFirstNote"
        class="flex column items-center gap-8 pointer"
        role="button"
      >
        <h3 class="color-secondary capitalize">
          {{ $t('create your first note') }}
        </h3>
        <q-icon class="color-secondary" name="add" size="lg"></q-icon>
      </div>
      <h3 v-else class="color-secondary">Dashboard</h3>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useFileManagerStore, useNotesStore } from 'src/stores';

import { ref } from 'vue';

import LoaderSpinner from 'src/components/LoaderSpinner.vue';

const notesStore = useNotesStore();

const fileManagerStore = useFileManagerStore();
notesStore.loadTotal();

const creating = ref<boolean>();
const createFirstNote = async () => {
  creating.value = true;
  await fileManagerStore.createFile();
};
</script>

<style lang="scss"></style>
