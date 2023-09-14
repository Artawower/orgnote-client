import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';

export interface CompletionCandidate<T = unknown> {
  icon?: string;
  group?: string;
  description?: string;
  command: string;
  data: T;
  /* Command handler could be used instead of command string */
  commandHandler?: (data: T) => void;
}

// TODO: make this field configurable from CompletionConfig
export const defaultCompletionLimit = 500;

// TODO: (extensions) move to API provider layer.
export interface CompletionSearchResult {
  total?: number;
  result: CompletionCandidate[];
}

export type CandidateGetterFn = (
  filter: string,
  limit?: number,
  offset?: number
) => CompletionSearchResult | Promise<CompletionSearchResult>;

export interface CompletionConfigs {
  itemsGetter: CandidateGetterFn;
  placeholder?: string;
  itemHeight?: string;
}

export const useCompletionStore = defineStore('completion', () => {
  const candidates = ref<CompletionCandidate[]>([]);
  const candidateSelectedByDirection = ref<number>();
  const filter = ref('');
  const opened = ref(false);
  const loading = ref(false);
  const total = ref<number>();
  const placeholder = ref<string>();

  // TODO: create stack of candidates.
  const selectedCandidateIndex = ref<number | null>(null);

  const candidateGetter = ref<CandidateGetterFn>(null);

  const setCandidateGetter = (getter: CandidateGetterFn) => {
    candidateGetter.value = getter;
  };

  const initNewCompletion = (configs: CompletionConfigs) => {
    setCandidateGetter(configs.itemsGetter);
    placeholder.value = configs.placeholder;
    candidates.value = [];
    filter.value = '';
    selectedCandidateIndex.value = 0;
  };

  const clearCandidates = () => {
    candidates.value = [];
  };

  watch(
    () => filter.value,
    (newFilter) => {
      search(newFilter);
    }
  );

  const setupCandidates = (r: CompletionSearchResult, offset: number): void => {
    const indexedCandidates = [...candidates.value];
    r.result.forEach((v, i) => {
      indexedCandidates[i + offset] = v;
    });
    candidates.value = indexedCandidates;
    total.value = r.total;
  };

  const search = (
    newFilter: string,
    limit = defaultCompletionLimit,
    offset = 0
  ) => {
    filter.value = newFilter;
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
  };
});
