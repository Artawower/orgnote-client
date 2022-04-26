<template>{{ content.value }}</template>

<script setup lang="ts">
import { Text } from 'uniorg';
import { toRef } from 'vue';

const props = defineProps<{
  content: Text;
}>();

const content = toRef(props, 'content');
</script>
