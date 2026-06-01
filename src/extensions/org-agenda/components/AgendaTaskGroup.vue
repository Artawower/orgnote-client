<template>
  <app-spoiler default-expanded variant="card-static">
    <template #title>
      <app-flex row between align-center gap="sm">
        <app-title :level="5" no-margin>{{ group.fileTitle }}</app-title>
        <app-badge :label="String(group.tasks.length)" size="xs" />
      </app-flex>
    </template>
    <template #body>
      <template v-for="task in group.tasks" :key="task.id">
        <agenda-task-row
          :task="task"
          :expanded="expandedTaskId === task.id"
          @toggle="onTaskToggle(task)"
          @open-note="$emit('task-click', task, group.filePath)"
          @edit-title="(title) => $emit('task-edit-title', task, group.filePath, title)"
          @edit-priority="(priority) => $emit('task-edit-priority', task, group.filePath, priority)"
          @edit-tags="(tags) => $emit('task-edit-tags', task, group.filePath, tags)"
          @edit-scheduled="(date) => $emit('task-edit-scheduled', task, group.filePath, date)"
          @edit-expand="onEditExpand(task)"
        />
        <card-wrapper v-if="expandedTaskId === task.id" class="edit-form" border padding>
          <agenda-task-form
            v-model:title="editDraft.title"
            v-model:body="editDraft.body"
            :show-title-row="false"
            :hide-submit="true"
            @cancel="expandedTaskId = null"
            @body-blur="onBodyBlur(task)"
          />
        </card-wrapper>
      </template>
    </template>
  </app-spoiler>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useAgendaMiniEditor } from '../composables/use-agenda-mini-editor';
import AppSpoiler from 'src/components/AppSpoiler.vue';
import AppTitle from 'src/components/AppTitle.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppBadge from 'src/components/AppBadge.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import AgendaTaskRow from './AgendaTaskRow.vue';
import AgendaTaskForm from './AgendaTaskForm.vue';
import type { AgendaTaskView } from '../composables/use-agenda-tasks';
import type { AgendaTaskGroup } from '../composables/use-agenda-tasks';
import type { AgendaTaskDraft } from '../types';
import { buildTaskEditorTitle } from 'src/utils/org-editor/build-task-title';
import { api } from 'src/boot/api';
import { uint8ArrayToText, to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import { getTaskBody } from '../utils/get-task-body';

const props = defineProps<{ group: AgendaTaskGroup }>();
const emit = defineEmits<{
  'task-click': [task: AgendaTaskView, filePath: string];
  'task-toggle': [task: AgendaTaskView, filePath: string];
  'task-edit-title': [task: AgendaTaskView, filePath: string, title: string];
  'task-edit-priority': [task: AgendaTaskView, filePath: string, priority: string | undefined];
  'task-edit-tags': [task: AgendaTaskView, filePath: string, tags: string[]];
  'task-edit-scheduled': [task: AgendaTaskView, filePath: string, date: string | undefined];
  'task-edit-save': [task: AgendaTaskView, filePath: string, draft: AgendaTaskDraft];
}>();

const { openEdit } = useAgendaMiniEditor();
const { tabletBelow } = api.ui.useScreenDetection();

const expandedTaskId = ref<string | null>(null);

const editDraft = reactive<AgendaTaskDraft>({
  title: '',
  body: '',
  tags: [],
  priority: undefined,
  scheduledDate: undefined,
});

const onTaskToggle = (task: AgendaTaskView): void => {
  emit('task-toggle', task, props.group.filePath);
};

const onEditExpand = async (task: AgendaTaskView): Promise<void> => {
  if (tabletBelow.value) {
    openEdit(task, props.group.filePath);
    return;
  }

  if (expandedTaskId.value === task.id) {
    expandedTaskId.value = null;
    return;
  }

  const targetId = task.id;
  expandedTaskId.value = targetId;
  editDraft.title = buildTaskEditorTitle(task.text, task.priority);
  editDraft.body = '';
  editDraft.scheduledDate = task.scheduled?.date;

  if (task.start === undefined) return;
  const result = await to(api.core.useFileContent().read)(props.group.filePath);
  if (expandedTaskId.value !== targetId) return;
  if (result.isErr()) {
    reporter.reportError(result.error);
    return;
  }
  editDraft.body = getTaskBody(uint8ArrayToText(result.value), task.start);
};

const onBodyBlur = (task: AgendaTaskView): void => {
  emit('task-edit-save', task, props.group.filePath, { ...editDraft });
};
</script>

<style lang="scss" scoped>
:deep(.spoiler-body) {
  padding: 0;
}

.edit-form {
  border-top: var(--border-default);
  border-radius: 0;
}
</style>
