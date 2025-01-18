<template>
  <h1>CONFIRM MOTHERFUCKER!</h1>
  <app-button @click="resolver(true)" type="danger">ok</app-button>
  <app-button @click="resolver(false)" type="info">not ok</app-button>
</template>

<script lang="ts" setup>
import type { ConfirmationModalParams } from 'orgnote-api';
import AppButton from './AppButton.vue';
defineProps<
  {
    resolver: (data?: boolean) => void;
  } & ConfirmationModalParams
>();
</script>
