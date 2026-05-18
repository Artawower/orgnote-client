<template>
  <div ref="containerRef" class="org-inline-editor" />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { EditorView, keymap, placeholder as cmPlaceholder, ViewPlugin } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands';
import { bracketMatching, syntaxTree } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { Decoration } from '@codemirror/view';
import type { Range } from '@codemirror/state';
import { orgMode } from 'src/containers/RichEditor/org-parser';

interface Props {
  modelValue: string;
  placeholder?: string;
  readonly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  autofocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  readonly: false,
  minHeight: '60px',
  maxHeight: '200px',
  autofocus: false,
});

const emit = defineEmits<{
  'update:modelValue': [string];
  focus: [];
  blur: [];
  submit: [];
  escape: [];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
let view: EditorView | undefined;

const level1WarningMark = Decoration.mark({ class: 'cm-headline-warning' });

const buildWarningDecorations = (v: EditorView): DecorationSet => {
  const ranges: Range<Decoration>[] = [];
  syntaxTree(v.state).iterate({
    enter(node) {
      if (node.name !== 'Headline-1') return;
      ranges.push(level1WarningMark.range(node.from, node.to));
    },
  });
  return Decoration.set(ranges, true);
};

const level1WarningPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(v: EditorView) {
      this.decorations = buildWarningDecorations(v);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildWarningDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);

const customKeymap = keymap.of([
  {
    key: 'Mod-Enter',
    run: () => {
      emit('submit');
      return true;
    },
  },
  {
    key: 'Escape',
    run: () => {
      emit('escape');
      return true;
    },
  },
]);

const buildExtensions = () => [
  history(),
  bracketMatching(),
  closeBrackets(),
  EditorView.lineWrapping,
  EditorView.theme({
    '&': {
      minHeight: props.minHeight,
      maxHeight: props.maxHeight,
      overflow: 'auto',
    },
  }),
  customKeymap,
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap]),
  props.placeholder ? cmPlaceholder(props.placeholder) : [],
  orgMode(),
  level1WarningPlugin,
  EditorState.readOnly.of(props.readonly),
  EditorView.updateListener.of((update) => {
    if (!update.docChanged) return;
    emit('update:modelValue', update.state.doc.toString());
  }),
  EditorView.domEventHandlers({
    focus: () => emit('focus'),
    blur: () => emit('blur'),
  }),
];

onMounted(() => {
  if (!containerRef.value) return;
  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: buildExtensions(),
    }),
    parent: containerRef.value,
  });
  if (props.autofocus) view.focus();
});

onUnmounted(() => {
  view?.destroy();
  view = undefined;
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === newVal) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: newVal },
    });
  },
);

const focus = (): void => view?.focus();
const blur = (): void => (view?.contentDOM as HTMLElement | undefined)?.blur();
const getView = (): EditorView | undefined => view;

defineExpose({ focus, blur, getView });
</script>

<style lang="scss" scoped>
.org-inline-editor {
  :deep(.cm-editor) {
    font-family: inherit;
    font-size: var(--font-size-md);
    color: var(--fg);
    background: var(--bg);
    outline: none;

    &.cm-focused {
      outline: none;
    }
  }

  :deep(.cm-content) {
    padding: 0;
    caret-color: var(--accent);
  }

  :deep(.cm-placeholder) {
    color: var(--fg-muted);
  }

  :deep(.cm-headline-warning) {
    text-decoration: underline wavy var(--red);
  }
}
</style>
