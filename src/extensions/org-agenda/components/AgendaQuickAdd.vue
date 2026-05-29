<template>
  <card-wrapper border class="quick-add" :class="{ expanded: isExpanded }">
    <agenda-task-form
      v-model:title="draft.title"
      v-model:body="draft.body"
      :show-body="isExpanded"
      :title-placeholder="t(i18nKeys.orgAgendaQuickAddPlaceholder, { target: inboxLabel })"
      :loading="loading"
      @submit="submitTask"
      @cancel="onFormCancel"
      @expand="expand"
      @update:title="onTitleInput"
    >
      <template #before-title>
        <app-badge
          :label="targetLabel"
          color="accent"
          size="xs"
          class="target-badge"
          @click="openFileCompletion"
        />
      </template>

      <template #title-actions>
        <agenda-date-button
          v-model="draft.scheduledDate"
          @update:model-value="onDateChange"
        />
      </template>

      <template #toolbar-start>
        <action-button
          icon="sym_o_inbox"
          size="sm"
          :aria-label="t(i18nKeys.orgAgendaQuickAddTargetTooltip)"
          @click="openFileCompletion"
        />
      </template>

      <template #toolbar-end>
        <span class="hint">{{ t(i18nKeys.orgAgendaQuickAddShortcutHint) }}</span>
      </template>
    </agenda-task-form>
  </card-wrapper>
</template>

<script lang="ts" setup>
import { computed, nextTick, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format } from 'date-fns';

import type { DiskFile } from 'orgnote-api';
import CardWrapper from 'src/components/CardWrapper.vue';
import AppBadge from 'src/components/AppBadge.vue';
import ActionButton from 'src/components/ActionButton.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { api } from 'src/boot/api';
import { createAgendaFilesGetter } from '../utils/agenda-files-completion';
import { parseQuickAddInput } from '../utils/parse-quick-add-input';
import type { CreateTaskInput } from '../mutations/create-task';
import type { AgendaTaskDraft } from '../types';
import AgendaTaskForm from './AgendaTaskForm.vue';
import AgendaDateButton from './AgendaDateButton.vue';
import {
  extractPriorityFromTitle,
  removePriorityFromTitle,
} from 'src/utils/org-editor/org-title-parser';
import { fileBaseName } from 'src/utils/file-path';

interface Props {
  agendaFilesPath: string;
  inboxFilePath: string;
  knownFiles?: string[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), { loading: false, knownFiles: () => [] });

const emit = defineEmits<{
  submit: [payload: CreateTaskInput & { targetFile?: string }];
}>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const isExpanded = ref(false);
const targetFile = ref<string | undefined>();
const isTildeCompletionOpen = ref(false);
const formRef = ref<InstanceType<typeof AgendaTaskForm> | null>(null);

const todayIsoDate = (): string => format(new Date(), 'yyyy-MM-dd');

const lastUserSelectedDate = ref<string | null>(null);

const draft = reactive<AgendaTaskDraft>({ title: '', body: '', scheduledDate: todayIsoDate() });

const inboxLabel = computed(() => fileBaseName(props.inboxFilePath));

const targetLabel = computed(() =>
  targetFile.value ? fileBaseName(targetFile.value) : inboxLabel.value,
);

const expand = async (): Promise<void> => {
  isExpanded.value = true;
  await nextTick();
  await nextTick();
  formRef.value?.focusBody();
};

const openFileCompletion = async (): Promise<void> => {
  const getter = createAgendaFilesGetter(api, props.agendaFilesPath, inboxLabel.value);
  const result = await api.core.useCompletion().open<DiskFile, string>({
    type: 'choice',
    placeholder: t(i18nKeys.orgAgendaQuickAddTargetPlaceholder),
    itemsGetter: getter,
  });
  if (!result) return;
  targetFile.value = result;
  formRef.value?.focusTitle();
};

const openFileCompletionFromTilde = async (tildeIdx: number): Promise<void> => {
  const originalTitle = draft.title;
  const fragment = draft.title.slice(tildeIdx + 1);
  const getter = createAgendaFilesGetter(api, props.agendaFilesPath, inboxLabel.value);
  const result = await api.core.useCompletion().open<DiskFile, string>({
    type: 'choice',
    placeholder: t(i18nKeys.orgAgendaQuickAddTargetPlaceholder),
    itemsGetter: getter,
    searchText: fragment,
  });
  if (!result) {
    draft.title = originalTitle;
    formRef.value?.focusTitle();
    return;
  }
  draft.title = draft.title.slice(0, tildeIdx).trimEnd();
  targetFile.value = result;
  formRef.value?.focusTitle();
};

const onTitleInput = (): void => {
  if (isTildeCompletionOpen.value) return;
  const tildeIdx = draft.title.indexOf('~');
  if (tildeIdx === -1) return;
  isTildeCompletionOpen.value = true;
  openFileCompletionFromTilde(tildeIdx).finally(() => {
    isTildeCompletionOpen.value = false;
  });
};

const buildPayload = (): CreateTaskInput & { targetFile?: string } => {
  const rawTitle = removePriorityFromTitle(draft.title);
  const parsed = parseQuickAddInput(rawTitle, props.knownFiles);
  const resolvedTarget = targetFile.value ?? parsed.targetFile;
  const body = draft.body.trim() || parsed.body;
  const priority = extractPriorityFromTitle(draft.title)?.letter;
  return {
    title: parsed.title,
    ...(body ? { body } : {}),
    ...(draft.scheduledDate ? { scheduledDate: draft.scheduledDate } : {}),
    ...(resolvedTarget ? { targetFile: resolvedTarget } : {}),
    ...(priority ? { priority } : {}),
  };
};

const onDateChange = (date: string | undefined): void => {
  lastUserSelectedDate.value = date ?? null;
};

const resetState = (): void => {
  draft.title = '';
  draft.body = '';
  draft.scheduledDate = lastUserSelectedDate.value ?? todayIsoDate();
  isExpanded.value = false;
  targetFile.value = undefined;
};

const submitTask = (): void => {
  const payload = buildPayload();
  if (!payload.title.trim()) return;
  emit('submit', payload);
  resetState();
  formRef.value?.focusTitle();
};

const onFormCancel = (): void => {
  if (isExpanded.value) {
    isExpanded.value = false;
    return;
  }
  formRef.value?.blurTitle();
};
</script>

<style lang="scss" scoped>
.quick-add {
  padding: var(--padding-sm) var(--padding-md);
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: var(--accent);
  }
}

.target-badge {
  cursor: pointer;
  flex-shrink: 0;
}

.date-trigger {
  display: inline-flex;
  cursor: pointer;
}

.hint {
  font-size: var(--font-size-xs);
  color: var(--fg-muted);
}
</style>
