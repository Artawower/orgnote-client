<template>
  <div id="editor" ref="editorRef"></div>
</template>

<!-- WYSWYG editor adaptet to org mode format -->
<script lang="ts" setup>
import { MarkType, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { onMounted, ref } from 'vue';
import { NodeType, parse, walkTree } from 'org-mode-ast';

const editorRef = ref<HTMLElement>(null);

// const headlineMark = new MarkType({
//   name: 'headline',
//   attrs: {
//     fontSize: { default: '20px' }, // Define a default value for the font size attribute
//   },
// });
//
onMounted(() => {
  const noteSchema = new Schema({
    ...schema.spec,
    // nodes: {
    //   // headline: {
    //   //   content: 'text*',
    //   //   toDOM() {
    //   //     return ['headline', 0];
    //   //   },
    //   //   parseDOM: [{ tag: 'headline' }],
    //   // },
    //   doc: {
    //     content: '(headline | note)+',
    //   },
    //   text: {
    //     group: 'inline',
    //   },
    // },
    marks: {
      headline: {
        attrs: {
          // fontSize: { default: '20px' }, // Define a default value for the font size attribute
        },
      },
    },
  });
  let state = EditorState.create({ schema: noteSchema });
  let view = new EditorView(editorRef.value, { state });
  view.dom.addEventListener('input', () => {
    const doc = parse(view.state.doc.textContent);
    const tr = state.tr;
    let changed = false;
    walkTree(doc, (node) => {
      if (node.is(NodeType.Headline)) {
        changed = true;
        tr.addMark(node.start, node.end, noteSchema.marks.headline.create());
      }
      return false;
    });
    if (changed) {
      view.dispatch(tr);
    }
  });
});
</script>

<style lang="scss">
#editor {
  font-family: charter, Georgia, Cambria, 'Times New Roman', Times, serif;
  height: calc(100vh - 88px);
}

.ProseMirror {
  height: 100%;
}
</style>
