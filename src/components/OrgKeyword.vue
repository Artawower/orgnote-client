<template>
  {{ content.value }}
</template>

<!-- TODO: master tmp doesn't need for public view -->
<script lang="ts" setup>
import { Keyword } from 'uniorg';
import { toRefs } from 'vue';

const props = defineProps<{
  content: Keyword;
}>();

const { content } = toRefs(props);
</script>
