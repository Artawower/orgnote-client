<template>
  <div class="src-code-wrapper">
    {{ $t('output') }}
    <highlightjs language="bash" :code="content.value" />
  </div>
</template>

<script setup lang="ts">
import { SrcBlock } from 'uniorg';
import { toRef } from 'vue';

import 'highlight.js/lib/common';
import hljsVuePlugin from '@highlightjs/vue-plugin';

const highlightjs = hljsVuePlugin.component;

const props = defineProps<{
  content: SrcBlock;
}>();

const content = toRef(props, 'content');
</script>
