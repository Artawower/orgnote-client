<template>
  <EasyDataTable :headers="headers" :items="items">
    <template v-for="h of headers" v-slot:[h.value]="props" :key="h.value">
      <ContentRenderer :content="props[h.value]" />
    </template>
  </EasyDataTable>
</template>

<!-- TODO: check the other tables. This is a component of one of the lightweight libraries I have found. But it has some disadvantages.  -->
<script setup lang="ts">
import { TableOrg } from 'uniorg';
import { ref } from 'vue';
import type { Header, Item } from 'vue3-easy-data-table';

import ContentRenderer from './ContentRenderer.vue';
import Vue3EasyDataTable from 'vue3-easy-data-table';
// elsint-disable-next-line @typescript-eslint/no-unused-vars
import 'vue3-easy-data-table/dist/style.css';

const EasyDataTable = Vue3EasyDataTable;

const props = defineProps<{
  content: TableOrg;
}>();

const rows = ref(props.content).value.children;
// TODO: master tmp. Need to respect marup within the header.
const headers: Header[] = rows[0].children.map((children) => {
  // TODO: master  need to replace any type casting. Cause some types don't have the property 'value'.
  const rawText = children.children.map((c) => (c as any).value).join(' ');
  return {
    value: rawText,
    text: rawText,
  };
});

const items: Item[] = rows.slice(1, rows.length - 1).map((row) => {
  const item = row.children.reduce<Item>((acc, c, i) => {
    acc[headers[i].value] = c;
    return acc;
  }, {});
  return item;
});
console.log(items);
</script>

<style lang="scss">
.raw-table {
  width: 100%;
}
</style>
