import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useNotesStore } from './notes';
import { useEncryption } from 'src/hooks';
import { repositories } from 'src/repositories';
import { isGpgEncrypted } from 'src/tools/is-gpg-encrypted';
import { useEncryptionErrorHandler } from 'src/hooks/use-encryption-error-handler';
import { useSyncStore } from './sync';
import { useCurrentNoteStore } from './current-note';

export const useEncryptionStore = defineStore('encryption', () => {
  // TODO: feat/encryption implement progress
  const encryptionProgress = ref<number>(null);

  const { decrypt } = useEncryption();
  const notesStore = useNotesStore();
  const syncStore = useSyncStore();
  const currentNoteStore = useCurrentNoteStore();

  const decryptExistingNotes = async () => {
    const encryptedNoteIds = await repositories.notes.getIds((n) =>
      isGpgEncrypted(n.content)
    );

    for (const id of encryptedNoteIds) {
      await decryptNote(id);
    }

    await notesStore.loadNotes();
    await syncStore.sync();
    await currentNoteStore.reloadCurrentNote();
  };

  const { handleError } = useEncryptionErrorHandler();

  const decryptNote = async (noteId: string) => {
    try {
      const note = await repositories.notes.getById(noteId);
      note.content = await decrypt(note.content);
      await repositories.notes.putNote(note);
    } catch (e) {
      handleError(e as Error);
    }
  };

  return {
    encryptionProgress,
    decryptExistingNotes,
  };
});
