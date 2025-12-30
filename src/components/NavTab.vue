<template>
  <app-flex
    class="tab"
    :class="{ active, dragging: isDragging }"
    :draggable="canDrag"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    row
    between
    align-center
    gap="sm"
  >
    <app-flex class="label" row start align-center gap="sm">
      <app-icon v-if="icon" :name="icon" size="xs" color="fg-muted" />
      <span class="label-text">
        <slot />
      </span>
    </app-flex>
    <action-button @click.prevent.stop="emits('close')" icon="close" size="xs" color="fg-muted" />
  </app-flex>
</template>

<script lang="ts" setup>
import ActionButton from './ActionButton.vue';
import AppIcon from './AppIcon.vue';
import { computed, ref } from 'vue';
import { Platform } from 'quasar';
import { ORGNOTE_TAB_FORMAT } from 'src/constants/orgnote-tab';
import AppFlex from 'src/components/AppFlex.vue';

const props = withDefaults(
  defineProps<{
    closable?: boolean;
    icon?: string;
    active?: boolean;
    tabId?: string;
    paneId?: string;
  }>(),
  {
    closable: true,
  },
);

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'dragstart', payload: { tabId: string; paneId: string }): void;
  (e: 'dragend'): void;
}>();

const isDragging = ref(false);

const canDrag = computed(() => !Platform.is.mobile && !!props.tabId && !!props.paneId);

const handleDragStart = (event: DragEvent) => {
  if (!canDrag.value || !props.tabId || !props.paneId) return;

  isDragging.value = true;
  emits('dragstart', { tabId: props.tabId, paneId: props.paneId });

  if (!event.dataTransfer) return;

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData(
    ORGNOTE_TAB_FORMAT,
    JSON.stringify({ tabId: props.tabId, paneId: props.paneId }),
  );
};

const handleDragEnd = () => {
  isDragging.value = false;
  emits('dragend');
};
</script>

<style lang="scss" scoped>
.tab {
  & {
    padding: var(--tab-padding);
    background: var(--tab-bg);
    border-radius: var(--tab-border-radius);
    color: var(--tab-fg);
    border: var(--tab-border);
    width: var(--tab-width);
    min-width: var(--tab-min-width, 120px);
    flex-shrink: 0;
    cursor: pointer;
    height: var(--tab-height);
    box-sizing: border-box;
    position: relative;
    user-select: none;
  }

  &:not(.active):hover {
    background: var(--tab-active-hover-bg);
  }

  &.dragging {
    opacity: 0.5;
  }
}

.tab.active {
  border: var(--tab-active-border);
  color: var(--tab-active-fg);
  background: var(--tab-active-bg);
}

.label-text {
  @include line-limit(1);
}
</style>
