<template>
  <hoverable-area class="keyword-editor" :class="variantClass" bordered>
    <app-text-area
      v-if="!readonly"
      class="input"
      :model-value="value"
      :placeholder="placeholder"
      :rows="rows"
      @keydown.enter.prevent="commit"
      @blur="commit"
    />
    <span v-else class="text" :class="{ 'empty-text': !value }">
      {{ value || placeholder }}
    </span>
  </hoverable-area>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { OrgNode } from 'org-mode-ast';
import { useI18n } from 'vue-i18n';
import { I18N } from 'orgnote-api';
import AppTextArea from 'src/components/AppTextArea.vue';
import HoverableArea from 'src/components/HoverableArea.vue';
import { getKeywordValue } from './utils';

type EditorVariant = 'title' | 'description';

interface VariantConfig {
  placeholder: string;
  rows: number;
}

const VARIANT_CONFIG: Record<EditorVariant, VariantConfig> = {
  title: { placeholder: I18N.UNTITLED, rows: 1 },
  description: { placeholder: I18N.EMPTY_VALUE_PLACEHOLDER, rows: 2 },
};

const props = withDefaults(
  defineProps<{
    node: OrgNode;
    variant: EditorVariant;
    readonly?: boolean;
    onUpdate?: (value: string) => void;
  }>(),
  { readonly: false },
);

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const value = computed(() => getKeywordValue(props.node));
const config = computed(() => VARIANT_CONFIG[props.variant]);
const placeholder = computed(() => t(config.value.placeholder));
const rows = computed(() => config.value.rows);
const variantClass = computed(() => `${props.variant}-editor`);

const prefix = computed(() => props.node.children?.first?.value ?? '');

const buildLine = (next: string): string => {
  const trimmed = next.trim();
  if (!trimmed) return prefix.value;
  return prefix.value.endsWith(' ') ? `${prefix.value}${trimmed}` : `${prefix.value} ${trimmed}`;
};

const commit = (event: Event): void => {
  if (!(event.target instanceof HTMLTextAreaElement)) return;
  const next = event.target.value;
  if (next === value.value) return;
  props.onUpdate?.(buildLine(next));
};
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

  &.description-editor {
    .input,
    .text {
      font-size: var(--font-size-md);
      line-height: 1.5;
    }
  }
}
</style>
