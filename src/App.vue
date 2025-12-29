<template>
  <router-view />
</template>
<script setup lang="ts">
import { api } from './boot/api';
import { useBodyClasses } from './composables/use-body-classes';
import { useViewportBehavior } from './composables/use-viewport-behavior';
import { useUrlCommandHandler } from './composables/use-url-command-handler';

api.ui.useBackgroundSettings().setBackground();
useBodyClasses();
useViewportBehavior();
useUrlCommandHandler();
</script>
