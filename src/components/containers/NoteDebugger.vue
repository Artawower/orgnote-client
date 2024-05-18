<template>
  <div class="org-debug" v-html="parsedNoteTextTree"></div>
</template>

<script lang="ts" setup>
import { OrgNode, walkTree } from 'org-mode-ast';
import { useNoteEditorStore } from 'src/stores/note-editor';

import { ref, watch } from 'vue';

const props = defineProps<{
  cursorPosition?: number;
}>();

const noteEditorStore = useNoteEditorStore();
const selectedNode = ref<OrgNode | null>(null);

const parsedNoteTextTree = ref<string>();

const findSelectedNode = (node: OrgNode): OrgNode | null => {
  let foundNode: OrgNode;
  const pos = props.cursorPosition;
  walkTree(node, (n: OrgNode) => {
    if (n.start <= pos && n.end >= pos) {
      foundNode = n;
    }
    return false;
  });

  return foundNode;
};

const initDebugTree = () => {
  selectedNode.value = findSelectedNode(noteEditorStore.orgTree);
  const [start, end] = [selectedNode.value?.start, selectedNode.value?.end];
  parsedNoteTextTree.value = noteEditorStore.orgTree
    ?.toString()
    .replace(
      `[${start}-${end}]`,
      `<span style="background-color: var(--yellow); color: var(--base2)">[${start}-${end}]</span>`
    );
};

initDebugTree();

watch(
  () => [noteEditorStore.orgTree, props.cursorPosition],
  () => {
    initDebugTree();
  }
);
</script>

<style lang="scss" scoped>
.org-debug {
  font-family: var(--editor-font-family-main);
  white-space: pre-wrap;
}
</style>
