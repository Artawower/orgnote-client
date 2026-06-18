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
import { computed, shallowRef, shallowReactive, ref, markRaw, toValue } from 'vue';
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

    const isLoading = ref(false);
    let searchVersion = 0;

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

    const getSelectedCandidate = (): CompletionCandidate | undefined => {
      const completion = activeCompletion.value;
      if (!completion) return;
      const selectedIndex = completion.selectedCandidateIndex ?? 0;
      return completion.candidates?.[selectedIndex];
    };

    const getSelectedCandidateTitle = (): string | undefined => {
      const title = toValue(getSelectedCandidate()?.title);
      return typeof title === 'string' ? title : undefined;
    };

    const isAutocompleteMatch = (searchQuery: string, title: string): boolean => {
      if (!searchQuery) return true;
      return title.toLowerCase().startsWith(searchQuery.toLowerCase());
    };

    const canAcceptAutocomplete = (): boolean => {
      const completion = activeCompletion.value;
      const title = getSelectedCandidateTitle();
      if (completion?.type !== 'input-choice' || title === undefined) return false;
      return isAutocompleteMatch(completion.searchQuery, title);
    };

    const acceptAutocomplete = (): void => {
      const completion = activeCompletion.value;
      if (completion?.type !== 'input-choice') return;
      const title = getSelectedCandidateTitle();
      if (title === undefined || !isAutocompleteMatch(completion.searchQuery, title)) return;
      completion.searchQuery = title;
    };

    const performSearch = (limit?: number, offset: number = 0) => {
      if (!activeCompletion.value) return;
      if (activeCompletion.value.type === 'input') return;

      const { config } = useConfigStore();
      limit = config.completion.defaultCompletionLimit;

      const query = activeCompletion.value.searchQuery;
      const version = ++searchVersion;
      isLoading.value = true;

      const res = activeCompletion.value.itemsGetter(query, limit, offset);
      if (typeof (res as Promise<CompletionSearchResult>)?.then === 'function') {
        (res as Promise<CompletionSearchResult>)
          .then((r) => {
            if (version !== searchVersion) return;
            return setupCandidates(r, offset, version);
          })
          .finally(() => {
            if (version === searchVersion) isLoading.value = false;
          });
        return;
      }
      setupCandidates(res as CompletionSearchResult, offset, version).finally(() => {
        if (version === searchVersion) isLoading.value = false;
      });
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

    const setupCandidates = async (
      r: CompletionSearchResult,
      offset: number,
      version: number,
    ): Promise<void> => {
      const completion = activeCompletion.value;
      if (!completion) return;

      const completionName = completion.name ?? '';
      const searchQuery = completion.searchQuery;
      const processedCandidates = await applyInterceptors(r.result, completionName, searchQuery);

      if (version !== searchVersion) return;
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
      canAcceptAutocomplete,
      acceptAutocomplete,
      search,
      registerInterceptor,
      isLoading,
    };

    return store;
  },
);
