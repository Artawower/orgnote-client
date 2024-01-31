<template>
  <div class="completion-results fit no-wrap">
    <prevent-ios-touch>
      <completion-inp />
    </prevent-ios-touch>
    <q-virtual-scroll
      v-if="completionMode === 'choice'"
      ref="scrollTarget"
      :items-size="total"
      :virtual-scroll-slice-size="config.completion.defaultCompletionLimit"
      :virtual-scroll-item-size="itemHeight"
      :items-fn="getPagedResult"
      v-slot="{ index }"
      :scroll-target="scrollTarget as unknown as Element"
      class="completion-scroll full-width flex-1"
    >
      <async-item-container
        :items-list="candidates"
        :index="index"
        :height="itemHeight"
      >
        <template v-slot="{ item, index }">
          <keep-alive>
            <completion-result-item
              :item="item as CompletionCandidate"
              :index="index"
              :selected="index === selectedIndex"
            />
          </keep-alive>
        </template>
      </async-item-container>
    </q-virtual-scroll>

    <prevent-ios-touch v-if="completionMode === 'choice'">
      <div class="completion-footer full-width q-px-md q-py-xs text-center">
        <span class="text-capitalize">{{ $t('items') }}</span
        >: {{ selectedIndex + 1 }}/{{ total }}
      </div>
    </prevent-ios-touch>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { QVirtualScroll } from 'quasar';
import { CompletionCandidate } from 'src/api';
import { useBodyActionPaneClass } from 'src/hooks';
import { useCompletionStore } from 'src/stores';
import { useSettingsStore } from 'src/stores/settings';
import { compareElemPositions, debounce } from 'src/tools';

import { onMounted, ref, watch } from 'vue';

import CompletionResultItem from './CompletionResultItem.vue';
import AsyncItemContainer from 'src/components/AsyncItemContainer.vue';
import CompletionInp from 'src/components/containers/CompletionInput.vue';
import PreventIosTouch from 'src/components/ui/PreventIosTouch.vue';

const itemHeight = 70;
const scrollTarget = ref<QVirtualScroll | null>();

const completionStore = useCompletionStore();
const {
  candidates,
  selectedIndex,
  total,
  candidateSelectedByDirection,
  completionMode,
} = storeToRefs(completionStore);

const completionInput = ref<HTMLInputElement | null>(null);
onMounted(() => setTimeout(() => completionInput.value?.focus()));

const search = debounce(completionStore.search, 300);

const getPagedResult = (from: number, size: number) => {
  const fakeRows = Object.freeze(new Array(size).fill(null));
  search(size, from);
  return fakeRows;
};

const ensureSelectedIndexVisible = () => {
  const scrollDirection = compareElemPositions(
    '.completion-scroll',
    '.completion-item.selected'
  );

  if (!scrollDirection) {
    return;
  }

  const direction = scrollDirection === -1 ? 'end' : 'start';
  scrollTarget.value?.scrollTo(selectedIndex.value, direction);
};

watch(() => candidateSelectedByDirection.value, ensureSelectedIndexVisible);

const { config } = useSettingsStore();
useBodyActionPaneClass();
</script>

<style lang="scss" setup>
.completion-results {
  @include flexify(column, flex-start, flex-start);

  @include mobile {
    flex-direction: column-reverse;
  }
}

.completion-footer {
  background: var(--bg-alt);
  color: var(--fg);
}

.completion-item {
  overflow: hidden;
  height: 100%;

  display: grid;
  grid-template-columns: var(--search-icn-size) auto;
  grid-auto-rows: 1fr;
  cursor: pointer;
  align-items: center;
  column-gap: 16px;

  min-height: var(--completion-item-min-height);
  padding: var(--completion-item-padding);
  margin: var(--completion-item-margin);
  border-radius: var(--item-default-radius);

  .q-focus-helper {
    display: none;
  }

  &.selected {
    background: var(--completion-item-hover-background);
    color: var(--completion-item-hover-color);
  }

  .icon {
    @include flexify(center, center);
    margin-left: 4px;
    border: 1px solid var(--base7);
    border-radius: var(--item-default-radius);
    width: var(--search-icn-size);
    height: var(--search-icn-size);
    grid-column: 1;
    grid-row-start: 1;
    grid-row-end: 3;
    color: var(--fg);
  }
}

.completion-scroll {
  overflow: auto;
}
</style>
