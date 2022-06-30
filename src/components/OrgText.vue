<template>{{ content.value }}</template>

<script setup lang="ts">
import { Text } from 'uniorg';
import { toRef } from 'vue';

const props = defineProps<{
  content: Text;
  headlineFolding?: boolean;
}>();

const content = toRef(props, 'content');
</script>
