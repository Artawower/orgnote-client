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

  const { decryptNote } = useEncryption();
  const notesStore = useNotesStore();
  const syncStore = useSyncStore();
  const currentNoteStore = useCurrentNoteStore();

  const changeEncryptionType = async () => {
    const encryptedNoteIds = await repositories.notes.getIds((n) =>
      isGpgEncrypted(n.content)
    );

    for (const id of encryptedNoteIds) {
      await decryptNoteById(id);
    }

    await notesStore.loadNotes();
    await updateEncryptedNotesDate();
    await syncStore.sync();
    await currentNoteStore.reloadCurrentNote();
  };

  const updateEncryptedNotesDate = async () => {
    const encryptedNotes = await repositories.notes.getIds(
      (n) => !n.meta.published
    );
    const notesUpdates = encryptedNotes.map((id) => ({
      id,
      changes: { updatedAt: new Date().toISOString() },
    }));

    await notesStore.bulkPathNotesLocally(notesUpdates);
  };

  const { handleError } = useEncryptionErrorHandler();

  const decryptNoteById = async (noteId: string) => {
    try {
      const note = await repositories.notes.getById(noteId);
      const decryptedNote = await decryptNote(note);
      await repositories.notes.putNote(decryptedNote);
    } catch (e) {
      handleError(e as Error);
    }
  };

  return {
    encryptionProgress,
    changeEncryptionType,
  };
});
