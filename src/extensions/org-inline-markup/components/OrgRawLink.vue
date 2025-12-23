<template>
  <a :href="linkAddress" target="_blank" class="org-raw-link">
    {{ shortLink }}
  </a>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import { computed, toRef } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');
const linkAddress = computed(() => node.value.value);

const shortLink = computed(() => {
  try {
    const url = new URL(linkAddress.value);
    return url.hostname;
  } catch {
    return linkAddress.value;
  }
});
</script>

<style lang="scss" scoped>
.org-raw-link {
  color: var(--fg);
  text-decoration: underline;
}
</style>
