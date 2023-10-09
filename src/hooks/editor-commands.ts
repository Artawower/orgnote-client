import { EditorView } from 'codemirror';
import { Command } from 'src/models';
import { useCommandsStore, useFileStore, useNoteEditorStore } from 'src/stores';
import { insertTemplate } from 'src/tools';

import { onBeforeUnmount, onMounted } from 'vue';

export const registerEditorCommands = () => {
  const commandsStore = useCommandsStore();
  const fileStore = useFileStore();
  const noteEditorStore = useNoteEditorStore();

  const commands: Command[] = [
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
          focusOffset: 12,
          overrideLine: true,
        }),
    },
    {
      command: 'link',
      icon: 'link',
      description: 'insert a link',
      group: 'editor',
      handler: () =>
        insertTemplate({ editorView, template: '[[][]]', focusOffset: 2 }),
    },
    {
      command: 'internal link',
      icon: 'hub',
      description: 'insert note link',
      group: 'editor',
      handler: () =>
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: '[[]]',
          focusOffset: 2,
          overrideLine: true,
        }),
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
  ];

  commandsStore.register(...commands);
};

export const useEditorCommands = () => {
  const commandsStore = useCommandsStore();

  onMounted(() => commandsStore.activateGroup('editor'));
  onBeforeUnmount(() => commandsStore.deactivateGroup('editor'));
};
