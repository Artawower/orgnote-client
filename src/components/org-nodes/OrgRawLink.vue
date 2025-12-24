<template>
  <app-link :href="linkAddress" class="org-raw-link">
    {{ shortLink }}
  </app-link>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import { computed, toRef } from 'vue';
import AppLink from 'src/components/AppLink.vue';

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
