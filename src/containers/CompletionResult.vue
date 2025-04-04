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
        <keep-alive>
          <completion-result-item
            :item="item as CompletionCandidate"
            :index="index"
            :selected="index === activeCompletion.selectedCandidateIndex"
            rounded
          />
        </keep-alive>
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
import { computed } from 'vue';
import { DEFAULT_COMPLETIO_ITEM_HEIGHT } from 'src/constants/completion-item';
import type { GroupedCompletionCandidate } from 'src/models/grouped-completion-candidate';
import { extractDynamicValue } from 'src/utils/extract-dynamic-value';

const completion = api.core.useCompletion();
const { activeCompletion } = storeToRefs(completion);
const { config } = storeToRefs(api.core.useConfig());

const getPagedResult = (from: number, size: number) => {
  const fakeRows = Object.freeze(new Array(size).fill(null));
  // search(size, from);
  return fakeRows;
};

const itemHeight = computed(
  () => activeCompletion.value.itemHeight ?? DEFAULT_COMPLETIO_ITEM_HEIGHT,
);

const groupedCandidates = computed<[GroupedCompletionCandidate[], string[]]>(() => {
  if (!activeCompletion.value.candidates || !config.value.completion.showGroup) {
    return [activeCompletion.value.candidates, []];
  }

  return activeCompletion.value.candidates.reduce<[GroupedCompletionCandidate[], string[]]>(
    (acc, item: CompletionCandidate, index) => {
      const groupChanged = acc[1][acc[1].length - 1] !== item.group;
      if (groupChanged) {
        const groupName = extractDynamicValue(item.group);
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
  () => activeCompletion.value.candidates?.length + groupedCandidates.value[1].length,
);

const candidatesAvailable = computed(() =>
  ['choice', 'input-choice'].includes(activeCompletion.value.type),
);
</script>
