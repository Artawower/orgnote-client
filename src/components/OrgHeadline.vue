<template>
  <component :is="'h' + content.level">{{ content.rawValue }}</component>
</template>

<script setup lang="ts">
import { Headline } from 'uniorg';
import { toRef } from 'vue';

const props = defineProps<{
  content: Headline;
}>();

const content = toRef(props, 'content');
</script>
