import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export interface CompletionCandidate {
  icon?: string;
  group?: string;
  description?: string;
  command: string;
  args?: unknown[];
}

export const useCompletionStore = defineStore('completion', () => {
  const candidates = ref<CompletionCandidate[]>([]);
  const filter = ref('');
  const opened = ref(false);
  const selectedCandidateIndex = ref<number | null>(null);

  const addCandidate = (candidate: CompletionCandidate) => {
    candidates.value = [...candidates.value, candidate];
  };

  const clearCandidates = () => {
    candidates.value = [];
  };

  const setCandidates = (newCandidates: CompletionCandidate[]) => {
    candidates.value = newCandidates;
  };

  const setFilter = (newFilter: string) => {
    filter.value = newFilter;
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
      selectedCandidateIndex.value = 0;
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
    addCandidate,
    clearCandidates,
    setCandidates,
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
  };
});
