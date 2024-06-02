import { foldAll, unfoldAll } from '@codemirror/language';
import { Command, CommandGroup } from 'src/api';
import { useRouter } from 'vue-router';

import { onBeforeUnmount, onMounted } from 'vue';
import { useCommandsStore } from 'src/stores/commands';
import { useCurrentNoteStore } from 'src/stores/current-note';
import { useNoteEditorStore } from 'src/stores/note-editor';
import { useNotesStore } from 'src/stores/notes';
import { EditorView } from '@codemirror/view';

const group: CommandGroup = 'note-detail';

export const registerNoteDetailCommands = () => {
  const commandsStore = useCommandsStore();
  const currentNoteStore = useCurrentNoteStore();
  const notesStore = useNotesStore();
  const router = useRouter();
  const noteEditorStore = useNoteEditorStore();

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
      group,
      handler: () => {
        notesStore.toggleBookmark(currentNoteStore.currentNote);
      },
    },
    {
      command: 'delete note',
      icon: () => 'delete',
      group,
      handler: () => {
        if (!currentNoteStore.currentNote?.id) {
          return;
        }
        notesStore.markAsDeleted([currentNoteStore.currentNote.id]);
        router.push('/');
      },
    },
    {
      command: 'unfold all',
      icon: 'unfold_more',
      description: 'unfold all headlines',
      group,
      handler: () => {
        unfoldAll(noteEditorStore.editorView as EditorView);
      },
    },
    {
      command: 'fold all',
      icon: 'unfold_less',
      description: 'fold all headlines',
      group,
      handler: () => {
        foldAll(noteEditorStore.editorView as EditorView);
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
