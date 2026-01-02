import type { Completion, CompletionSearchResult } from 'orgnote-api';
import { type CompletionConfig, type CompletionStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { useModalStore } from './modal';
import AppCompletion from 'src/containers/AppCompletion.vue';
import { computed, shallowRef, shallowReactive } from 'vue';
import { watch } from 'vue';
import { debounce } from 'src/utils/debounce';
import { DEFAULT_INPUT_DEBOUNCE } from 'src/constants/default-input-debounce';
import { createPromise } from 'src/utils/create-promise';
import { useConfigStore } from './config';
import { isNullable } from 'orgnote-api/utils';

export const useCompletionStore = defineStore<'completion-store', CompletionStore>(
  'completion-store',
  () => {
    const modal = useModalStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastModalConfig: CompletionConfig<any> | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openedCompletions = shallowRef<Completion<any>[]>([]);

    const open = async <TItem, TReturn = void>(
      config: CompletionConfig<TItem>,
    ): Promise<TReturn> => {
      const isInputOnly = config.type === 'input';
      const closed = modal.open<TReturn>(AppCompletion, {
        noPadding: true,
        position: 'top',
        mini: isInputOnly,
        modalProps: {
          placeholder: config.placeholder,
          searchText: config.searchText,
        },
      });

      const [result, resolve] = createPromise();
      const completion = shallowReactive({
        ...config,
        searchQuery: config.searchText ?? '',
        result,
      });

      openedCompletions.value = [...openedCompletions.value, completion];

      search();
      const res = await closed;
      resolve(res);

      lastModalConfig = config;
      return res;
    };

    const restore = () => {
      if (!lastModalConfig) {
        return;
      }
      open(lastModalConfig);
      lastModalConfig = undefined;
    };

    const close = <TReturn = unknown>(data?: TReturn) => {
      modal.close(data);
    };

    const closeAll = () => {
      modal.closeAll();
      openedCompletions.value = [];
    };

    const activeCompletion = computed(
      () => openedCompletions.value[openedCompletions.value.length - 1],
    );

    const nextCandidate = () => {
      if (isNoCompletion.value) return;

      const completion = activeCompletion.value;
      if (isNullable(completion?.total)) return;

      if (isNullable(completion.selectedCandidateIndex)) {
        completion.selectedCandidateIndex = 1;
        return;
      }

      const isLastIndex = completion.selectedCandidateIndex === completion.total - 1;

      if (isLastIndex) {
        completion.selectedCandidateIndex = 0;
        return;
      }
      completion.selectedCandidateIndex++;
    };

    const previousCandidate = () => {
      if (isNoCompletion.value) return;

      const completion = activeCompletion.value;
      if (isNullable(completion?.total)) return;

      if (isNullable(completion.selectedCandidateIndex)) {
        completion.selectedCandidateIndex = completion.total - 1;
        return;
      }

      const isFirstIndex = completion.selectedCandidateIndex === 0;

      if (isFirstIndex) {
        completion.selectedCandidateIndex = completion.total - 1;
        return;
      }
      completion.selectedCandidateIndex--;
    };

    const isNoCompletion = computed(
      () => !activeCompletion.value || isNullable(activeCompletion.value.total),
    );

    const performSearch = (limit?: number, offset: number = 0) => {
      if (!activeCompletion.value) return;
      if (activeCompletion.value.type === 'input') return;

      const { config } = useConfigStore();
      limit = config.completion.defaultCompletionLimit;

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
      if (!activeCompletion.value) return;

      if (!offset) {
        activeCompletion.value.candidates = r.result;
        activeCompletion.value.total = r.total;
        activeCompletion.value.selectedCandidateIndex = 0;
        return;
      }
      if (!activeCompletion.value.candidates) return;

      const indexedCandidates = [...activeCompletion.value.candidates];
      r.result.forEach((v, i) => {
        indexedCandidates[i + offset] = v;
      });
      activeCompletion.value.candidates = indexedCandidates;
      activeCompletion.value.total = r.total;
    };

    const search = debounce(performSearch, DEFAULT_INPUT_DEBOUNCE, { leading: true });

    watch(
      () => activeCompletion.value?.searchQuery,
      () => search(),
    );

    const store: CompletionStore = {
      restore,
      close,
      closeAll,
      open,
      activeCompletion,
      nextCandidate,
      previousCandidate,
      search,
    };

    return store;
  },
);
