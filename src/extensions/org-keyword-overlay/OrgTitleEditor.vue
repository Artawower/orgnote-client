<template>
  <hoverable-area class="keyword-editor title-editor">
    <app-text-area
      v-if="!readonly"
      ref="textAreaRef"
      class="input"
      :model-value="value"
      :placeholder="placeholder"
      :rows="1"
      auto-grow
      @keydown="handleKeydown"
      @blur="commit"
    />
    <span v-else class="text" :class="{ 'empty-text': !value }">
      {{ value || placeholder }}
    </span>
  </hoverable-area>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { OrgNode } from 'org-mode-ast';
import type { EditorView } from '@codemirror/view';
import { useI18n } from 'vue-i18n';
import { I18N } from 'orgnote-api';
import AppTextArea from 'src/components/AppTextArea.vue';
import HoverableArea from 'src/components/HoverableArea.vue';
import {
  EMBEDDED_WIDGET_COMMAND,
  EMBEDDED_WIDGET_DIRECTION,
  getEmbeddedWidgetBridge,
} from 'src/utils/org-editor/embedded-widget-runtime';
import { titleWidgetId as buildTitleWidgetId } from './title-widget-id';
import { getKeywordMarker, getKeywordValue } from './utils';

const NEWLINE = '\n';
const skippedAutoFocusPositions = new Set<number>();

interface TextAreaHandle {
  focusAt: (position: 'start' | 'end') => void;
  focusEnd: () => void;
}

const props = withDefaults(
  defineProps<{
    node: OrgNode;
    editorView: EditorView;
    readonly?: boolean;
  }>(),
  { readonly: false },
);

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const textAreaRef = ref<TextAreaHandle | null>(null);
let unregisterWidget: (() => void) | undefined;
const shouldSkipBlurCommit = ref(false);
const value = computed(() => getKeywordValue(props.node));
const placeholder = computed(() => t(I18N.UNTITLED));
const marker = computed(() => getKeywordMarker(props.node));

const normalizeKeywordValue = (next: string): string => next.trim().replace(/\s+/g, ' ');

const buildLine = (next: string): string => {
  const normalized = normalizeKeywordValue(next);
  if (!normalized) return marker.value;
  return `${marker.value} ${normalized}`;
};

const isEditorSelectionInsideKeyword = (): boolean => {
  const head = props.editorView.state.selection.main.head;
  return props.editorView.hasFocus && head >= props.node.start && head <= props.node.end;
};

const waitForWidgetDomUpdate = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const dispatchKeywordUpdate = (next: string, anchor?: number, anchorAssoc = 1): void => {
  const insert = buildLine(next);
  const shouldUpdate =
    insert !== props.editorView.state.doc.sliceString(props.node.start, props.node.end);
  const changes = shouldUpdate
    ? props.editorView.state.changes({ from: props.node.start, to: props.node.end, insert })
    : undefined;
  const mappedAnchor =
    anchor !== undefined && changes ? changes.mapPos(anchor, anchorAssoc) : anchor;

  if (!shouldUpdate && mappedAnchor === undefined) return;

  props.editorView.dispatch({
    ...(changes ? { changes } : {}),
    ...(mappedAnchor !== undefined
      ? { selection: { anchor: mappedAnchor }, scrollIntoView: true }
      : {}),
  });
};

const suppressNextAutoFocus = (): void => {
  skippedAutoFocusPositions.add(props.node.start);
};

const skipBlurCommit = (): void => {
  shouldSkipBlurCommit.value = true;
};

const commitValue = (textArea: HTMLTextAreaElement): void => {
  dispatchKeywordUpdate(textArea.value);
};

const titleWidgetId = computed(() => buildTitleWidgetId(props.node.start));
const titleRange = computed(() => ({ from: props.node.start, to: props.node.end }));

const currentTitleLineRange = (): { from: number; to: number } => {
  const line = props.editorView.state.doc.lineAt(props.node.start);
  return { from: line.from, to: line.to };
};

const moveToAdjacentEditorTarget = async (
  textArea: HTMLTextAreaElement,
  direction: typeof EMBEDDED_WIDGET_DIRECTION.Previous | typeof EMBEDDED_WIDGET_DIRECTION.Next,
): Promise<void> => {
  suppressNextAutoFocus();
  dispatchKeywordUpdate(textArea.value);
  const range = currentTitleLineRange();
  await waitForWidgetDomUpdate();
  getEmbeddedWidgetBridge(props.editorView).dispatch({
    type: EMBEDDED_WIDGET_COMMAND.Exit,
    payload: {
      sourceId: titleWidgetId.value,
      range,
      direction,
    },
  });
};

const moveDown = async (textArea: HTMLTextAreaElement): Promise<void> => {
  await moveToAdjacentEditorTarget(textArea, EMBEDDED_WIDGET_DIRECTION.Next);
};

const moveUp = async (textArea: HTMLTextAreaElement): Promise<void> => {
  await moveToAdjacentEditorTarget(textArea, EMBEDDED_WIDGET_DIRECTION.Previous);
};

