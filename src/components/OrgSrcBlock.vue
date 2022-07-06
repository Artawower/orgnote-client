<template>
  <div class="src-code-wrapper">
    <!-- TODO: master  separated component -->
    <q-icon
      @click="copyToClipboard"
      :name="copied ? 'done' : 'content_copy'"
      size="1rem"
      class="copy-btn"
      :class="{ copied }"
    />
    <highlightjs :autodetect="true" :code="content.value" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, toRef } from 'vue';

import 'highlight.js/lib/common';
import 'highlight.js/styles/stackoverflow-light.css';
import hljsVuePlugin from '@highlightjs/vue-plugin';

const highlightjs = hljsVuePlugin.component;

const props = defineProps<{
  content: OrgSrcBlock;
}>();

const content = toRef(props, 'content');
let copied: Ref<boolean> = ref(false);

const showCopied = () => {
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1000);
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(content.value.value);
  showCopied();
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
    right: 10px;
    top: 8px;
    color: $night;
    box-shadow: 0 1px 0 rgba(27, 31, 36, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    border: 1px solid;
    border-color: $smog;
    border-radius: 6px;
    padding: 6px;

    &.copied {
      color: $grass;
      border-color: $grass;
    }
  }

  &:hover {
    .copy-btn {
      display: flex;
    }
  }
  .copy-btn.copied {
    display: flex;
  }
}
</style>
