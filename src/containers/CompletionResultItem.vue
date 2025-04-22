<template>
  <div class="group-title" v-if="'groupTitle' in item">{{ item.groupTitle }}</div>
  <div
    v-else
    :key="extractDynamicValue(item.title)"
    class="completion-item"
    :class="{ selected }"
    @click="executeCompletionItem"
    @mouseover="
      (e: MouseEvent) =>
        focusCompletionCandidate(e, (item as IndexedCompletionCandidate).index || index)
    "
  >
    <app-icon v-if="item.icon" :name="extractDynamicValue(item.icon)" size="md" bordered></app-icon>
    <div class="text-bold color-main">
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
import { api } from 'src/boot/api';
import AppIcon from 'src/components/AppIcon.vue';
import type {
  GroupedCompletionCandidate,
  IndexedCompletionCandidate,
} from 'src/models/grouped-completion-candidate';
import { extractDynamicValue } from 'src/utils/extract-dynamic-value';

const props = defineProps<{
  item: GroupedCompletionCandidate;
  selected?: boolean;
  index: number;
}>();

const completion = api.core.useCompletion();

let lastCoords = [0, 0];
const focusCompletionCandidate = (e: MouseEvent, index: number) => {
  const coordsChanged = lastCoords[0] !== e.clientX || lastCoords[1] !== e.clientY;

  if (!coordsChanged) {
    return;
  }
  lastCoords = [e.clientX, e.clientY];
  completion.activeCompletion.selectedCandidateIndex = index;
};

const executeCompletionItem = async (e: MouseEvent) => {
  if ('groupTitle' in props.item) return;
  e.preventDefault();
  e.stopPropagation();
  if (completion.activeCompletion.type !== 'input-choice') {
    completion.close(props.item.data);
  }
  props.item.commandHandler(props.item.data);
};
</script>

<style lang="scss" scoped>
.completion-item {
  @include flexify(row, flex-start, center, var(--gap-md));

  & {
    height: 100%;
    cursor: pointer;
    border-radius: var(--completion-item-border-radius);
    padding: var(--completion-item-padding);
  }

  &:hover,
  &:active {
    background: color-mix(in srgb, var(--fg), var(--bg) 90%);
  }
}

.group-title {
  @include flexify(row, center, center);

  & {
    height: 100%;
    font-weight: bold;
    color: var(--fg-alt);
    background: var(--bg-alt2);
    user-select: none;
  }

  /* &::before,
     &::after {
     content: '';
     flex: 1;
     border-bottom: var(--border-default);
     margin: 0 10px;
     } */
}
</style>
