<template>
  <span @click.stop.prevent="toggleFolding" class="headline-fold">
    <gutter-marker :open="opened" :disabled="!sectionExist" />
  </span>
</template>

<script lang="ts" setup>
import { foldEffect, foldedRanges, unfoldEffect } from '@codemirror/language';
import { EditorView } from 'codemirror';
import { NodeType, OrgNode } from 'org-mode-ast';

import { ref, toRef } from 'vue';

import GutterMarker from './ui/GutterMarker.vue';

const props = defineProps<{
  node: OrgNode;
  editorView?: EditorView;
}>();

const node = toRef(props, 'node');

const getFoldedRanges = () => {
  const r = [];

  const cur = foldedRanges(props.editorView.state).iter();
  while (true) {
    if (!cur.value) {
      break;
    }
    r.push([cur.from, cur.to]);
    cur.next();
  }
  return r;
};

const ranges = getFoldedRanges();

const from = node.value.parent.end - 1;
const lastElemOffset = node.value.parent.parent.section?.lastChild?.is(
  NodeType.NewLine
)
  ? 1
  : 0;
const to = node.value.parent.parent.end - lastElemOffset;

const sectionExist = node.value.parent?.parent?.section?.children?.length;
const opened = ref<boolean>(!ranges.find(([s]) => s === from));

const toggleFolding = () => {
  if (!sectionExist) {
    return;
  }
  opened.value = !opened.value;
  if (opened.value) {
    props.editorView.dispatch({
      effects: unfoldEffect.of({ from, to }),
    });
    return;
  }
  props.editorView.dispatch({ effects: foldEffect.of({ from, to }) });
};
</script>

<style lang="scss" scoped>
.headline-fold {
  cursor: pointer;
}
</style>
