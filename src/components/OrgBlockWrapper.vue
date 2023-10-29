<template>
  <span v-if="isHeader && isSrcBlock" class="org-src-language">{{
    language
  }}</span>
  <div v-if="isHeader" class="actions">
    <action-btn
      @click="notifications.notify('Tangling is not implemented yet')"
      v-if="isSrcBlock"
      icon="rtt"
      active-icon="done"
    />
    <action-btn
      @click="executeCode"
      v-if="isSrcBlock"
      icon="play_arrow"
      active-icon="done"
    />
    <action-btn
      v-if="copyValue"
      @click="copySrc"
      icon="content_copy"
      active-icon="done"
    />
  </div>
</template>

<script lang="ts" setup>
import { EditorView } from 'codemirror';
import { NodeType, OrgNode } from 'org-mode-ast';
import { useNotifications } from 'src/hooks';
import { useOrgBabelStore } from 'src/stores';
import { findActualOrgNode } from 'src/tools';

import { computed } from 'vue';

import ActionBtn from 'src/components/ui/ActionBtn.vue';

const props = defineProps<{
  node: OrgNode;
  rootNodeSrc: () => OrgNode;
  editorView?: EditorView;
}>();

const emits = defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const isHeader = computed(() => {
  return props.node.is(NodeType.BlockHeader);
});

const copyValue = computed(() => props.node.next?.next?.rawValue);

const language = computed(() =>
  props.node.children.first?.is(NodeType.Keyword) &&
  props.node.children.first.children.length === 2
    ? props.node.children.first.children.last.rawValue.trim()
    : 'srouce code'
);

const isSrcBlock = computed(() => props.node.parent?.is(NodeType.SrcBlock));

const copySrc = () => {
  navigator.clipboard.writeText(copyValue.value);
};

const notifications = useNotifications();

const orgBabelStore = useOrgBabelStore();

const executeCode = async () => {
  const actualNode = findActualOrgNode(props.node, props.rootNodeSrc());
  try {
    const res = await orgBabelStore.execute(
      language.value,
      actualNode.next.next.rawValue
    );
    emits('update', res);
  } catch (e) {
    notifications.notify((e as Error).message);
  }
};
</script>

<style lang="scss" scoped>
.block-wrapper {
  display: block;
}

.actions {
  @include flexify();
  gap: 8px;
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 1000;
}
</style>
