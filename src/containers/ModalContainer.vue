<template>
  <animation-wrapper v-for="m of modals" :key="m.id">
    <modal-dialog :modal-data="m" />
  </animation-wrapper>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import AnimationWrapper from 'src/components/AnimationWrapper.vue';
import ModalDialog from './ModalDialog.vue';

const { modals } = storeToRefs(api.ui.useModal());
</script>


