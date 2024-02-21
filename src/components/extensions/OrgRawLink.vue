<template>
  <a :href="linkAddress" target="_blank" class="org-raw-link">
    {{ shortLink }}
  </a>
</template>

<script setup lang="ts">
// TODO: master Write extension to minify raw links (right now it's so bulky)
import { OrgNode } from 'org-mode-ast';

import { computed, toRef } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');

const linkAddress = node.value.value;

const shortLink = computed(() => {
  const url = new URL(linkAddress);
  return url.hostname;
});
</script>

<style lang="scss" scoped>
.org-image {
  width: 100%;
  height: auto;
  cursor: pointer;
}

.preview-tooltip {
  padding: 0;
}

.image-preview {
  max-width: 100% !important;
}
.raw-link {
  line-break: anywhere;
}

.org-raw-link {
  color: var(--fg);
  text-decoration: underline;
}
</style>
