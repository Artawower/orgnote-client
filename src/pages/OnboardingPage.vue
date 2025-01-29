<template>
  <page-wrapper padding>
    <storage-settings />
  </page-wrapper>
  <modal-window />
</template>

<script lang="ts" setup>
import PageWrapper from 'src/components/PageWrapper.vue';
import ModalWindow from 'src/containers/ModalWindow.vue';
import StorageSettings from 'src/containers/StorageSettings.vue';
</script>
