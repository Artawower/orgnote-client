<template>
  <a :href="linkAddress" target="_blank" class="raw-link">
    {{ linkAddress }}
  </a>
</template>

<script setup lang="ts">
// TODO: master Write extension to minify raw links (right now it's so bulky)
import { toRef } from 'vue';

import { OrgNode } from 'org-mode-ast';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');

const linkAddress = node.value.value;
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
</style>
