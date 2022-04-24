<template>
  <h3>{{ note.meta.title }}</h3>
</template>

<script setup lang="ts">
import { defineProps, toRefs } from 'vue';
import { Note } from 'second-brain-parser/dist/parser/models';

const props = defineProps<{
  note: Note;
}>();
const { note } = toRefs(props);
</script>
