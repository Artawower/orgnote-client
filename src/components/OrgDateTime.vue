<template>
  <dynamic-tooltip position="bottom">
    <template v-slot:content>
      <span class="org-date" :class="{ expired }"> {{ node.rawValue }} </span>
    </template>
    <template v-slot:tooltip>
      <q-date
        v-model="rawDate"
        landscape
        flat
        :readonly="readonly"
        format-md
        mask="YYYY-MM-DD ddd"
      />
    </template>
  </dynamic-tooltip>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';

import { computed, ref, watch } from 'vue';

import DynamicTooltip from './ui/DynamicTooltip.vue';

const props = defineProps<{
  node: OrgNode;
  rootNodeSrc: () => OrgNode;
  readonly?: boolean;
}>();

const emits = defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const rawDate = ref<string | undefined>(props.node.children.get(1).rawValue);

watch(
  () => rawDate.value,
  () => updateOrgDoc()
);
const updateOrgDoc = () => {
  emits('update', `<${rawDate.value}>`);
};

const date = computed(() => new Date(rawDate.value.split(' ')[0]));
const expired = computed(() => new Date() > new Date(date.value));
</script>

<style lang="scss" scoped>
.org-date {
  color: var(--yellow);
  font-weight: 500;
  cursor: pointer;

  &.expired {
    color: var(--red);
  }
}
</style>
