<template>
  <div class="src-code-wrapper">
    <div class="actions">
      <action-btn @click="copySrc" icon="content_copy" active-icon="done" />
      <action-btn @click="executeCode" icon="play_arrow" active-icon="done" />
    </div>
    <highlightjs
      autodetect
      :code="node?.children?.get(2)?.rawValue ?? node?.rawValue"
    />
  </div>
</template>

<script setup lang="ts">
import { OrgComponentProps } from 'src/components/org-component-props';
import { useNotifications } from 'src/hooks';
import { copyToClipboard, findActualOrgNode } from 'src/tools';

import { computed, toRef } from 'vue';

import ActionBtn from 'src/components/ui/ActionBtn.vue';
import { useOrgBabelStore } from 'src/stores/org-babel';

const props = defineProps<OrgComponentProps>();
const emits = defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const node = toRef(props, 'node');

const copySrc = () => {
  copyToClipboard(node.value.children.get(2).rawValue);
};

const orgBabelStore = useOrgBabelStore();
const notifications = useNotifications();

const language = computed(() =>
  props.node.children.first.children?.first?.children?.length === 2
    ? props.node.children.first.children.first.children.last.rawValue.trim()
    : 'srouce code'
);

const executeCode = async () => {
  const actualNode = findActualOrgNode(props.node, props.rootNodeSrc());
  try {
    const res = await orgBabelStore.execute(
      language.value,
      actualNode.children.get(2).rawValue
    );
    emits('update', res);
  } catch (e) {
    notifications.notify((e as Error).message);
  }
};
</script>

<style lang="scss" scoped>
.src-code-wrapper {
  position: relative;

  .actions {
    @include flexify();
    display: none !important;
    gap: var(--gap-sm);
    position: absolute;
    top: var(--gap-sm);
    z-index: 1000;
  }

  &:hover {
    .actions {
      display: flex !important;
    }
  }
  pre {
    margin: 0 !important;

    code {
      padding: var(--src-block-padding-y) var(--src-block-padding-x);
      border-radius: var(--block-border-radius-sm);
    }
  }
}
</style>
