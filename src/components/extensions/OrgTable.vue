<template>
  <EasyDataTable class="raw-table" :headers="headers" :items="items">
    <template
      v-for="h of headers"
      #[`header-${h.value}`]="slotProps"
      :key="h.value"
    >
      <span class="header-text">
        {{ slotProps.value }}
        <q-tooltip :delay="200">
          <span class="color-reverse">{{ slotProps.value }}</span>
        </q-tooltip>
      </span>
    </template>
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

import ContentRenderer from 'src/components/ContentRenderer.vue';

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
  /* width: 100%;
 */
  --easy-table-header-background-color: var(--bg);
  --easy-table-header-font-color: var(--fg);
  --easy-table-body-row-background-color: var(--bg);
  --easy-table-body-row-font-color: var(--fg);
  --easy-table-body-row-hover-background-color: var(--bg-alt);
  --easy-table-footer-background-color: var(--bg-alt);
  --easy-table-footer-font-color: var(--fg);
  --easy-table-body-row-hover-font-color: var(--fg);
  --easy-table-row-border: 1px solid var(--base7);
  --easy-table-border: 1px solid var(--base7);
  --easy-table-message-font-color: var(--fg-alt);

  td {
    min-width: 140px;
  }

  .header-text {
    @include line-limit(1);
    text-align: left;
  }
}
</style>
