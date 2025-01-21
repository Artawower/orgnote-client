import type { Completion, CompletionSearchResult } from 'orgnote-api';
import { TXT_EXECUTE_COMMAND, type CompletionConfig, type CompletionStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { useModalStore } from './modal';
import AppCompletion from 'src/containers/AppCompletion.vue';
import { computed, ref } from 'vue';
import { watch } from 'vue';
import { debounce } from 'src/utils/debounce';
import { useSettingsStore } from './settings';

export const useCompletionStore = defineStore<'completion-store', CompletionStore>(
  'completion-store',
  () => {
    const modal = useModalStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastModalConfig: CompletionConfig<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openedCompletions = ref<Completion<any>[]>([]);

    const open = <T>(config: CompletionConfig<T>) => {
      console.log('✎: [line 11][completion.ts<orgnote-client/src/stores>] config: ', config);
      const closed = modal.open(AppCompletion, {
        mini: true,
        noPadding: true,
        position: 'top',
        modalProps: {
          placeholder: TXT_EXECUTE_COMMAND,
        },
      });

      openedCompletions.value.push({ ...config, searchQuery: '' });

      search();
      return closed.then(() => {
        lastModalConfig = config;
      });
    };

    const restore = () => {
      if (!lastModalConfig) {
        return;
      }
      open(lastModalConfig);
      lastModalConfig = null;
    };

    const close = () => {
      modal.close();
    };

    const closeAll = () => {
      modal.closeAll();
      openedCompletions.value = [];
    };

    const activeCompletion = computed(
      () => openedCompletions.value[openedCompletions.value.length - 1],
    );

    const nextCandidate = () => {
      if (!activeCompletion.value) {
        return;
      }

      if (activeCompletion.value.selectedCandidateIndex === null) {
        activeCompletion.value.selectedCandidateIndex = 1;
        return;
      }
      const isLastIndex =
        activeCompletion.value.selectedCandidateIndex === activeCompletion.value.total - 1;

      if (isLastIndex) {
        activeCompletion.value.selectedCandidateIndex = 0;
        return;
      }
      activeCompletion.value.selectedCandidateIndex++;
    };

    const previousCandidate = () => {
      if (!activeCompletion.value) {
        return;
      }

      if (activeCompletion.value.selectedCandidateIndex === null) {
        activeCompletion.value.selectedCandidateIndex = activeCompletion.value.total - 1;
        return;
      }

      const isFirstIndex = activeCompletion.value.selectedCandidateIndex === 0;

      if (isFirstIndex) {
        activeCompletion.value.selectedCandidateIndex = activeCompletion.value.total - 1;
        return;
      }
      activeCompletion.value.selectedCandidateIndex--;
    };

    const search = (limit?: number, offset: number = 0) => {
      if (activeCompletion.value.type === 'input') {
        return;
      }
      const { config } = useSettingsStore();
      limit = config.completion.defaultCompletionLimit;
      activeCompletion.value.selectedCandidateIndex = 0;

      const res = activeCompletion.value.itemsGetter(
        activeCompletion.value.searchQuery,
        limit,
        offset,
      );
      if (typeof (res as Promise<CompletionSearchResult>)?.then === 'function') {
        (res as Promise<CompletionSearchResult>).then((r) => {
          setupCandidates(r, offset);
        });
        return;
      }
      setupCandidates(res as CompletionSearchResult, offset);
    };

    const setupCandidates = (r: CompletionSearchResult, offset: number): void => {
      if (!offset) {
        activeCompletion.value.candidates = r.result;
        activeCompletion.value.total = r.total;
        return;
      }
      const indexedCandidates = [...activeCompletion.value.candidates];
      r.result.forEach((v, i) => {
        indexedCandidates[i + offset] = v;
      });
      activeCompletion.value.candidates = indexedCandidates;
      activeCompletion.value.total = r.total;
    };

    const searchWithDebounce = debounce(search, 100);

    watch(
      () => activeCompletion.value?.searchQuery,
      () => searchWithDebounce(),
    );

    const store: CompletionStore = {
      restore,
      close,
      closeAll,
      open,
      activeCompletion,
      nextCandidate,
      previousCandidate,
      search: searchWithDebounce,
    };

    return store;
  },
);
