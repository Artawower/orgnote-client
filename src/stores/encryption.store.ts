import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useNotesStore } from './notes';
import { useEncryption } from 'src/hooks';
import { repositories } from 'src/repositories';
import { isGpgEncrypted } from 'src/tools/is-gpg-encrypted';

export const useEncryptionStore = defineStore('encryption', () => {
  // TODO: feat/encryption implement progress
  const encryptionProgress = ref<number>(null);

  const { decrypt } = useEncryption();
  const notesStore = useNotesStore();

  const decryptExistingNotes = async () => {
    const encryptedNoteIds = await repositories.notes.getIds((n) =>
      isGpgEncrypted(n.content)
    );

    for (const id of encryptedNoteIds) {
      console.log('✎: [line 23][encryption.store.ts] id: ', id);
      const note = await repositories.notes.getById(id);
      note.content = await decrypt(note.content);
      await repositories.notes.putNote(note);
    }

    await notesStore.loadNotes();
  };

  return {
    encryptionProgress,
    decryptExistingNotes,
  };
});
