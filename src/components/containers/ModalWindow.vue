<template>
  <q-dialog v-model="modalStore.opened" :maximized="$q.screen.lt.sm">
    <modal-container>
      <template v-if="modalStore.title" #title>{{
        $t(modalStore.title)
      }}</template>
      <template #content>
        <component :is="modalStore.component" />
      </template>
    </modal-container>
  </q-dialog>
</template>

<script lang="ts" setup>

import ModalContainer from 'src/components/ui/ModalContainer.vue';
import { useModalStore } from 'src/stores/modal';

const modalStore = useModalStore();
</script>
