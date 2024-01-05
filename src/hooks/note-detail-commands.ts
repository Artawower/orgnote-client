import { Command } from 'src/api';
import {
  useCommandsStore,
  useCurrentNoteStore,
  useNotesStore,
} from 'src/stores';
import { useRouter } from 'vue-router';

import { onBeforeUnmount, onMounted } from 'vue';

export const registerNoteDetailCommands = () => {
  const commandsStore = useCommandsStore();
  const currentNoteStore = useCurrentNoteStore();
  const notesStore = useNotesStore();
  const router = useRouter();

  const commands: Command[] = [
    {
      command: 'toggle bookmark',
      icon: () => {
        const isBookmarked = currentNoteStore.currentNote?.bookmarked;
        return isBookmarked ? 'o_bookmark_added' : 'o_bookmark';
      },
      title: () => {
        const isBookmarked = currentNoteStore.currentNote?.bookmarked;
        return isBookmarked ? 'remove bookmark' : 'add bookmark';
      },
      description: 'toggle bookmark',
      group: 'note-detail',
      handler: () => {
        notesStore.toggleBookmark(currentNoteStore.currentNote);
      },
    },
    {
      command: 'delete note',
      icon: () => 'delete',
      group: 'note-detail',
      handler: () => {
        if (!currentNoteStore.currentNote?.id) {
          return;
        }
        notesStore.markAsDeleted([currentNoteStore.currentNote.id]);
        router.push('/');
      },
    },
  ];

  commandsStore.register(...commands);
};

export const useDetailCommands = () => {
  const commandsStore = useCommandsStore();

  onMounted(() => commandsStore.activateGroup('note-detail'));
  onBeforeUnmount(() => commandsStore.deactivateGroup('note-detail'));
};
