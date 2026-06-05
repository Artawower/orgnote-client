<template>
  <app-flex
    column
    start
    align-stretch
    gap="md"
    class="editor"
    :class="{ fullsize: store.fullSize }"
  >
    <app-flex row align-center gap="sm">
      <org-priority-mark
        v-if="store.priority"
        :priority="store.priority"
        @click="openPriorityCompletion"
      />
      <action-button v-else icon="sym_o_flag" size="sm" @click="openPriorityCompletion" />
      <org-inline-editor
        v-model="store.title"
        :single-line="true"
        :prevent-focus-scroll="true"
        autofocus
        class="title"
        :placeholder="titlePlaceholder"
      />
      <action-button icon="close" size="sm" @click="closeEditor" />
    </app-flex>

    <org-tags v-if="store.tags.length" :tags="store.tags" />

    <div class="body">
      <org-inline-editor
        v-model="store.body"
        :prevent-focus-scroll="true"
        class="body-editor"
        :placeholder="bodyPlaceholder"
        @tag-click="onBodyTagClick"
        @priority-click="openPriorityCompletion"
      />
    </div>

    <app-flex row between align-center class="footer">
      <app-flex row align-center gap="sm">
        <action-button icon="sym_o_label" size="sm" @click="openTagCompletion" />
        <slot name="footer-actions" />
        <action-button
          v-if="mode === 'create'"
          icon="sym_o_check"
          size="sm"
          :disabled="!store.title.trim()"
          @click="submit"
        />
      </app-flex>

      <action-button
        :icon="store.scheduledDate ? undefined : 'sym_o_calendar_today'"
        size="sm"
        :auto-width="!!store.scheduledDate"
        :active="!!store.scheduledDate"
        @click="toggleDatePicker"
      >
        <template v-if="store.scheduledDate" #text>
          <span>{{ formatOrgDateLabel(store.scheduledDate, t) }}</span>
        </template>
      </action-button>
    </app-flex>

    <date-picker-sheet
      v-if="showDatePicker"
      v-model="store.scheduledDate"
      @update:model-value="showDatePicker = false"
    />
  </app-flex>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { isNullable } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import AppFlex from 'src/components/AppFlex.vue';
import ActionButton from 'src/components/ActionButton.vue';
import OrgTags from 'src/components/org-nodes/OrgTags.vue';
import OrgInlineEditor from 'src/components/OrgInlineEditor.vue';
import OrgPriorityMark from 'src/components/OrgPriorityMark.vue';
import DatePickerSheet from 'src/components/DatePickerSheet.vue';
import { openOrgPriorityCompletion } from 'src/utils/org-priority-completion';
import { openOrgTagCompletion } from 'src/utils/org-tag-completion';
import { formatOrgDateLabel } from 'src/utils/format-org-date';
import { useMiniEditorStore, consumeIosCarrier } from './mini-editor-store';
import type { MiniEditorSession } from './types';

defineProps<{
  mode: 'create' | 'edit';
  titlePlaceholder?: string;
  bodyPlaceholder?: string;
}>();

const emit = defineEmits<{
  submit: [payload: Omit<MiniEditorSession, 'bodyLoaded' | 'fullSize'>];
}>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const store = useMiniEditorStore();
const showDatePicker = ref(false);

onMounted(() => {
  // ModalDialog focuses the [autofocus] editor; here we just release the iOS
  // keyboard carrier in a rAF, after focus has moved to the editor.
  const carrier = consumeIosCarrier();
  requestAnimationFrame(() => carrier?.remove());
});

const toPayload = () => ({
  title: store.title,
  body: store.body,
  tags: store.tags,
  priority: store.priority,
  scheduledDate: store.scheduledDate,
});

const openPriorityCompletion = async (): Promise<void> => {
  const result = await openOrgPriorityCompletion(api, t);
  if (isNullable(result)) return;
  store.priority = result || undefined;
};

const openTagCompletion = async (): Promise<void> => {
  const result = await openOrgTagCompletion(api, t);
  if (isNullable(result)) return;
  if (!store.tags.includes(result)) store.tags.push(result);
};

const onBodyTagClick = async ({
  tag,
  replaceWith,
}: {
  tag: string;
  replaceWith: (newText: string) => void;
}): Promise<void> => {
  const result = await openOrgTagCompletion(api, t, tag);
  if (isNullable(result)) return;
  replaceWith(result);
};

const toggleDatePicker = (): void => {
  showDatePicker.value = !showDatePicker.value;
};

const closeEditor = (): void => {
  api.ui.useModal().close();
};

const submit = (): void => {
  if (!store.title.trim()) return;
  emit('submit', toPayload());
};
</script>

<style lang="scss" scoped>
.editor {
  padding: var(--padding-lg);
  padding-bottom: calc(var(--safe-area-bottom, 0px) + var(--padding-lg));

  &.fullsize {
    flex: 1;
    min-height: 0;
    padding-top: calc(var(--app-top-inset, 0px) + var(--padding-lg));
  }
}

.title {
  flex: 1;
  min-width: 0;
}

.body {
  flex: 0 0 auto;
  min-height: var(--mini-editor-body-height, 80px);
  max-height: var(--mini-editor-body-height, 80px);
  overflow: hidden;

  .fullsize & {
    flex: 1;
    min-height: 0;
    max-height: none;
  }
}

.body-editor {
  height: 100%;
  --org-inline-max-height: none;

  :deep(.cm-editor) {
    height: 100%;
    max-height: none;
  }
}

.footer {
  flex-shrink: 0;
  padding-top: var(--padding-sm);
  border-top: 1px solid var(--separator);
}
</style>
