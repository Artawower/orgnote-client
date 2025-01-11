<template>
  <router-view />
</template>

<script setup lang="ts">
import { api } from './boot/api';
import { useBodyClasses } from './composables/use-body-classes';

api.ui.useBackgroundSettings().setBackground();
useBodyClasses();
</script>
