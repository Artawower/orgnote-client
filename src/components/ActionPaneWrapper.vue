<template>
  <slot />
</template>

<script lang="ts" setup>
import { useBodyActionPaneClass } from 'src/hooks';

useBodyActionPaneClass();
</script>
