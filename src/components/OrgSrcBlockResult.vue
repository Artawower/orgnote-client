<template>
  <div class="src-code-wrapper">
    {{ $t('output') }}
    <highlightjs language="bash" :code="content.value" />
  </div>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { toRef } from 'vue';

import 'highlight.js/lib/common';
import hljsVuePlugin from '@highlightjs/vue-plugin';

const highlightjs = hljsVuePlugin.component;

const props = defineProps<{
  content: OrgNode;
}>();

const content = toRef(props, 'content');
</script>
