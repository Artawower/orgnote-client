<template>
  <div class="flex column items-start justify-start fit no-wrap">
    <div class="q-px-md full-width completion-input">
      <q-input
        v-model="filter"
        ref="completionInput"
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
      :virtual-scroll-slice-size="defaultCompletionLimit * 3"
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
            class="flex column completion-item"
            :class="{ selected: index === selectedIndex }"
            :clickable="true"
            @click="executeCommand(item)"
            @mouseover="(e: MouseEvent) => focusCompletionCandidate(e, index)"
          >
            <div>
              <q-icon
                v-if="item.icon"
                :name="item.icon"
                class="q-pr-md"
              ></q-icon>
              <span class="text-bold">[{{ item.group }}]: </span>
              <span>{{ item.command }}</span>
            </div>
            <div>
              <span class="text-italic">{{ item.description }}</span>
            </div>
          </q-item>
        </template>
      </async-item-container>
    </q-virtual-scroll>

    <div
      class="completion-footer full-width q-px-md q-py-xs text-center color-reverse"
    >
      Total items: {{ total }}, Current item number: {{ selectedIndex }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useCommandExecutor } from 'src/hooks';
import { useKeybindingStore } from 'src/stores/keybindings';
import { storeToRefs } from 'pinia';
import {
  CompletionCandidate,
  defaultCompletionLimit,
  useCompletionStore,
} from 'src/stores';
import { QVirtualScroll } from 'quasar';
import { debounce, compareElemPositions } from 'src/tools';

import AsyncItemContainer from 'src/components/AsyncItemContainer.vue';

const itemHeight = 48;
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

const commandExecutor = useCommandExecutor();
const keybindingStore = useKeybindingStore();

onBeforeMount(() => commandExecutor.registerDynamicCommands());

onBeforeUnmount(() => commandExecutor.unregisterDynamicCommands());

const completionInput = ref<HTMLInputElement | null>(null);
onMounted(() => setTimeout(() => completionInput.value?.focus()));

const search = debounce(completionStore.search, 300);

const getPagedResult = (from: number, size: number) => {
  const fakeRows = Object.freeze(new Array(size).fill(null));
  search(filter.value, size, from);
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
  keybindingStore.executeCommand({ command: item.command });
  completionStore.closeCompletion();
};
</script>

<style lang="scss" setup>
.completion-footer {
  background: var(--fg-alt);
}

.completion-item {
  overflow: hidden;
  height: 100%;
}

.completion-scroll {
  overflow: auto;
}

.completion-input {
  height: var(--completion-input-height);
}
</style>