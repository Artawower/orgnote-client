<template>
  <modal-dialog v-if="activeModal" :key="activeModal.id" :modal-data="activeModal" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import ModalDialog from './ModalDialog.vue';

const { modals } = storeToRefs(api.ui.useModal());

const activeModal = computed(() => modals.value[modals.value.length - 1]);
</script>
