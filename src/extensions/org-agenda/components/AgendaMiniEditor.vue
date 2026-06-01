<template>
  <div class="mini-editor">
    <div class="mini-editor__title-row">
      <app-badge
        v-if="draft.priority"
        :label="`#${draft.priority}`"
        color="accent"
        size="xs"
        class="priority-chip"
        @click="openPriorityCompletion"
      />
      <action-button v-else icon="sym_o_flag" size="sm" @click="openPriorityCompletion" />
      <app-input
        v-model="draft.title"
        autofocus
        class="mini-editor__title"
        :placeholder="t(i18nKeys.orgAgendaQuickAddPlaceholder, { target: '' }).trim()"
      />
    </div>

    <org-tags v-if="draft.tags.length" :tags="draft.tags" class="mini-editor__tags" />

    <app-text-area
      v-model="draft.body"
      :placeholder="t(i18nKeys.orgAgendaQuickAddBodyPlaceholder)"
    />

    <div class="mini-editor__footer">
      <action-button icon="sym_o_label" size="sm" @click="openTagCompletion" />
      <action-button
        v-if="mode === 'edit' && filePath"
        icon="sym_o_open_in_full"
        size="sm"
        @click="openFullEditor"
      />
      <agenda-date-button v-model="draft.scheduledDate" />
      <div class="mini-editor__footer-spacer" />
      <action-button
        v-if="mode === 'create'"
        icon="sym_o_check"
        size="sm"
        :disabled="!draft.title.trim()"
        @click="submit"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { isNullable } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { debounce } from 'src/utils/debounce';
import AppInput from 'src/components/AppInput.vue';
import AppBadge from 'src/components/AppBadge.vue';
import ActionButton from 'src/components/ActionButton.vue';
import OrgTags from 'src/components/org-nodes/OrgTags.vue';
import AppTextArea from 'src/containers/AppTextArea.vue';
import AgendaDateButton from './AgendaDateButton.vue';
import { openOrgPriorityCompletion } from 'src/utils/org-priority-completion';
import { openOrgTagCompletion } from 'src/utils/org-tag-completion';
import { useAgendaTaskEdit } from '../composables/use-agenda-task-edit';
import type { AgendaTaskView } from '../composables/use-agenda-tasks';
import type { AgendaTaskDraft } from '../types';
import type { CreateTaskInput } from '../mutations/create-task';
import { getTaskBody } from '../utils/get-task-body';
import { uint8ArrayToText, to } from 'orgnote-api/utils';

const props = defineProps<{
  mode: 'create' | 'edit';
  task?: AgendaTaskView;
  filePath?: string;
  defaults?: Partial<AgendaTaskDraft>;
}>();

const emit = defineEmits<{
  submit: [payload: CreateTaskInput];
  close: [];
}>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const { saveTask } = useAgendaTaskEdit();

const draft = reactive<AgendaTaskDraft>({
  title: '',
  body: '',
  tags: [],
  priority: undefined,
  scheduledDate: undefined,
  ...props.defaults,
});

const AUTOSAVE_DELAY = 600;
const isInitializing = ref(true);

const fillDraftFromTask = (task: AgendaTaskView): void => {
  draft.title = task.text ?? '';
  draft.priority = task.priority;
  draft.tags = [...(task.tags ?? [])];
  draft.scheduledDate = task.scheduled?.date;
};

const loadBody = async (): Promise<void> => {
  if (props.task?.start === undefined || !props.filePath) return;
  const result = await to(api.core.useFileContent().read)(props.filePath);
  if (result.isErr()) return;
  draft.body = getTaskBody(uint8ArrayToText(result.value), props.task.start);
};

const autoSave = debounce(async () => {
  if (isInitializing.value) return;
  if (props.mode !== 'edit' || !props.task || !props.filePath) return;
  await saveTask(props.task, props.filePath, { ...draft });
}, AUTOSAVE_DELAY);

onMounted(async () => {
  if (props.mode === 'edit' && props.task) {
    fillDraftFromTask(props.task);
    await loadBody();
  }
  isInitializing.value = false;
});

watch(draft, autoSave, { deep: true });

const openPriorityCompletion = async (): Promise<void> => {
  const result = await openOrgPriorityCompletion(api, t);
  if (isNullable(result)) return;
  draft.priority = result || undefined;
};

const openTagCompletion = async (): Promise<void> => {
  const result = await openOrgTagCompletion(api, t);
  if (isNullable(result)) return;
  if (!draft.tags.includes(result)) draft.tags.push(result);
};

const openFullEditor = (): void => {
  if (!props.filePath) return;
  void api.core.useBufferViewer().open(props.filePath);
};

const submit = (): void => {
  if (!draft.title.trim()) return;
  emit('submit', {
    title: draft.title,
    body: draft.body || undefined,
    tags: draft.tags.length ? draft.tags : undefined,
    priority: draft.priority,
    scheduledDate: draft.scheduledDate,
  } as CreateTaskInput);
};
</script>

<style lang="scss" scoped>
.mini-editor {
  padding: var(--padding-lg);
  padding-bottom: calc(var(--safe-area-bottom, 0px) + var(--padding-lg));
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

.mini-editor__title-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.mini-editor__title {
  flex: 1;
  min-width: 0;
}

.priority-chip {
  cursor: pointer;
  flex-shrink: 0;
}

.mini-editor__footer {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding-top: var(--padding-sm);
  border-top: 1px solid var(--separator);
}

.mini-editor__footer-spacer {
  flex: 1;
}
</style>
