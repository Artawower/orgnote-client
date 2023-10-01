import { useFileStore } from './file';
import { EditorView } from 'codemirror';
import { defineStore } from 'pinia';
import { insertTemplate } from 'src/tools';

import { ref } from 'vue';

import { SearchItem } from 'src/components/ui/SearchContainer.vue';

export const useEditorActionsStore = defineStore('editor-actions', () => {
  const fileStore = useFileStore();

  // TODO: master add support for passed orgNode where cursor inside.
  // Add support for selection
  const actions = ref<SearchItem[]>([
    {
      name: 'headline 1',
      icon: 'view_headline',
      description: 'insert a headline',
      handler: (editorView: EditorView) =>
        insertTemplate({ editorView, template: '* ', overrideLine: true }),
    },
    {
      name: 'code',
      icon: 'code',
      description: 'insert src code block',
      handler: (editorView: EditorView) =>
        insertTemplate({
          editorView,
          template: `#+BEGIN_SRC

#+END_SRC`,
          focusOffset: 12,
          overrideLine: true,
        }),
    },
    {
      name: 'quote',
      icon: 'format_quote',
      description: 'insert a quote',
      handler: (editorView: EditorView) =>
        insertTemplate({
          editorView,
          template: `#+BEGIN_QUOTE

#+END_QUOTE`,
          focusOffset: 14,
          overrideLine: true,
        }),
    },
    {
      name: 'latex',
      icon: 'functions',
      description: 'insert a latex block',
      handler: (editorView: EditorView) =>
        insertTemplate({
          editorView,

          template: `#+BEGIN_EXPORT latex

#+END_EXPORT`,
          focusOffset: 12,
          overrideLine: true,
        }),
    },
    {
      name: 'link',
      icon: 'link',
      description: 'insert a link',
      handler: (editorView: EditorView) =>
        insertTemplate({ editorView, template: '[[][]]', focusOffset: 2 }),
    },
    {
      name: 'internal link',
      icon: 'hub',
      description: 'insert note link',
      handler: (editorView: EditorView) =>
        insertTemplate({
          editorView,
          template: '[[]]',
          focusOffset: 2,
          overrideLine: true,
        }),
    },
    {
      name: 'image',
      icon: 'photo',
      description: 'insert an image',
      handler: async (editorView: EditorView) => {
        const fileName = await fileStore.uploadMediaFile();
        return insertTemplate({
          editorView,
          template: `[[${fileName ?? ''}]]`,
          focusOffset: 2,
          overrideLine: true,
        });
      },
    },
  ]);

  const addAction = (action: SearchItem) => {
    actions.value.push(action);
  };

  return {
    actions,
    addAction,
  };
});
