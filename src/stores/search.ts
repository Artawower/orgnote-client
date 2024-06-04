import { useCompletionStore } from './completion';
import { defineStore } from 'pinia';
import {
  CandidateGetterFn,
  CompletionCandidate,
  CompletionSearchResult,
} from 'src/api';
import { NotePreview } from 'src/models';
import { exctractSearchInfo } from 'src/tools';
import { useRouter } from 'vue-router';

import { ref } from 'vue';
import { repositories } from 'src/boot/repositories';

export const useSearchStore = defineStore('search', () => {
  // TODO: master adapt for public search
  // const authStore = useAuthStore();
  const completionStore = useCompletionStore();

  const router = useRouter();

  const query = ref<string>('');
  const searchResults = ref<CompletionCandidate[]>([]);
  const limit = ref<number>(10);
  const offset = ref<number>(0);
  const bookmarkScope = '@bookmark';
  const searchAutocompletions = ref<string[]>([bookmarkScope]);

  // const notesStore = useNotesStore();

  // TODO [completion]: need to allow pagination for scroll event.
  const initCompletion = async (params?: {
    customHandler?: (arg: NotePreview) => void;
    searchText?: string;
  }): Promise<void> => {
    completionStore.filter = params?.searchText ?? '';
    const completionCandidateGetter: CandidateGetterFn<NotePreview> = (
      filter: string,
      limit: number,
      offset: number
    ) =>
      new Promise<CompletionSearchResult<NotePreview>>(
        // eslint-disable-next-line no-async-promise-executor
        async (resolve, reject) => {
          try {
            const { searchQuery, tags, scope } = exctractSearchInfo(filter);
            const total = await repositories.notes.count(searchQuery, tags);
            const bookmarked = scope === bookmarkScope ? true : undefined;

            const notes = await repositories.notes.getNotePreviews({
              limit,
              offset,
              searchText: searchQuery,
              tags,
              bookmarked,
            });

            const completionCandidates: CompletionCandidate<NotePreview>[] =
              notes.map((d) => ({
                command: d.meta.title,
                icon: 'description',
                description: `${d.meta.description ?? ''} \n${
                  d.meta.fileTags?.map((t) => `#${t}`).join(' ') ?? ''
                }`,
                group: 'Notes',
                data: d,
                commandHandler:
                  params?.customHandler ??
                  (() => {
                    // TODO: master url builder from router.
                    router.push(`/note-editor/${d.id}/raw`);
                    completionStore.closeCompletion();
                  }),
              }));

            resolve({
              result: completionCandidates,
              total,
            });
          } catch (e) {
            reject(e);
          }
        }
      );

    completionStore.initNewCompletion({
      itemsGetter: completionCandidateGetter,
      searchAutocompletions: searchAutocompletions.value,
      placeholder: 'search notes',
      searchText: params?.searchText,
    });
    completionStore.openCompletion();
  };

  const searchWithCustom = (handler: (arg0: NotePreview) => void) => {
    initCompletion({ customHandler: handler });
  };

  return {
    searchResults,
    searchWithCustom,
    limit,
    offset,
    query,
    initCompletion,
  };
});
