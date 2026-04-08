import type {
  Completion,
  CompletionSearchResult,
  CompletionInterceptor,
  CompletionCandidate,
  CompletionInterceptorContext,
} from 'orgnote-api';
import { type CompletionConfig, type CompletionStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { useModalStore } from './modal';
import AppCompletion from 'src/containers/AppCompletion.vue';
import { computed, shallowRef, shallowReactive, ref, markRaw } from 'vue';
import { watch } from 'vue';
import { debounce } from 'src/utils/debounce';
import { DEFAULT_INPUT_DEBOUNCE } from 'src/constants/default-input-debounce';
import { createPromise } from 'src/utils/create-promise';
import { useConfigStore } from './config';
import { isNullable } from 'orgnote-api/utils';

const interceptorMatchesTarget = (
  interceptorTarget: CompletionInterceptor['target'],
  completionName: string,
): boolean => {
  if (interceptorTarget === '*') return true;
  if (Array.isArray(interceptorTarget)) return interceptorTarget.includes(completionName);
  return interceptorTarget === completionName;
};

const sortInterceptorsByPriority = <T>(
  interceptors: CompletionInterceptor<T>[],
): CompletionInterceptor<T>[] =>
  [...interceptors].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

export const useCompletionStore = defineStore<'completion-store', CompletionStore>(
  'completion-store',
  () => {
    const modal = useModalStore();
    let lastModalConfig: CompletionConfig<unknown> | undefined;
    const openedCompletions = shallowRef<Completion<unknown>[]>([]);
    const interceptors = ref<CompletionInterceptor<unknown>[]>([]);

    const open = async <TItem, TReturn = void>(
      config: CompletionConfig<TItem>,
    ): Promise<TReturn> => {
      const isInputOnly = config.type === 'input';
      const closed = modal.open<TReturn>(AppCompletion, {
        noBodyPadding: true,
        position: 'top',
        mini: isInputOnly,
        modalProps: {
          placeholder: config.placeholder,
          searchText: config.searchText,
        },
      });

      const [result, resolve] = createPromise<TReturn>();
      const completionConfig = {
        ...config,
        itemRenderer: config.itemRenderer ? markRaw(config.itemRenderer) : undefined,
      } as CompletionConfig<unknown>;
      const completion = shallowReactive<Completion<unknown>>({
        ...completionConfig,
        searchQuery: completionConfig.searchText ?? '',
        result,
      });

      openedCompletions.value = [...openedCompletions.value, completion];

      search();
      const res = await closed;
      resolve(res);

      lastModalConfig = completionConfig;
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

    const applyInterceptors = async (
      candidates: CompletionCandidate[],
      completionName: string,
      searchQuery: string,
    ): Promise<CompletionCandidate[]> => {
      const matchingInterceptors = interceptors.value.filter((i) =>
        interceptorMatchesTarget(i.target, completionName),
      );
      const sortedInterceptors = sortInterceptorsByPriority(matchingInterceptors);
      const context: CompletionInterceptorContext = { completionName, searchQuery };

      return await sortedInterceptors.reduce(
        async (prev, interceptor) => interceptor.handler(await prev, context),
        Promise.resolve(candidates),
      );
    };

    const setupCandidates = async (r: CompletionSearchResult, offset: number): Promise<void> => {
      const completion = activeCompletion.value;
      if (!completion) return;

      const completionName = completion.name ?? '';
      const searchQuery = completion.searchQuery;
      const processedCandidates = await applyInterceptors(r.result, completionName, searchQuery);

      if (!activeCompletion.value) return;

      const isLengthChanged = processedCandidates.length !== r.result.length;

      if (!offset) {
        activeCompletion.value.candidates = processedCandidates;
        activeCompletion.value.total = isLengthChanged ? processedCandidates.length : r.total;
        activeCompletion.value.selectedCandidateIndex = 0;
        return;
      }
      if (!activeCompletion.value.candidates) return;

      const indexedCandidates = [...activeCompletion.value.candidates];
      processedCandidates.forEach((v, i) => {
        indexedCandidates[i + offset] = v;
      });
      activeCompletion.value.candidates = indexedCandidates;
      activeCompletion.value.total = isLengthChanged ? indexedCandidates.length : r.total;
    };

    const search = debounce(performSearch, DEFAULT_INPUT_DEBOUNCE, { leading: true });

    watch(
      () => activeCompletion.value?.searchQuery,
      () => search(),
    );

    const registerInterceptor = <T = unknown>(
      interceptor: CompletionInterceptor<T>,
    ): (() => void) => {
      interceptors.value = [...interceptors.value, interceptor as CompletionInterceptor<unknown>];
      return () => {
        interceptors.value = interceptors.value.filter((i) => i !== interceptor);
      };
    };

    const store: CompletionStore = {
      restore,
      close,
      closeAll,
      open,
      activeCompletion,
      nextCandidate,
      previousCandidate,
      search,
      registerInterceptor,
    };

    return store;
  },
);
