import { ref } from 'vue';
import { sdk } from 'src/boot/axios';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { CompletionCandidate, useCompletionStore } from './completion';
import { useRouter } from 'vue-router';

export const useSearchStore = defineStore('search', () => {
  const authStore = useAuthStore();
  const completionStore = useCompletionStore();

  const router = useRouter();

  const query = ref<string>('');
  const searchResults = ref<CompletionCandidate[]>([]);
  const limit = ref<number>(10);
  const offset = ref<number>(0);

  // TODO [completion]: need to allow pagination for scroll event.
  const initCompletionCandidatesGetter = async (): void => {
    const completionCandidateGetter = (filter: string) =>
      new Promise<CompletionCandidate[]>(async (resolve, reject) => {
        const userId = authStore.user.id;

        try {
          const res = await sdk.notes.notesGet(
            limit.value,
            offset.value,
            userId,
            filter
          );
          const data = res.data.data;

          const completionCandidates: CompletionCandidate[] = data.map((d) => ({
            command: d.meta.title,
            icon: 'description',
            description: d.meta.description,
            group: 'Notes',
            data: d,
            commandHandler: () => {
              router.push(`/detail/${d.id}`);
              completionStore.closeCompletion();
            },
          }));

          resolve(completionCandidates);
        } catch (e) {
          reject(e);
        }
      });

    completionStore.setCandidateGetter(completionCandidateGetter);
  };

  return {
    searchResults,
    // search,
    limit,
    offset,
    query,
    initCompletionCandidatesGetter,
  };
});
