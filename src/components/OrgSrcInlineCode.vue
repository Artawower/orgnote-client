<template>
  <code class="inline-code" :class="darkMode ? 'dark' : 'light'">
    <content-renderer v-for="(n, i) of node.children" :node="n" :key="i" />
  </code>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import ContentRenderer from '@/components/ContentRenderer.vue';
import { toRef } from 'vue';
import { OrgNode } from 'org-mode-ast';

const props = defineProps<{
  node: OrgNode;
}>();

const $q = useQuasar();

const darkMode = toRef($q.dark, 'isActive');

const node = toRef(props, 'node');
</script>

<style lang="scss">
.inline-code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  border-radius: 6px;

  &.dark {
    background-color: rgba(99, 110, 123, 0.4);
    color: rgb(173, 186, 199);
  }

  &.light {
    background-color: var(--inline-code-background);
    color: var(--inline-code-font-color);
  }
}
</style>
