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
import { logger } from 'src/boot/logger';
import AsyncItemContainer from './AsyncItemContainer.vue';
import CompletionResultItem from './CompletionResultItem.vue';
import { to, type CompletionCandidate } from 'orgnote-api';
import { computed, nextTick, ref, toValue, watch } from 'vue';
import type { GroupedCompletionCandidate } from 'src/models/grouped-completion-candidate';
import { DEFAULT_COMPLETION_ITEM_HEIGHT } from 'src/constants/completion-item';
import type { QVirtualScroll } from 'quasar';

type CompletionDisplayItem = GroupedCompletionCandidate | undefined;
type GroupedCandidates = [CompletionDisplayItem[], string[]];

interface CandidateRange {
  readonly from: number;
  readonly size: number;
}

defineEmits<{
  select: [];
}>();

const completion = api.core.useCompletion();
const { config } = storeToRefs(api.core.useConfig());
const { activeCompletion } = storeToRefs(completion);

const scrollTarget = ref<QVirtualScroll | null>(null);
const pendingRanges = new Map<string, symbol>();

const buildRangeKey = (range: CandidateRange): string => `${range.from}-${range.size}`;

const resetPendingRanges = (): void => pendingRanges.clear();

watch(
  () => [activeCompletion.value, activeCompletion.value?.searchQuery],
  () => resetPendingRanges(),
);

const itemHeight = computed(
  () => activeCompletion.value?.itemHeight ?? DEFAULT_COMPLETION_ITEM_HEIGHT,
);

const hasLoadedAllCandidates = computed(() => {
  const candidates = activeCompletion.value?.candidates;
  const candidateTotal = activeCompletion.value?.total ?? 0;
  if (!candidates || candidates.length !== candidateTotal) return false;
  for (let index = 0; index < candidateTotal; index += 1) {
    if (!candidates[index]) return false;
  }
  return true;
});

const isGroupingEnabled = computed(
  () => Boolean(config.value?.completion?.showGroup && hasLoadedAllCandidates.value),
);

const groupedCandidates = computed<GroupedCandidates>(() => {
  const candidates = activeCompletion.value?.candidates;
  if (!candidates || !isGroupingEnabled.value) return [candidates ?? [], []];

  return candidates.reduce<GroupedCandidates>(
    (acc, item, index) => {
      const groupName = toValue(item.group);
      const groupChanged = groupName && acc[1][acc[1].length - 1] !== groupName;
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
  if (!isGroupingEnabled.value) return displayIndex;
  const candidate = groupedCandidates.value[0][displayIndex];
  if (!candidate || 'groupTitle' in candidate) return;
  return candidate.index;
};

const getCandidateDisplayIndex = (candidateIndex: number): number => {
  if (!isGroupingEnabled.value) return candidateIndex;
  const displayIndex = groupedCandidates.value[0].findIndex(
    (_, index) => getCandidateIndex(index) === candidateIndex,
  );
  return displayIndex < 0 ? candidateIndex : displayIndex;
};

const isRangeLoaded = (range: CandidateRange): boolean => {
  const candidates = activeCompletion.value?.candidates;
  if (!candidates?.length) return false;
  for (let index = 0; index < range.size; index += 1) {
    if (!candidates[range.from + index]) return false;
  }
  return true;
};

const isRangePending = (range: CandidateRange): boolean =>
  pendingRanges.has(buildRangeKey(range));

const markRangePending = (range: CandidateRange): symbol => {
  const requestId = Symbol(buildRangeKey(range));
  pendingRanges.set(buildRangeKey(range), requestId);
  return requestId;
};

const clearRangePending = (range: CandidateRange, requestId: symbol): void => {
  const rangeKey = buildRangeKey(range);
  if (pendingRanges.get(rangeKey) !== requestId) return;
  pendingRanges.delete(rangeKey);
};

const reportRangeFailure = (error: unknown, range: CandidateRange): void => {
  logger.error('Completion range search failed', { error, ...range });
};

const loadCandidateRange = async (range: CandidateRange): Promise<void> => {
  const requestId = markRangePending(range);
  const result = await to(completion.search)(range.size, range.from);
  clearRangePending(range, requestId);
  if (result.isErr()) reportRangeFailure(result.error, range);
};

const getPagedResult = (from: number, size: number) => {
  const fakeRows = Object.freeze(new Array(size).fill(null));
  if (isGroupingEnabled.value) return fakeRows;
  const candidateRange = { from, size };
  if (isRangeLoaded(candidateRange) || isRangePending(candidateRange)) return fakeRows;
  loadCandidateRange(candidateRange);
  return fakeRows;
};

const total = computed(() => {
  const serverTotal = activeCompletion.value?.total ?? 0;
  const groupCount = groupedCandidates.value[1].length;
  return serverTotal + groupCount;
});

const selectedDisplayIndex = computed(() => {
  const candidateIndex = activeCompletion.value?.selectedCandidateIndex;
  if (typeof candidateIndex !== 'number') return;
  return getCandidateDisplayIndex(candidateIndex);
});

watch(
  [selectedDisplayIndex, () => activeCompletion.value?.searchQuery, total],
  async ([displayIndex]) => {
    if (typeof displayIndex !== 'number') return;
    await nextTick();
    scrollTarget.value?.scrollTo(displayIndex);
  },
);

const candidatesAvailable = computed(() => {
  const type = activeCompletion.value?.type;
  return type ? ['choice', 'input-choice'].includes(type) : false;
});
</script>
