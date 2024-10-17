import { EditorView } from '@codemirror/view';
import { useNotifications } from './notification';
import { redo, undo } from '@codemirror/commands';
import { NodeType, OrgNode } from 'org-mode-ast';
import { Command } from 'src/api';
import { useCommandsStore } from 'src/stores/commands';
import { useCompletionStore } from 'src/stores/completion';
import { useNoteEditorStore } from 'src/stores/note-editor';
import { useSearchStore } from 'src/stores/search';
import { insertTemplate, isUrl } from 'src/tools';

import { onBeforeUnmount, onMounted } from 'vue';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { useCurrentNoteStore } from 'src/stores/current-note';
import { getParentDir } from 'orgnote-api/tools';

const group = 'editor';

export const registerEditorCommands = () => {
  const { orgNoteApi } = useOrgNoteApiStore();
  // TODO: migrate to orgnoteapi accessor

  const commandsStore = useCommandsStore();
  const filesStore = orgNoteApi.core.useFilesStore();
  const noteEditorStore = useNoteEditorStore();
  const searchStore = useSearchStore();
  const completionStore = useCompletionStore();
  const notificationStore = useNotifications();
  const currentNoteStore = useCurrentNoteStore();

  const commands: Command[] = [
    {
      command: 'undo',
      icon: 'undo',
      description: 'undo',
      group,
      handler: () => undo(noteEditorStore.editorView as EditorView),
    },
    {
      command: 'redo',
      icon: 'redo',
      description: 'redo',
      group,
      handler: () => redo(noteEditorStore.editorView as EditorView),
    },
    {
      command: 'tab',
      icon: 'keyboard_tab',
      description: 'tab',
      group,
      // TODO: master implement smart tab with jump
      handler: () => notificationStore.notify('not implemented yet'),
    },
    {
      command: 'headline 1',
      icon: 'view_headline',
      description: 'insert a headline',
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
      handler: async () => {
        const currentNotePath = currentNoteStore.currentNote.filePath;
        const filePath = await filesStore.uploadMediaFile(
          getParentDir(currentNotePath)
        );
        return insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template: `[[./${filePath ?? ''}]]`,
          focusOffset: 2,
          overrideLine: true,
        });
      },
    },
    {
      command: 'bold',
      icon: 'format_bold',
      description: 'insert bold text',
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
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
      group,
      handler: () => {
        const now = new Date();
        const weekDay = now.toLocaleDateString('default', {
          weekday: 'short',
        });
        const template = `<${now.toISOString().split('T')[0]} ${weekDay}> `;

        insertTemplate({
          editorView: noteEditorStore.editorView as EditorView,
          template,
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
