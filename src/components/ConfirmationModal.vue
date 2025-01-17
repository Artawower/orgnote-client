<template>
  <h1>CONFIRM MOTHERFUCKER!</h1>
  <button @click="resolver(true)">ok</button>
  <button @click="resolver(false)">not ok</button>
</template>

<script lang="ts" setup>
import type { ConfirmationModalParams } from 'orgnote-api';
defineProps<
  {
    resolver: (data?: boolean) => void;
  } & ConfirmationModalParams
>();
</script>
