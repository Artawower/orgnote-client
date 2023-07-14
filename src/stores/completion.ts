import { computed, ref } from 'vue';
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

type CandidateGetterFn = (
  filter: string
) => CompletionCandidate[] | Promise<CompletionCandidate[]>;

export const useCompletionStore = defineStore('completion', () => {
  const candidates = ref<CompletionCandidate[]>([]);
  const filter = ref('');
  const opened = ref(false);
  const loading = ref(false);

  // TODO: create stack of candidates.
  const selectedCandidateIndex = ref<number | null>(null);

  const candidateGetter = ref<CandidateGetterFn>(null);

  const setCandidateGetter = (getter: CandidateGetterFn) => {
    candidateGetter.value = getter;
  };

  const clearCandidates = () => {
    candidates.value = [];
  };

  const setFilter = (newFilter: string) => {
    filter.value = newFilter;
    const res = candidateGetter.value(filter.value);
    if (typeof (res as Promise<CompletionCandidate[]>)?.then === 'function') {
      loading.value = true;
      (res as Promise<CompletionCandidate[]>).then((c) => {
        candidates.value = c;
        loading.value = false;
      });
      return;
    }
    candidates.value = res as CompletionCandidate[];
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

  const nextCandidate = () => {
    if (!opened.value) {
      return;
    }
    if (selectedCandidateIndex.value === null) {
      selectedCandidateIndex.value = 1;
      return;
    }
    selectedCandidateIndex.value === filteredCandidates.value.length - 1
      ? (selectedCandidateIndex.value = 0)
      : selectedCandidateIndex.value++;
  };

  const previousCandidate = () => {
    if (!opened.value) {
      return;
    }
    if (selectedCandidateIndex.value === null) {
      selectedCandidateIndex.value = filteredCandidates.value.length - 1;
      return;
    }
    selectedCandidateIndex.value === 0
      ? (selectedCandidateIndex.value = filteredCandidates.value.length - 1)
      : selectedCandidateIndex.value--;
  };

  const filteredCandidates = computed(() => {
    if (filter.value === '') {
      return candidates.value;
    }
    selectedCandidateIndex.value = null;

    return candidates.value.filter((candidate) => {
      const rawFilter = filter.value.toLowerCase().trim();
      return (
        candidate.command.toLowerCase().includes(rawFilter) ||
        candidate.description?.toLowerCase().includes(rawFilter) ||
        candidate.group?.toLowerCase().includes(rawFilter)
      );
    });
  });

  const selectedIndex = computed(() => selectedCandidateIndex.value ?? 0);

  const selectedCandidate = computed(() => {
    if (selectedCandidateIndex.value === null) {
      return filteredCandidates.value?.[0];
    }
    return filteredCandidates.value[selectedCandidateIndex.value];
  });

  return {
    candidates,
    clearCandidates,
    setFilter,
    filteredCandidates,
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
    setCandidateGetter,
  };
});
