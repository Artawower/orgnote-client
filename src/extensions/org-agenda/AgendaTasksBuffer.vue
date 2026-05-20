<template>
  <app-buffer-content>
    <container-layout class="agenda-buffer" :body-scroll="true" gap="sm">
      <template #header>
        <agenda-quick-add
          :agenda-files-path="agendaConfig.agendaFilesPath ?? '/'"
          :inbox-file-path="resolvedInboxPath"
          :known-files="knownOrgFiles"
          :loading="quickAddLoading"
          @submit="onQuickAddSubmit"
        />
      </template>
      <template #body>
        <loading-dots v-if="loading" />
        <empty-state
          v-else-if="!groups.length"
          icon="sym_o_checklist"
          :title="t(extensionI18nKeys.orgAgendaNoTasksTitle)"
          :description="t(extensionI18nKeys.orgAgendaNoTasksDescription)"
        />
        <app-flex v-else column start align-stretch gap="sm">
          <agenda-task-group
            v-for="group in groups"
            :key="group.filePath"
            :group="group"
            @task-click="openNote"
            @task-toggle="toggleTask"
            @task-edit-title="editTaskTitle"
            @task-edit-priority="editTaskPriority"
            @task-edit-tags="editTaskTags"
            @task-edit-scheduled="editTaskScheduled"
            @task-edit-save="editTaskSave"
          />
        </app-flex>
      </template>
    </container-layout>
  </app-buffer-content>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { join } from 'orgnote-api';
import { textToUint8Array, to, uint8ArrayToText } from 'orgnote-api/utils';
import AppFlex from 'src/components/AppFlex.vue';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import EmptyState from 'src/components/EmptyState.vue';
import LoadingDots from 'src/components/LoadingDots.vue';
import AppBufferContent from 'src/components/AppBufferContent.vue';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import AgendaTaskGroup from './components/AgendaTaskGroup.vue';
import { useAgendaTasks } from './composables/use-agenda-tasks';
import type { AgendaTaskView } from './composables/use-agenda-tasks';
import { completeTask } from './mutations/complete-task';
import { completeRepeatingTask } from './mutations/complete-repeating-task';
import { reopenTask } from './mutations/reopen-task';
import { undoRecurringCompletion } from './mutations/undo-recurring-completion';
import { useI18n } from 'vue-i18n';
import { extensionI18nKeys } from 'src/constants/extension-i18n-keys';
import type { FileTask } from 'orgnote-api';
import { hasRepeater, isCompletedOn } from './utils/agenda-filters';
import AgendaQuickAdd from './components/AgendaQuickAdd.vue';
import { useAgendaTasksStore } from './stores/agenda-tasks-store';
import { AGENDA_DEFAULT_INBOX_FILENAME } from './constants';
import type { CreateTaskInput } from './mutations/create-task';
import { openNoteAtPosition } from 'src/utils/editor-navigation';
import { changeTaskTitle } from './mutations/task-title';
import { changeTaskPriority } from './mutations/task-priority';
import { changeTaskTags } from './mutations/task-tags';
import { changeTaskScheduled } from './mutations/task-scheduled';
import { changeTaskBody } from './mutations/task-body';
import type { AgendaTaskDraft } from './types';
import {
  extractPriorityFromTitle,
  removePriorityFromTitle,
} from 'src/utils/org-editor/org-title-parser';
import { fileBaseName } from 'src/utils/file-path';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const { loading, groups } = useAgendaTasks();
const fileContent = api.core.useFileContent();
const tasksStore = useAgendaTasksStore();
const agendaConfig = tasksStore.agendaConfig;
const quickAddLoading = ref(false);

const knownOrgFiles = computed(() => tasksStore.agendaFiles.map((f) => join('/', ...f.filePath)));

const resolvedInboxPath = computed(() => {
  if (agendaConfig.inboxFilePath) return agendaConfig.inboxFilePath;
  const base = agendaConfig.agendaFilesPath ?? '/';
  return join(base, AGENDA_DEFAULT_INBOX_FILENAME);
});

const onQuickAddSubmit = async (
  payload: CreateTaskInput & { targetFile?: string },
): Promise<void> => {
  quickAddLoading.value = true;
  const ok = await tasksStore.createTaskInFile(payload);
  quickAddLoading.value = false;
  if (!ok) return;
  const effectiveTarget = payload.targetFile ?? resolvedInboxPath.value;
  const label = fileBaseName(effectiveTarget);
  api.core.useNotifications().notify({
    message: t(extensionI18nKeys.orgAgendaQuickAddToastAdded, { target: label }),
    level: 'info',
  });
};

const isSameLocalDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const resolveCompletedAt = (viewDate: Date): Date => {
  const now = new Date();
  return isSameLocalDay(viewDate, now) ? now : viewDate;
};

const findDoneDateForView = (task: AgendaTaskView): string | undefined =>
  task.doneDates?.find((doneDate) =>
    isCompletedOn({ ...task, doneDates: [doneDate] }, task.viewDate),
  );

const applyToggle = (task: AgendaTaskView, content: string): string => {
  if (task.start === undefined) return content;
  const completedAt = resolveCompletedAt(task.viewDate);
  const completedOnViewDate = isCompletedOn(task, task.viewDate);
  const doneDate = findDoneDateForView(task);
  if (completedOnViewDate && hasRepeater(task) && doneDate) {
    return undoRecurringCompletion(content, task.start, doneDate);
  }
  if (task.state === 'done') return reopenTask(content, task.start);
  if (hasRepeater(task)) return completeRepeatingTask(content, task.start, completedAt);
  return completeTask(content, task.start, completedAt);
};

const toggleTask = async (task: AgendaTaskView, filePath: string): Promise<void> => {
  if (task.start === undefined) return;
  const readResult = await to(fileContent.read, 'Failed to read file')(filePath);
  if (readResult.isErr()) {
    reporter.reportError(readResult.error);
    return;
  }
  const content = uint8ArrayToText(readResult.value);
  const nextContent = to(applyToggle, 'Failed to apply agenda mutation')(task, content);
  if (nextContent.isErr()) {
    reporter.reportError(nextContent.error);
    return;
  }
  if (nextContent.value === content) return;
  const writeResult = await to(fileContent.write, 'Failed to write file')(
    filePath,
    textToUint8Array(nextContent.value),
  );
  if (writeResult.isErr()) reporter.reportError(writeResult.error);
};

const applyTaskMutation = async (
  task: AgendaTaskView,
  filePath: string,
  mutation: (content: string) => string,
): Promise<void> => {
  if (task.start === undefined) return;
  const readResult = await to(fileContent.read, 'Failed to read file')(filePath);
  if (readResult.isErr()) {
    reporter.reportError(readResult.error);
    return;
  }
  const next = mutation(uint8ArrayToText(readResult.value));
  const writeResult = await to(fileContent.write, 'Failed to write file')(
    filePath,
    textToUint8Array(next),
  );
  if (writeResult.isErr()) reporter.reportError(writeResult.error);
};

const editTaskTitle = (task: AgendaTaskView, filePath: string, title: string): Promise<void> =>
  applyTaskMutation(task, filePath, (c) => changeTaskTitle(c, task.start!, title));

const editTaskPriority = (
  task: AgendaTaskView,
  filePath: string,
  priority: string | undefined,
): Promise<void> =>
  applyTaskMutation(task, filePath, (c) => changeTaskPriority(c, task.start!, priority));

const editTaskTags = (task: AgendaTaskView, filePath: string, tags: string[]): Promise<void> =>
  applyTaskMutation(task, filePath, (c) => changeTaskTags(c, task.start!, tags));

const editTaskScheduled = (
  task: AgendaTaskView,
  filePath: string,
  date: string | undefined,
): Promise<void> =>
  applyTaskMutation(task, filePath, (c) => changeTaskScheduled(c, task.start!, date));

const editTaskSave = async (
  task: AgendaTaskView,
  filePath: string,
  draft: AgendaTaskDraft,
): Promise<void> => {
  const cleanTitle = removePriorityFromTitle(draft.title);
  const priority = extractPriorityFromTitle(draft.title)?.letter;
  const mutations: Array<(c: string) => string> = [];

  if (cleanTitle && cleanTitle !== task.text)
    mutations.push((c) => changeTaskTitle(c, task.start!, cleanTitle));
  if (priority !== task.priority)
    mutations.push((c) => changeTaskPriority(c, task.start!, priority));
  if (draft.scheduledDate !== task.scheduled?.date)
    mutations.push((c) => changeTaskScheduled(c, task.start!, draft.scheduledDate));
  if (draft.body.trim()) mutations.push((c) => changeTaskBody(c, task.start!, draft.body));

  if (!mutations.length) return;
  await applyTaskMutation(task, filePath, (c) => mutations.reduce((acc, fn) => fn(acc), c));
};

const openNote = async (task: FileTask, filePath: string): Promise<void> => {
  const result = await to(() => openNoteAtPosition(api, filePath, task.start))();
  if (result.isErr())
    reporter.reportError(new Error('Failed to open note', { cause: result.error }));
};
</script>

<style lang="scss" scoped>
.agenda-buffer {
  @include fit;
  padding: var(--editor-padding);
}
</style>
