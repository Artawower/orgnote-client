<template>
  <q-checkbox dense v-model="checkboxValue"></q-checkbox>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';

import { ref, watch } from 'vue';

const props = defineProps<{ node: OrgNode }>();
const emits = defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const checkboxValue = ref<boolean>(props.node.checked);

watch(
  () => checkboxValue.value,
  (newValue) => {
    const newVal = `[${newValue ? 'X' : ' '}]`;
    emits('update', newVal);
  }
);
</script>
