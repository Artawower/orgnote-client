<template>
  <q-virtual-scroll
    v-if="candidatesAvailable"
    ref="scrollTarget"
    :items-size="total"
    :virtual-scroll-slice-size="config.completion.defaultCompletionLimit"
    :virtual-scroll-item-size="itemHeight"
    :items-fn="getPagedResult"
    v-slot="{ index }"
    scroll-target="scrollTarget"
    class="completion-scroll full-width flex-1"
  >
    <async-item-container :items-list="groupedCandidates[0]" :index="index" :height="itemHeight">
      <template #default="{ item, index }">
        <completion-result-item
          :item="item as CompletionCandidate"
          :index="index"
          :selected="getCandidateIndex(index) === activeCompletion?.selectedCandidateIndex"
          @select="$emit('select')"
        />
      </template>
    </async-item-container>
  </q-virtual-scroll>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import AsyncItemContainer from './AsyncItemContainer.vue';
import CompletionResultItem from './CompletionResultItem.vue';
import type { CompletionCandidate } from 'orgnote-api';
import { computed, nextTick, ref, toValue, watch } from 'vue';
import type { GroupedCompletionCandidate } from 'src/models/grouped-completion-candidate';
import { DEFAULT_COMPLETION_ITEM_HEIGHT } from 'src/constants/completion-item';
import type { QVirtualScroll } from 'quasar';

defineEmits<{
  select: [];
}>();

const completion = api.core.useCompletion();
const { config } = storeToRefs(api.core.useConfig());
const { activeCompletion } = storeToRefs(completion);

const scrollTarget = ref<QVirtualScroll | null>(null);
const pendingRanges = new Set<string>();

const buildRangeKey = (from: number, size: number): string => `${from}-${size}`;

const resetPendingRanges = (): void => pendingRanges.clear();

watch(
  () => [activeCompletion.value, activeCompletion.value?.searchQuery],
  () => resetPendingRanges(),
);

const isRangeLoaded = (from: number, size: number): boolean => {
  const candidates = activeCompletion.value?.candidates;
  if (!candidates?.length) return false;
  const range = candidates.slice(from, from + size);
  if (range.length < size) return false;
  return range.every(Boolean);
};

const isRangePending = (from: number, size: number): boolean =>
  pendingRanges.has(buildRangeKey(from, size));

const markRangePending = (from: number, size: number): void => {
  pendingRanges.add(buildRangeKey(from, size));
};

const clearRangePending = (from: number, size: number): void => {
  pendingRanges.delete(buildRangeKey(from, size));
};

const getPagedResult = (from: number, size: number) => {
  const fakeRows = Object.freeze(new Array(size).fill(null));
  if (isRangeLoaded(from, size)) {
    clearRangePending(from, size);
    return fakeRows;
  }
  if (isRangePending(from, size)) return fakeRows;
  markRangePending(from, size);
  completion.search(size, from);
  return fakeRows;
};

const itemHeight = computed(
  () => activeCompletion.value?.itemHeight ?? DEFAULT_COMPLETION_ITEM_HEIGHT,
);

const groupedCandidates = computed<[GroupedCompletionCandidate[], string[]]>(() => {
  const candidates = activeCompletion.value?.candidates;
  if (!candidates || !config.value?.completion?.showGroup) {
    return [candidates ?? [], []];
  }

  return candidates.reduce<[GroupedCompletionCandidate[], string[]]>(
    (acc, item, index) => {
      const groupName = toValue(item.group) ?? '';
      const groupChanged = acc[1][acc[1].length - 1] !== groupName;
      if (groupChanged) {
        acc[0].push({ groupTitle: groupName });
        acc[1].push(groupName);
      }
      acc[0].push({ ...item, index });
      return acc;
    },
    [[], []],
  );
});

const getCandidateIndex = (displayIndex: number): number | undefined => {
  if (!config.value?.completion?.showGroup) return displayIndex;
  const candidate = groupedCandidates.value[0][displayIndex];
  if (!candidate || 'groupTitle' in candidate) return;
  return candidate.index ?? displayIndex;
};

const getCandidateDisplayIndex = (candidateIndex: number): number => {
  if (!config.value?.completion?.showGroup) return candidateIndex;
  const displayIndex = groupedCandidates.value[0].findIndex(
    (_, index) => getCandidateIndex(index) === candidateIndex,
  );
  return displayIndex < 0 ? candidateIndex : displayIndex;
};

const selectedDisplayIndex = computed(() => {
  const candidateIndex = activeCompletion.value?.selectedCandidateIndex;
  if (typeof candidateIndex !== 'number') return;
  return getCandidateDisplayIndex(candidateIndex);
});

watch(selectedDisplayIndex, async (displayIndex) => {
  if (typeof displayIndex !== 'number') return;
  await nextTick();
  scrollTarget.value?.scrollTo(displayIndex);
});

const total = computed(() => {
  const serverTotal = activeCompletion.value?.total ?? 0;
  const groupCount = groupedCandidates.value[1].length;
  return serverTotal + groupCount;
});

const candidatesAvailable = computed(() => {
  const type = activeCompletion.value?.type;
  return type ? ['choice', 'input-choice'].includes(type) : false;
});
</script>
