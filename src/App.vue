<template>
  <router-view />
</template>

<script setup lang="ts">
import { api } from './boot/api';
import { useBodyClasses } from './composables/use-body-classes';
import { useViewportInfo } from './composables/use-viewport-info';

api.ui.useBackgroundSettings().setBackground();
useBodyClasses();
useViewportInfo();
</script>
