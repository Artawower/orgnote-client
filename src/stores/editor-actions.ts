import { EditorView } from 'codemirror';
import { defineStore } from 'pinia';
import { insertTemplate } from 'src/tools';

import { ref } from 'vue';

import { SearchItem } from 'src/components/ui/SearchContainer.vue';

export const useEditorActionsStore = defineStore('editor-actions', () => {
  const actions = ref<SearchItem[]>([
    {
      name: 'Headline 1',
      icon: 'view_headline',
      description: 'Insert a headline',
      handler: (editorView: EditorView) => insertTemplate(editorView, '* '),
    },
    {
      name: 'Code',
      icon: 'code',
      description: 'insert src code block',
      handler: (editorView: EditorView) =>
        insertTemplate(
          editorView,
          `#+BEGIN_SRC

#+END_SRC`,
          12
        ),
    },
    {
      name: 'Quote',
      icon: 'format_quote',
      description: 'insert a quote',
      handler: (editorView: EditorView) =>
        insertTemplate(
          editorView,
          `#+BEGIN_QUOTE

#+END_QUOTE`,
          14
        ),
    },
    {
      name: 'Latex',
      icon: 'functions',
      description: 'insert a latex block',
      handler: (editorView: EditorView) =>
        insertTemplate(
          editorView,
          `#+BEGIN_EXPORT latex

#+END_EXPORT`,
          21
        ),
    },
    {
      name: 'Link',
      icon: 'link',
      description: 'insert a link',
      handler: (editorView: EditorView) =>
        insertTemplate(editorView, '[[][]]', 2),
    },
    {
      name: 'internal link',
      icon: 'hub',
      description: 'insert note link',
      handler: (editorView: EditorView) =>
        insertTemplate(editorView, '[[]]', 2),
    },
    {
      name: 'image',
      icon: 'photo',
      description: 'insert an image',
      handler: (editorView: EditorView) =>
        insertTemplate(editorView, '[[]]', 2),
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
