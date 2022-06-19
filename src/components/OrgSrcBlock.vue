<template>
  <div class="src-code-wrapper">
    <q-icon
      @click="copyToClipboard"
      name="content_copy"
      size="1.5rem"
      class="copy-btn"
    />
    <highlightjs :autodetect="true" :code="content.value" />
  </div>
</template>

<script setup lang="ts">
import { SrcBlock } from 'uniorg';
import { toRef } from 'vue';

import 'highlight.js/lib/common';
import 'highlight.js/styles/stackoverflow-light.css';
import hljsVuePlugin from '@highlightjs/vue-plugin';

const highlightjs = hljsVuePlugin.component;

const props = defineProps<{
  content: SrcBlock;
}>();

const content = toRef(props, 'content');

const copyToClipboard = () => {
  navigator.clipboard.writeText(content.value.value);
};
</script>

<style lang="scss">
.src-code-wrapper {
  position: relative;

  .copy-btn {
    display: none;
    width: 20px;
    height: 20px;
    cursor: pointer;
    position: absolute;
    right: 14px;
    top: 12px;
    color: $smog;
  }

  &:hover {
    .copy-btn {
      display: block;
    }
  }
}
</style>