const focusEditorLine = (anchor: number): void => {
  props.editorView.dispatch({ selection: { anchor }, scrollIntoView: true });
  props.editorView.focus();
};

const insertEditorLineAfter = (position: number): void => {
  const changes = props.editorView.state.changes({ from: position, to: position, insert: NEWLINE });
  const anchor = changes.mapPos(position, 1);
  props.editorView.dispatch({ changes, selection: { anchor }, scrollIntoView: true });
  props.editorView.focus();
};

const focusEditorLineAfterTitle = (): void => {
  const line = props.editorView.state.doc.lineAt(props.node.start);
  const nextLineNumber = line.number + 1;

  if (nextLineNumber > props.editorView.state.doc.lines) {
    insertEditorLineAfter(line.to);
    return;
  }

  const nextLine = props.editorView.state.doc.line(nextLineNumber);
  if (nextLine.text.trim()) {
    insertEditorLineAfter(line.to);
    return;
  }

  focusEditorLine(nextLine.from);
};

const commitAndFocusEditorLineAfterTitle = (textArea: HTMLTextAreaElement): void => {
  suppressNextAutoFocus();
  dispatchKeywordUpdate(textArea.value);
  focusEditorLineAfterTitle();
};

const deleteKeyword = (): void => {
  const line = props.editorView.state.doc.lineAt(props.node.start);
  const to = line.to < props.editorView.state.doc.length ? line.to + 1 : line.to;

  suppressNextAutoFocus();
  props.editorView.dispatch({
    changes: { from: line.from, to },
    selection: { anchor: line.from },
    scrollIntoView: true,
  });
  props.editorView.focus();
};

const hasHardLineBreak = (value: string): boolean => value.includes(NEWLINE);

const navigateFromSingleSourceLine = async (
  textArea: HTMLTextAreaElement,
  key: 'ArrowUp' | 'ArrowDown',
): Promise<void> => {
  skipBlurCommit();

  if (key === 'ArrowUp') {
    await moveUp(textArea);
    return;
  }

  await moveDown(textArea);
};

const navigateAfterNativeArrow = (
  textArea: HTMLTextAreaElement,
  key: 'ArrowUp' | 'ArrowDown',
  selectionStart: number,
  selectionEnd: number,
): void => {
  requestAnimationFrame(() => {
    if (document.activeElement !== textArea) return;

    const selectionChanged =
      textArea.selectionStart !== selectionStart || textArea.selectionEnd !== selectionEnd;
    if (selectionChanged) return;
    if (key === 'ArrowUp') return;

    skipBlurCommit();
    void moveDown(textArea);
  });
};

const handleKeydown = async (event: KeyboardEvent): Promise<void> => {
  if (!(event.target instanceof HTMLTextAreaElement)) return;

  if ((event.key === 'Backspace' || event.key === 'Delete') && event.target.value.trim() === '') {
    event.preventDefault();
    skipBlurCommit();
    deleteKeyword();
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    skipBlurCommit();
    commitAndFocusEditorLineAfterTitle(event.target);
    return;
  }

  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

  if (!hasHardLineBreak(event.target.value)) {
    event.preventDefault();
    await navigateFromSingleSourceLine(event.target, event.key);
    return;
  }

  navigateAfterNativeArrow(
    event.target,
    event.key,
    event.target.selectionStart,
    event.target.selectionEnd,
  );
};

const commit = (event: Event): void => {
  if (!(event.target instanceof HTMLTextAreaElement)) return;
  if (shouldSkipBlurCommit.value) {
    shouldSkipBlurCommit.value = false;
    return;
  }
  commitValue(event.target);
};

const focusTitleTextArea = (position: 'start' | 'end'): boolean => {
  textAreaRef.value?.focusAt(position);
  return true;
};

onMounted(() => {
  unregisterWidget = getEmbeddedWidgetBridge(props.editorView).register({
    id: titleWidgetId.value,
    getRange: () => titleRange.value,
    focus: ({ position }) => focusTitleTextArea(position),
  });

  const skipped = skippedAutoFocusPositions.delete(props.node.start);
  const selectionInside = isEditorSelectionInsideKeyword();
  if (skipped) return;
  if (!selectionInside) return;
  requestAnimationFrame(() => textAreaRef.value?.focusEnd());
});

onBeforeUnmount(() => {
  unregisterWidget?.();
});
</script>

<style lang="scss" scoped>
.keyword-editor {
  @include flexify(center);

  padding: var(--padding-xs) var(--padding-sm);
  width: 100%;

  .input {
    flex: 1;
    min-width: 0;
    color: var(--fg);
    background: transparent;
    border: none;
    padding: 0;
  }

  .text {
    width: 100%;
    color: var(--fg);
  }

  .empty-text {
    color: var(--fg-muted);
    font-style: italic;
  }

  &.title-editor {
    .input,
    .text {
      font-size: 2rem;
      font-weight: var(--headline-font-weight);
      font-family: var(--headline-font-family);
      line-height: var(--editor-headline-line-height);
    }
  }
}
</style>
