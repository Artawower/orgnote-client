<template>
  <context-menu-wrapper :target="target" ref="contextMenuWrapperRef">
    <div v-for="command of items" :key="command" class="context-menu-item">
      <command-action-button
        @click="handleItem()"
        :command="command"
        :data="data"
        include-text
        size="sm"
      />
    </div>
  </context-menu-wrapper>
</template>

<script lang="ts">
export interface ContextMenuItem {
  label?: string;
  icon?: string;
}
</script>

<script lang="ts" setup>
import { ref } from 'vue';
import ContextMenuWrapper from './ContextMenuWrapper.vue';
import { onClickOutside } from '@vueuse/core';
import type { CommandName } from 'orgnote-api';
import CommandActionButton from 'src/containers/CommandActionButton.vue';

defineProps<{
  target?: boolean | string | Element | undefined;
  items: CommandName[];
  data?: unknown;
}>();

const contextMenuWrapperRef = ref<InstanceType<typeof ContextMenuWrapper> | null>(null);

const open = () => {
  contextMenuWrapperRef.value?.open();
};

const close = () => {
  contextMenuWrapperRef.value?.close();
};

defineExpose({
  open,
});

const handleItem = () => {
  close();
};

onClickOutside(contextMenuWrapperRef, () => {
  contextMenuWrapperRef.value?.close();
});
</script>

<style lang="scss" scoped>
.context-menu-item {
  @include flexify(row, flex-start, center, var(--gap-sm));
  padding: var(--context-menu-item-padding);
  cursor: pointer;

  &:hover,
  &:active {
    background: var(--context-menu-item-hover-bg);
  }
}
</style>
