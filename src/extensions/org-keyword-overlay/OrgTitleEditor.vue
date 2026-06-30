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
import { getKeywordValue } from './utils';

const DEFAULT_LINE_HEIGHT_MULTIPLIER = 1.2;
const SINGLE_LINE_HEIGHT_THRESHOLD = 1.35;
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
const prefix = computed(() => props.node.children?.first?.value ?? '');

const normalizeKeywordValue = (next: string): string => next.trim().replace(/\s+/g, ' ');

const buildLine = (next: string): string => {
  const normalized = normalizeKeywordValue(next);
  if (!normalized) return prefix.value;
  return prefix.value.endsWith(' ') ? `${prefix.value}${normalized}` : `${prefix.value} ${normalized}`;
};

const isEditorSelectionInsideKeyword = (): boolean => {
  const head = props.editorView.state.selection.main.head;
  return props.editorView.hasFocus && head >= props.node.start && head <= props.node.end + 1;
};

const waitForWidgetDomUpdate = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const dispatchKeywordUpdate = (next: string, anchor?: number, anchorAssoc = 1): void => {
  const insert = buildLine(next);
  const shouldUpdate = insert !== props.editorView.state.doc.sliceString(props.node.start, props.node.end);
  const changes = shouldUpdate
    ? props.editorView.state.changes({ from: props.node.start, to: props.node.end, insert })
    : undefined;
  const mappedAnchor = anchor !== undefined && changes ? changes.mapPos(anchor, anchorAssoc) : anchor;

  if (!shouldUpdate && mappedAnchor === undefined) return;

  props.editorView.dispatch({
    ...(changes ? { changes } : {}),
    ...(mappedAnchor !== undefined ? { selection: { anchor: mappedAnchor }, scrollIntoView: true } : {}),
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

const titleWidgetId = computed(() => `title:${props.node.start}`);
const titleRange = computed(() => ({ from: props.node.start, to: props.node.end }));

const moveDown = async (textArea: HTMLTextAreaElement): Promise<void> => {
  suppressNextAutoFocus();
  dispatchKeywordUpdate(textArea.value);
  await waitForWidgetDomUpdate();
  getEmbeddedWidgetBridge(props.editorView).dispatch({
    type: EMBEDDED_WIDGET_COMMAND.Exit,
    payload: {
      sourceId: titleWidgetId.value,
      range: titleRange.value,
      direction: EMBEDDED_WIDGET_DIRECTION.Next,
    },
  });
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

const parsePixelValue = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getLineHeight = (textArea: HTMLTextAreaElement): number => {
  const style = getComputedStyle(textArea);
  const lineHeight = Number.parseFloat(style.lineHeight);
  if (Number.isFinite(lineHeight)) return lineHeight;

  const fontSize = Number.parseFloat(style.fontSize);
  if (Number.isFinite(fontSize)) return fontSize * DEFAULT_LINE_HEIGHT_MULTIPLIER;

  return textArea.clientHeight;
};

const getVerticalPadding = (textArea: HTMLTextAreaElement): number => {
  const style = getComputedStyle(textArea);
  return parsePixelValue(style.paddingTop) + parsePixelValue(style.paddingBottom);
};

const isSingleVisualLine = (textArea: HTMLTextAreaElement): boolean => {
  const contentHeight = Math.max(0, textArea.scrollHeight - getVerticalPadding(textArea));
  return contentHeight <= getLineHeight(textArea) * SINGLE_LINE_HEIGHT_THRESHOLD;
};

const navigateFromSingleLineTextArea = async (
  textArea: HTMLTextAreaElement,
  key: 'ArrowUp' | 'ArrowDown',
): Promise<void> => {
  if (key === 'ArrowUp') return;

  skipBlurCommit();
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
    await moveDown(event.target);
    return;
  }

  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

  const singleLine = isSingleVisualLine(event.target);

  if (singleLine) {
    event.preventDefault();
    await navigateFromSingleLineTextArea(event.target, event.key);
    return;
  }

  navigateAfterNativeArrow(event.target, event.key, event.target.selectionStart, event.target.selectionEnd);
};

const commit = (event: Event): void => {
  if (!(event.target instanceof HTMLTextAreaElement)) return;
  if (shouldSkipBlurCommit.value) {
    shouldSkipBlurCommit.value = false;
    return;
  }
  commitValue(event.target);
};

onMounted(() => {
  unregisterWidget = getEmbeddedWidgetBridge(props.editorView).register({
    id: titleWidgetId.value,
    getRange: () => titleRange.value,
    focus: ({ position }) => {
      textAreaRef.value?.focusAt(position);
      return true;
    },
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
