import { EditorView } from 'codemirror';
import { redo, undo } from '@codemirror/commands';
import { undo, redo } from '@codemirror/commands';
import { Command } from 'src/models';
import {
  useCommandsStore,
  useCompletionStore,
  useFileStore,
  useNoteEditorStore,
  useSearchStore,
} from 'src/stores';
import { insertTemplate } from 'src/tools';

import { onBeforeUnmount, onMounted } from 'vue';
import { useNotifications } from './notification';

export const registerEditorCommands = () => {
  const commandsStore = useCommandsStore();
  const fileStore = useFileStore();
  const noteEditorStore = useNoteEditorStore();
  const searchStore = useSearchStore();
  const completionStore = useCompletionStore();
  const notificationStore = useNotifications();

  const commands: Command[] = [
    {
      command: 'undo',
      icon: 'undo',
      description: 'undo',
      group: 'editor',
      handler: () => undo(noteEditorStore.editorView as EditorView),
    },
    {
      command: 'redo',
      icon: 'redo',
      description: 'redo',
      group: 'editor',
      handler: () => redo(noteEditorStore.editorView as EditorView),
    },
    {
      command: 'tab',
      icon: 'keyboard_tab',
      description: 'tab',
      group: 'editor',
      // TODO: master implement smart tab with jump
      handler: () => notificationStore.notify('not implemented yet'),
    },
    {
      command: 'headline 1',
      icon: 'view_headline',
      description: 'insert a headline',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '* ',
          overrideLine: true,
        }),
    },
    {
      command: 'code',
      icon: 'code',
      description: 'insert src code block',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: `#+BEGIN_SRC

#+END_SRC`,
          focusOffset: 12,
          overrideLine: true,
        }),
    },
    {
      command: 'quote',
      group: 'editor',
      icon: 'format_quote',
      description: 'insert a quote',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: `#+BEGIN_QUOTE

#+END_QUOTE`,
          focusOffset: 14,
          overrideLine: true,
        }),
    },
    {
      command: 'latex',
      icon: 'functions',
      group: 'editor',
      description: 'insert a latex block',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: `#+BEGIN_EXPORT latex

#+END_EXPORT`,
          focusOffset: 21,
          overrideLine: true,
        }),
    },
    {
      command: 'link',
      icon: 'link',
      description: 'insert a link',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '[[][]]',
          focusOffset: 2,
        }),
    },
    {
      command: 'internal link',
      icon: 'hub',
      description: 'insert note link',
      group: 'editor',
      handler: () => {
        searchStore.searchWithCustom((note) => {
          const connectedUrl = `[[id:${note.id}][${note.meta.title}]]`;
          insertTemplate({
            editorView: noteEditorStore.editorView as EditorView,
            template: connectedUrl,
            focusOffset: connectedUrl.length - 2,
          });
        });
        completionStore.openCompletion();
      },
    },
    {
      command: 'image',
      icon: 'photo',
      description: 'insert an image',
      group: 'editor',
      handler: async () => {
        const fileName = await fileStore.uploadMediaFile();
        return insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: `[[${fileName ?? ''}]]`,
          focusOffset: 2,
          overrideLine: true,
        });
      },
    },
    {
      command: 'bold',
      icon: 'format_bold',
      description: 'insert bold text',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '**',
          focusOffset: 1,
        }),
    },
    {
      command: 'italic',
      icon: 'format_italic',
      description: 'insert italic text',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '//',
          focusOffset: 1,
        }),
    },
    {
      command: 'strike through',
      icon: 'format_strikethrough',
      description: 'insert strike through text',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '++',
          focusOffset: 1,
        }),
    },
    {
      command: 'inline code',
      icon: 'data_object',
      description: 'insert inline code',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '==',
          focusOffset: 1,
        }),
    },
    {
      command: 'bullet list',
      icon: 'list',
      description: 'insert bullet list',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '- ',
        }),
    },
    {
      command: 'numeric list',
      icon: 'format_list_numbered',
      description: 'insert numeric list',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '1. ',
        }),
    },
    {
      command: 'check list',
      icon: 'checklist',
      description: 'insert check list',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '- [ ] ',
        }),
    },
    {
      command: 'horizontal rule',
      icon: 'horizontal_rule',
      description: 'insert horizontal line',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '-----\n',
        }),
    },
    {
      command: 'html',
      icon: 'html',
      description: 'insert html code block',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '#+BEGIN_HTML\n\n#+END_HTML',
          focusOffset: 13,
        }),
    },
    {
      command: 'checkbox',
      icon: 'check_box',
      description: 'insert checkbox',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '[ ] ',
        }),
    },
    {
      command: 'table',
      icon: 'grid_on',
      description: 'insert table',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '\n| ',
        }),
    },
  ];

  commandsStore.register(...commands);
};

export const useEditorCommands = () => {
  const commandsStore = useCommandsStore();

  onMounted(() => commandsStore.activateGroup('editor'));
  onBeforeUnmount(() => commandsStore.deactivateGroup('editor'));
};
