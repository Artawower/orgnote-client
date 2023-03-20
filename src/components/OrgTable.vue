<template>
  <EasyDataTable :headers="headers" :items="items">
    <template
      v-for="h of headers"
      #[`item-${h.value}`]="slotProps"
      :key="h.value"
    >
      <ContentRenderer :node="slotProps[h.value]" />
    </template>
  </EasyDataTable>
</template>

<!-- TODO: check the other tables. This is a component of one of the lightweight libraries I have found. But it has some disadvantages.  -->
<script setup lang="ts">
import { ref } from 'vue';
import type { Header, Item } from 'vue3-easy-data-table';

import ContentRenderer from './ContentRenderer.vue';
import Vue3EasyDataTable from 'vue3-easy-data-table';
// elsint-disable-next-line @typescript-eslint/no-unused-vars
import 'vue3-easy-data-table/dist/style.css';
import { OrgNode } from 'org-mode-ast';

const EasyDataTable = Vue3EasyDataTable;

const props = defineProps<{
  node: OrgNode;
}>();

const rows = ref(props.node).value.children;
// TODO: master tmp. Need to respect marup within the header.
// const headers: Header[] = rows[0].children.map((children) => {
//   // TODO: master  need to replace any type casting. Cause some types don't have the property 'value'.
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const rawText = children.children.map((c) => (c as any).value).join('');
//   return {
//     value: rawText,
//     text: rawText,
//   };
// });
// 
// const items: Item[] = rows.slice(1, rows.length - 1).map((row) => {
//   const item = row.children.reduce<Item>((acc, c, i) => {
//     acc[headers[i].value] = c;
//     return acc;
//   }, {});
//   return item;
// });
</script>

<style lang="scss">
.raw-table {
  width: 100%;
}
</style>
