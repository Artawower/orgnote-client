import {
  CandidateGetterFn,
  CompletionCandidate,
  CompletionSearchResult,
  useCompletionStore,
} from './completion';
import { defineStore } from 'pinia';
import { repositories } from 'src/boot/repositories';
import { NotePreview } from 'src/models';
import { useRouter } from 'vue-router';

import { ref } from 'vue';

export const useSearchStore = defineStore('search', () => {
  // TODO: master adapt for public search
  // const authStore = useAuthStore();
  const completionStore = useCompletionStore();

  const router = useRouter();

  const query = ref<string>('');
  const searchResults = ref<CompletionCandidate[]>([]);
  const limit = ref<number>(10);
  const offset = ref<number>(0);

  // const notesStore = useNotesStore();

  // TODO [completion]: need to allow pagination for scroll event.
  const initCompletion = async (
    customHandler?: (arg: NotePreview) => void
  ): Promise<void> => {
    const completionCandidateGetter: CandidateGetterFn<NotePreview> = (
      filter: string,
      limit: number,
      offset: number
    ) =>
      new Promise<CompletionSearchResult<NotePreview>>(
        async (resolve, reject) => {
          // const userId = authStore.user.id;

          try {
            const total = await repositories.notes.count(filter);
            const notes = await repositories.notes.getNotePreviews(
              limit,
              offset,
              filter
            );

            const completionCandidates: CompletionCandidate<NotePreview>[] =
              notes.map((d) => ({
                command: d.meta.title,
                icon: 'description',
                description: d.meta.description,
                group: 'Notes',
                data: d,
                commandHandler:
                  customHandler ??
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
      placeholder: 'search notes',
    });
  };

  const searchWithCustom = (handler: (arg0: NotePreview) => void) => {
    initCompletion(handler);
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
