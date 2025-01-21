<template>
  <q-virtual-scroll
    v-if="activeCompletion.type === 'choice'"
    ref="scrollTarget"
    :items-size="activeCompletion.total"
    :virtual-scroll-slice-size="config.completion.defaultCompletionLimit"
    :virtual-scroll-item-size="itemHeight"
    :items-fn="getPagedResult"
    v-slot="{ index }"
    scroll-target="scrollTarget"
    class="completion-scroll full-width flex-1"
  >
    <async-item-container
      :items-list="activeCompletion.candidates"
      :index="index"
      :height="itemHeight"
    >
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

const completion = api.core.useCompletion();
const { activeCompletion } = storeToRefs(completion);
const { config } = storeToRefs(api.core.useSettings());

const getPagedResult = (from: number, size: number) => {
  const fakeRows = Object.freeze(new Array(size).fill(null));
  // search(size, from);
  return fakeRows;
};

const itemHeight = computed(() => activeCompletion.value.itemHeight ?? 60);
</script>
