<template>
  <div
    :key="extractDynamicValue(item.title)"
    class="completion-item"
    :class="{ selected }"
    @click="executeCompletionItem"
    @mouseover="(e: MouseEvent) => focusCompletionCandidate(e, index)"
  >
    <app-icon v-if="item.icon" :name="extractDynamicValue(item.icon)" size="md" bordered></app-icon>
    <div class="text-bold color-main">
      <div v-if="config.completion.showGroup">[{{ item.group }}]:&nbsp;</div>
      <div class="line-limit-1">
        <div class="capitalize">
          {{ extractDynamicValue(item.title) }}
        </div>
      </div>
    </div>
    <div>
      <span class="text-italic color-secondary line-limit-1">
        {{ extractDynamicValue(item.description) }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CompletionCandidate } from 'orgnote-api';
import { api } from 'src/boot/api';
import AppIcon from 'src/components/AppIcon.vue';
import { useSettingsStore } from 'src/stores/settings';
import { extractDynamicValue } from 'src/utils/extract-dynamic-value';

const props = defineProps<{
  item: CompletionCandidate;
  selected?: boolean;
  index: number;
}>();

const { config } = useSettingsStore();

let lastCoords = [0, 0];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const focusCompletionCandidate = (e: MouseEvent, _index: number) => {
  const coordsChanged = lastCoords[0] !== e.clientX || lastCoords[1] !== e.clientY;

  if (!coordsChanged) {
    return;
  }
  lastCoords = [e.clientX, e.clientY];
  // completionStore.focusCandidate(index);
};

const completion = api.core.useCompletion();
const executeCompletionItem = async (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  completion.close();
  props.item.commandHandler(props.item.data);
};
</script>

<style lang="scss" scoped>
.completion-item {
  @include flexify(row, flex-start, center, var(--gap-md));
  height: 100%;
  cursor: pointer;
  border-radius: var(--completion-item-border-radius);
  padding: var(--completion-item-padding);

  &:hover,
  &:active {
    /* background: var(--completion-item-hover-bg); */
    background: color-mix(in srgb, var(--fg), var(--bg) 90%);
  }
}
</style>
