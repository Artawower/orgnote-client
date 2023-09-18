import { ref } from 'vue';
import { sdk } from 'src/boot/axios';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import {
  CandidateGetterFn,
  CompletionCandidate,
  CompletionSearchResult,
  useCompletionStore,
} from './completion';
import { useRouter } from 'vue-router';
import { useNotesStore } from './notes';
import { repositories } from 'src/boot/repositories';

export const useSearchStore = defineStore('search', () => {
  // TODO: master adapt for public search
  const authStore = useAuthStore();
  const completionStore = useCompletionStore();

  const router = useRouter();

  const query = ref<string>('');
  const searchResults = ref<CompletionCandidate[]>([]);
  const limit = ref<number>(10);
  const offset = ref<number>(0);

  // const notesStore = useNotesStore();

  // TODO [completion]: need to allow pagination for scroll event.
  const initCompletion = async (): Promise<void> => {
    const completionCandidateGetter: CandidateGetterFn = (
      filter: string,
      limit: number,
      offset: number
    ) =>
      new Promise<CompletionSearchResult>(async (resolve, reject) => {
        // const userId = authStore.user.id;

        try {
          // const res = await sdk.notes.notesGet(
          //   limit.value,
          //   offset.value,
          //   userId,
          //   filter
          // );
          // const data = res.data.data;

          // const notes = await repositories.notes.getNotePreviews(
          //   limit,
          //   offset,
          //   filter
          // );

          const total = await repositories.notes.count(filter);
          const notes = await repositories.notes.getNotePreviews(
            limit,
            offset,
            filter
          );

          const completionCandidates: CompletionCandidate[] = notes.map(
            (d) => ({
              command: d.meta.title,
              icon: 'description',
              description: d.meta.description,
              group: 'Notes',
              data: d,
              commandHandler: () => {
                router.push(`/detail/${d.id}`);
                completionStore.closeCompletion();
              },
            })
          );

          resolve({
            result: completionCandidates,
            total,
          });
        } catch (e) {
          reject(e);
        }
      });

    completionStore.initNewCompletion({
      itemsGetter: completionCandidateGetter,
      placeholder: 'search notes',
    });
  };

  return {
    searchResults,
    limit,
    offset,
    query,
    initCompletion,
  };
});
