<template>
  <easy-data-table
    class="org-table"
    :headers="headers"
    :items="items"
    hide-footer
    header-text-direction="left"
    body-text-direction="left"
  >
    <template v-for="h of headers" #[`header-${h.value}`]="slotProps" :key="h.value">
      <span class="header-text">
        {{ slotProps.value }}
        <q-tooltip :delay="200">
          <span class="color-reverse">{{ slotProps.value }}</span>
        </q-tooltip>
      </span>
    </template>
    <template v-for="h of headers" #[`item-${h.value}`]="slotProps" :key="h.value">
      <content-renderer :node="slotProps[h.value]" />
    </template>
  </easy-data-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NodeType, type OrgNode } from 'org-mode-ast';
import type { Header, Item } from 'vue3-easy-data-table';
// @ts-expect-error no types for default export
import EasyDataTable from 'vue3-easy-data-table';

import ContentRenderer from 'src/components/ContentRenderer.vue';

const props = defineProps<{
  node: OrgNode;
  nodeGetter?: () => OrgNode;
}>();

const currentNode = computed(() => props.nodeGetter?.() ?? props.node);

const headers = computed<Header[]>(() =>
  (currentNode.value.children?.first?.children ?? [])
    .filter((n: OrgNode) => n.is(NodeType.TableCell))
    .map((h: OrgNode) => {
      const rawText = h.rawValue;
      return {
        value: rawText,
        text: rawText,
      };
    }),
);

const items = computed<Item[]>(() =>
  (currentNode.value.children ?? [])
    .slice(1)
    .filter((n: OrgNode) => n.is(NodeType.TableRow))
    .map((row: OrgNode) => {
      const children = row.children ?? [];
      const item: Item = {};

      children
        .filter((n: OrgNode) => n.is(NodeType.TableCell))
        .forEach((c: OrgNode, i: number) => {
          if (i < headers.value.length) {
            item[headers.value[i]!.value] = c;
          }
        });

      return item;
    }),
);
</script>

<style lang="scss">
.org-table {
  --easy-table-border: var(--border-default);
  --easy-table-row-border: var(--border-default);

  --easy-table-header-font-size: 14px;
  --easy-table-header-font-color: var(--fg);
  --easy-table-header-background-color: var(--bg-secondary);
  --easy-table-header-item-padding: 10px 15px;

  --easy-table-body-row-font-size: 14px;
  --easy-table-body-row-font-color: var(--fg);
  --easy-table-body-row-background-color: var(--bg);
  --easy-table-body-row-hover-font-color: var(--fg);
  --easy-table-body-row-hover-background-color: var(--bg-hover);
  --easy-table-body-item-padding: 10px 15px;

  --easy-table-message-font-color: var(--fg-muted);

  td {
    min-width: 140px;
  }

  .header-text {
    @include line-limit(1);
    font-weight: var(--font-weight-bold);
  }
}

.org-embedded-table {
  display: block;
  width: 100%;
  overflow-x: auto;
}
</style>
