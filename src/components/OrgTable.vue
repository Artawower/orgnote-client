<template>
  <EasyDataTable :headers="headers" :items="items">
    <template
      v-for="h of headers"
      #[`item-${h.value}`]="slotProps"
      :key="h.value"
    >
      <content-renderer :node="slotProps[h.value]" />
    </template>
  </EasyDataTable>
</template>

<!-- TODO: check the other tables. This is a component of one of the lightweight libraries I have found. But it has some disadvantages.  -->
<script setup lang="ts">
import { NodeType, OrgNode } from 'org-mode-ast';
import type { Header, Item } from 'vue3-easy-data-table';
import Vue3EasyDataTable from 'vue3-easy-data-table';
// elsint-disable-next-line @typescript-eslint/no-unused-vars
import 'vue3-easy-data-table/dist/style.css';

import ContentRenderer from './ContentRenderer.vue';

const EasyDataTable = Vue3EasyDataTable;

const props = defineProps<{
  node: OrgNode;
}>();

const headers: Header[] = props.node.children.first.children
  .filter((n) => n.is(NodeType.TableCell))
  .map((h) => {
    const rawText = h.rawValue;
    return {
      value: rawText,
      text: rawText,
    };
  });

const items: Item[] = props.node.children
  .slice(1)
  .filter((n) => n.is(NodeType.TableRow))
  .map((row) => {
    const item = row.children
      .filter((n) => n.is(NodeType.TableCell))
      .reduce<Item>((acc, c, i) => {
        if (!headers[i]) {
          // TODO: master tmp hack. Space at the end is not value.
          return acc;
        }
        acc[headers[i].value] = c;
        return acc;
      }, {});
    return item;
  });
</script>

<style lang="scss">
.raw-table {
  width: 100%;
}
</style>
