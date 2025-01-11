<template>
  <router-view />
</template>

<script setup lang="ts">
import { useBodyClasses } from './composables/use-body-classes';

useBodyClasses();
</script>
