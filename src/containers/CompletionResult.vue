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
          :selected="index === completion.activeCompletion!.selectedCandidateIndex"
          rounded
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
import { computed, toValue } from 'vue';
import { DEFAULT_COMPLETIO_ITEM_HEIGHT } from 'src/constants/completion-item';
import type { GroupedCompletionCandidate } from 'src/models/grouped-completion-candidate';

defineEmits<{
  select: [];
}>();

const completion = api.core.useCompletion();
const { config } = storeToRefs(api.core.useConfig());

const getPagedResult = (from: number, size: number) => {
  const fakeRows = Object.freeze(new Array(size).fill(null));
  return fakeRows;
};

const itemHeight = computed(
  () => completion.activeCompletion!.itemHeight ?? DEFAULT_COMPLETIO_ITEM_HEIGHT,
);

const groupedCandidates = computed<[GroupedCompletionCandidate[], string[]]>(() => {
  if (!completion.activeCompletion!.candidates || !config.value.completion.showGroup) {
    return [completion.activeCompletion!.candidates ?? [], []];
  }

  return completion.activeCompletion!.candidates.reduce<[GroupedCompletionCandidate[], string[]]>(
    (acc: [GroupedCompletionCandidate[], string[]], item: CompletionCandidate, index: number) => {
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

const total = computed(
  () => (completion.activeCompletion!.candidates?.length ?? 0) + groupedCandidates.value[1].length,
);

const candidatesAvailable = computed(() =>
  ['choice', 'input-choice'].includes(completion.activeCompletion!.type ?? ''),
);
</script>
