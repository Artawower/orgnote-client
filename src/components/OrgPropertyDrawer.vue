<template>
  {{ content.children }}
</template>

<!-- TODO: master tmp doesn't need for public view -->
<script lang="ts" setup>
import { PropertyDrawer } from 'uniorg';

const props = defineProps<{
  content: PropertyDrawer;
}>();

console.log(props);
</script>
