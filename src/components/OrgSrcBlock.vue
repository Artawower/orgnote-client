<template>
  <div class="src-code-wrapper">
    <highlightjs :autodetect="true" :code="content.value" />
  </div>
</template>

<script setup lang="ts">
import { SrcBlock } from 'uniorg';
import { toRef } from 'vue';

import 'highlight.js/lib/common';
import 'highlight.js/styles/stackoverflow-light.css';
import hljs from 'highlight.js/lib/core';
import hljsVuePlugin from '@highlightjs/vue-plugin';

console.log(hljs.registerAliases);

const highlightjs = hljsVuePlugin.component;

const props = defineProps<{
  content: SrcBlock;
}>();

const content = toRef(props, 'content');
</script>
