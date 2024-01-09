import { useKeybindingStore } from './keybindings';
import { useSettingsStore } from './settings';
import { defineStore } from 'pinia';
import {
  CandidateGetterFn,
  CompletionCandidate,
  CompletionConfigs,
  CompletionSearchResult,
} from 'src/api/completion';
import { debounce } from 'src/tools';

import { computed, ref, watch } from 'vue';

export const useCompletionStore = defineStore('completion', () => {
  const candidates = ref<CompletionCandidate[]>([]);
  const searchAutocompletions = ref<string[]>([]);
  const candidateSelectedByDirection = ref<number>();
  let onClicked: (candidate: CompletionCandidate<unknown>) => void;
  const filter = ref('');
  const opened = ref(false);
  const loading = ref(false);
  const total = ref<number>();
  const placeholder = ref<string>();

  // TODO: create stack of candidates.
  const selectedCandidateIndex = ref<number | null>(null);

  const candidateGetter = ref<CandidateGetterFn>(null);

  const setCandidateGetter = <T = unknown>(getter: CandidateGetterFn<T>) => {
    candidateGetter.value = getter as CandidateGetterFn<unknown>;
  };

  const initNewCompletion = <T = unknown>(configs: CompletionConfigs<T>) => {
    setCandidateGetter(configs.itemsGetter);
    placeholder.value = configs.placeholder;
    searchAutocompletions.value = configs.searchAutocompletions ?? [];
    candidates.value = [];
    onClicked = configs.onClicked as (
      candidate: CompletionCandidate<unknown>
    ) => void;
    filter.value = configs.searchText ?? '';
    selectedCandidateIndex.value = 0;
    search();
  };

  const clearCandidates = () => {
    candidates.value = [];
  };

  watch(
    () => filter.value,
    () => {
      searchWithDebounce();
    }
  );

  const setupCandidates = (r: CompletionSearchResult, offset: number): void => {
    if (!offset) {
      candidates.value = r.result;
      total.value = r.total;
      return;
    }
    const indexedCandidates = [...candidates.value];
    r.result.forEach((v, i) => {
      indexedCandidates[i + offset] = v;
    });
    candidates.value = indexedCandidates;
    total.value = r.total;
  };

  const search = (limit?: number, offset = 0) => {
    const { config } = useSettingsStore();
    limit ??= config.completion.defaultCompletionLimit;
    selectedCandidateIndex.value = 0;

    const res = candidateGetter.value(filter.value, limit, offset);
    if (typeof (res as Promise<CompletionSearchResult>)?.then === 'function') {
      loading.value = true;
      (res as Promise<CompletionSearchResult>).then((r) => {
        setupCandidates(r, offset);
        loading.value = false;
      });
      return;
    }
    setupCandidates(res as CompletionSearchResult, offset);
  };

  const searchWithDebounce = debounce(search, 100);

  const openCompletion = () => {
    opened.value = true;
  };

  const toggleCompletion = () => {
    opened.value = !opened.value;
  };

  const closeCompletion = () => {
    opened.value = false;
  };

  const focusCandidate = (index: number) => {
    selectedCandidateIndex.value = index;
  };

  const nextCandidate = () => {
    // TODO: master refactor.
    if (!opened.value) {
      return;
    }
    if (selectedCandidateIndex.value === null) {
      selectedCandidateIndex.value = 1;
    } else {
      selectedCandidateIndex.value === total.value - 1
        ? (selectedCandidateIndex.value = 0)
        : selectedCandidateIndex.value++;
    }
    candidateSelectedByDirection.value = selectedCandidateIndex.value;
  };

  const previousCandidate = () => {
    if (!opened.value) {
      return;
    }
    if (selectedCandidateIndex.value === null) {
      selectedCandidateIndex.value = candidates.value.length - 1;
    } else {
      selectedCandidateIndex.value === 0
        ? (selectedCandidateIndex.value = total.value - 1)
        : selectedCandidateIndex.value--;
    }
    candidateSelectedByDirection.value = selectedCandidateIndex.value;
  };

  const selectedIndex = computed(() => selectedCandidateIndex.value ?? 0);

  const selectedCandidate = computed(() => {
    if (selectedCandidateIndex.value === null) {
      return candidates.value?.[0];
    }
    return candidates.value[selectedCandidateIndex.value];
  });

  const restoreLastCompletionSession = () => {
    if (opened.value || !candidateGetter.value) {
      return;
    }

    opened.value = true;
  };

  const keybindingStore = useKeybindingStore();
  const executeCandidate = (item: CompletionCandidate) => {
    keybindingStore.executeCommand({
      command: item.command,
      commandHandler: item.commandHandler,
      data: item.data,
    });
    onClicked?.(item);
    closeCompletion();
  };

  return {
    candidates,
    clearCandidates,
    search,
    closeCompletion,
    toggleCompletion,
    opened,
    filter,
    selectedCandidateIndex,
    nextCandidate,
    previousCandidate,
    selectedCandidate,
    selectedIndex,
    openCompletion,
    initNewCompletion,
    total,
    focusCandidate,
    candidateSelectedByDirection,
    placeholder,
    restoreLastCompletionSession,
    executeCandidate,
    searchAutocompletions,
  };
});
