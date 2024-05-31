<template>
  <span @click.stop.prevent="toggleFolding" class="headline-fold">
    <gutter-marker :open="opened" :disabled="!sectionExist" />
  </span>
</template>

<script lang="ts" setup>
import { foldEffect, foldedRanges, unfoldEffect } from '@codemirror/language';
import { NodeType, OrgNode, findParent } from 'org-mode-ast';
import { findOrgNode } from 'src/tools';

import { ref, toRef } from 'vue';

import GutterMarker from './ui/GutterMarker.vue';
import { EditorView } from '@codemirror/view';

const props = defineProps<{
  node: OrgNode;
  editorView?: EditorView;
}>();

const node = toRef(props, 'node');

const getFoldedRanges = () => {
  const r = [];

  // TODO: feat/server-side-rendering fix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cur = foldedRanges(props.editorView.state as any).iter();
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

const getFromFolding = () => node.value.parent.end - 1;
const sectionExist = node.value.parent?.parent?.section?.children?.length;

const from = getFromFolding();
const opened = ref<boolean>(!ranges.find(([s]) => s === from));

const getFoldingRange = (): [number, number] => {
  const root = findParent(node.value, (n) => n.is(NodeType.Root));
  const lastElemOffset = node.value.parent.parent.end === root.end ? 0 : 1;
  const from = getFromFolding();
  const to = node.value.parent.parent.end - lastElemOffset;
  return [from, to];
};

const getFirstNestedHeadline = (): OrgNode => {
  return findOrgNode(node.value.parent?.parent?.section, (n) => {
    return n.is(NodeType.Headline);
  });
};

const toggleFolding = () => {
  if (!sectionExist) {
    return;
  }
  const [from, to] = getFoldingRange();
  const firstHeadline = getFirstNestedHeadline();

  opened.value = !opened.value;

  if (!opened.value) {
    props.editorView.dispatch({ effects: foldEffect.of({ from, to }) });
    return;
  }

  const fullSectionRange = { from, to };
  const effects = [unfoldEffect.of(fullSectionRange)];

  if (firstHeadline) {
    const rangeTillFirstHealing = { from, to: firstHeadline.start - 1 };
    effects.push(unfoldEffect.of(rangeTillFirstHealing));
  }

  props.editorView.dispatch({
    effects,
  });
};
</script>

<style lang="scss" scoped>
.headline-fold {
  cursor: pointer;
  padding-right: 8px;
}
</style>
