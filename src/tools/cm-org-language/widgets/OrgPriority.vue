<template>
  <span class="org-priority" :class="`org-priority-${priorityLevel}`">
    <q-icon :name="icon" size="sm"> </q-icon>
  </span>
</template>

<script lang="ts" setup>
const props = defineProps<{
  priority: string;
}>();

const icons: { [key: string]: string } = {
  '#A': 'looks_one',
  '#B': 'looks_two',
  '#C': 'looks_3',
  '#D': 'looks_4',
  '#E': 'looks_5',
  '#F': 'looks_6',
};

const icon = icons[props.priority.toUpperCase()];

const priorityLevel =
  (Object.keys(icons).indexOf(props.priority.toUpperCase()) ?? 0) + 1;
</script>

<style lang="scss" scoped>
.org-priority {
  position: relative;
  display: inline-block;
  bottom: 2px;
}
</style>
