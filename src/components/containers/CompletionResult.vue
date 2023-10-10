<template>
  <div class="flex column items-start justify-start fit no-wrap">
    <div class="q-px-md full-width completion-input">
      <q-input
        v-model="filter"
        ref="completionInput"
        autofocus
        @blur="closeCompletionOnBlur"
        borderless
        :placeholder="$t(placeholder)"
      >
        <template v-slot:prepend>
          <q-icon name="keyboard_arrow_right" />
        </template>
      </q-input>
    </div>
    <q-virtual-scroll
      ref="scrollTarget"
      :items-size="total"
      :virtual-scroll-slice-size="defaultCompletionLimit"
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
        <template
          v-slot="{ item, index }: { item: CompletionCandidate, index: number }"
        >
          <q-item
            :key="item.command"
            class="completion-item"
            :class="{ selected: index === selectedIndex }"
            :clickable="true"
            @mousedown="executeCommand(item)"
            @mouseover=" (e: MouseEvent) => focusCompletionCandidate(e, index) "
          >
            <!-- TODO: master combine with src/components/ui/SearchContainer.vue search icon as -->
            <!-- universal icon component with border (inherit props from quasar icon) -->
            <div class="icon">
              <q-icon v-if="item.icon" :name="item.icon" size="sm"></q-icon>
            </div>
            <div class="text-bold text-capitalize">
              <span>[{{ item.group }}]: </span>
              <span>{{ item.command }}</span>
            </div>
            <div>
              <span class="text-italic color-secondary">{{
                item.description
              }}</span>
            </div>
          </q-item>
        </template>
      </async-item-container>
    </q-virtual-scroll>

    <div
      class="completion-footer full-width q-px-md q-py-xs text-center color-reverse"
    >
      <span class="text-capitalize">{{ $t('items') }}</span
      >: {{ selectedIndex + 1 }}/{{ total }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { QVirtualScroll } from 'quasar';
import {
  CompletionCandidate,
  defaultCompletionLimit,
  useCompletionStore,
} from 'src/stores';
import { useKeybindingStore } from 'src/stores/keybindings';
import { compareElemPositions, debounce } from 'src/tools';

import { onMounted, ref, watch } from 'vue';

import AsyncItemContainer from 'src/components/AsyncItemContainer.vue';

const itemHeight = 60;
const scrollTarget = ref<QVirtualScroll | null>();

const completionStore = useCompletionStore();
const {
  candidates,
  filter,
  selectedIndex,
  total,
  candidateSelectedByDirection,
  placeholder,
} = storeToRefs(completionStore);

const keybindingStore = useKeybindingStore();

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

let lastCoords = [0, 0];

const focusCompletionCandidate = (e: MouseEvent, index: number) => {
  const coordsChanged =
    lastCoords[0] !== e.clientX || lastCoords[1] !== e.clientY;

  if (!coordsChanged) {
    return;
  }
  lastCoords = [e.clientX, e.clientY];
  completionStore.focusCandidate(index);
};

const executeCommand = (item: CompletionCandidate) => {
  keybindingStore.executeCommand({
    command: item.command,
    commandHandler: item.commandHandler,
    data: item.data,
  });
  completionStore.closeCompletion();
};

const closeCompletionOnBlur = () => {
  setTimeout(() => {
    completionStore.closeCompletion();
  }, 10);
};
</script>

<style lang="scss" setup>
.completion-footer {
  background: var(--fg-alt);
}

.completion-item {
  overflow: hidden;
  height: 100%;

  display: grid;
  grid-template-columns: var(--search-icn-size) auto;
  cursor: pointer;
  align-items: center;
  padding: 8px;
  column-gap: 16px;

  min-height: var(--completion-item-min-height);
  padding: var(--completion-item-padding);
  margin: var(--completion-item-margin);
  border-radius: var(--default-item-radius);
  cursor: pointer;

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
    border-radius: var(--default-item-radius);
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

.completion-input {
  height: var(--completion-input-height);
}
</style>
