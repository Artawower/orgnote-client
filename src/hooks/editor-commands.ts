import { useNotifications } from './notification';
import { redo, undo } from '@codemirror/commands';
import { foldAll, unfoldAll } from '@codemirror/language';
import { EditorView } from 'codemirror';
import { NodeType, OrgNode } from 'org-mode-ast';
import { Command } from 'src/models';
import {
  useCommandsStore,
  useCompletionStore,
  useFileStore,
  useNoteEditorStore,
  useSearchStore,
} from 'src/stores';
import { insertTemplate, isUrl } from 'src/tools';

import { onBeforeUnmount, onMounted } from 'vue';

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
      description: 'insert a link (url)',
      group: 'editor',
      handler: async () => {
        const text = await navigator.clipboard.readText();
        const insertedUrl = isUrl(text) ? text : '';
        const template = `[[${insertedUrl}][]]`;
        const focusOffset = insertedUrl ? insertedUrl.length + 4 : 2;
        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template,
          focusOffset,
        });
      },
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
      command: 'strikethrough',
      icon: 'format_strikethrough',
      description: 'insert strikethrough text',
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
    {
      command: 'tag',
      icon: 'tag',
      description: 'insert tags',
      group: 'editor',
      handler: () => {
        let titleNode: OrgNode;
        const filetagKeyword = noteEditorStore.orgTree.children.find((c) => {
          if (c.isNot(NodeType.Keyword)) {
            return;
          }
          // TODO: master magic strings to constants
          if (c.children?.first?.rawValue.toLowerCase() === '#+title: ') {
            titleNode = c;
          }
          return c.children?.first?.rawValue.toLowerCase() === '#+filetags: ';
        });
        if (filetagKeyword) {
          noteEditorStore.editorView.dispatch({
            selection: { anchor: filetagKeyword.end, head: filetagKeyword.end },
            scrollIntoView: true,
          });
          return;
        }
        if (titleNode) {
          noteEditorStore.editorView.dispatch({
            changes: {
              from: titleNode.end,
              to: titleNode.end,
              insert: '\n#+FILETAGS: ::',
            },
            selection: { anchor: titleNode.end + 14, head: titleNode.end + 14 },
            scrollIntoView: true,
          });
          return;
        }
      },
    },
    {
      command: 'datetime',
      icon: 'calendar_today',
      description: 'insert datetime',
      group: 'editor',
      handler: () => {
        const now = new Date();
        const weekDay = now.toLocaleDateString('default', {
          weekday: 'short',
        });
        const template = `<${now.getFullYear()}-${
          now.getMonth() + 1
        }-${now.getDate()} ${weekDay}> `;

        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template,
        });
      },
    },
    {
      command: 'unfold all',
      icon: 'unfold_more',
      description: 'unfold all headlines',
      group: 'editor',
      handler: () => {
        unfoldAll(noteEditorStore.editorView as EditorView);
      },
    },
    {
      command: 'fold all',
      icon: 'unfold_less',
      description: 'fold all headlines',
      group: 'editor',
      handler: () => {
        foldAll(noteEditorStore.editorView as EditorView);
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
