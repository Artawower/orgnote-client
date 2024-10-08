import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useNotesStore } from './notes';
import { useEncryption } from 'src/hooks';
import { useEncryptionErrorHandler } from 'src/hooks/use-encryption-error-handler';
import { useSyncStore } from './sync';
import { useCurrentNoteStore } from './current-note';
import { repositories } from 'src/boot/repositories';
import { isGpgEncrypted } from 'orgnote-api';

export const useEncryptionStore = defineStore('encryption', () => {
  // TODO: implement progress.
  // Use progress store ?
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
    const note = await repositories.notes.getById(noteId);
    try {
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
